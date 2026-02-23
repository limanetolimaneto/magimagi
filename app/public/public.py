from flask import Blueprint, render_template, request, Response, jsonify, stream_with_context
from datetime import datetime
import queue
import requests
from flask_cors import cross_origin
import subprocess
import shutil
import os
import time
import socket
# import feedparser
# import requests


# ======================================================
# Blueprint & utilities
# ======================================================

# Public blueprint with URL prefix
public_bp = Blueprint('public', __name__, url_prefix='')  

# Caminho absoluto do seu Node app
NODE_PATH = '/home/limanetouser/punilissa/app/static/js/whatsapp/index.js'
# Caminho do log do Node
NODE_LOG = '/home/limanetouser/punilissa/app/static/js/whatsapp/node.log'

qr_queues = {}


# ==============================================================================================
# WHATSAPP-WEB =================================================================================

# STATUS =========================================================
@public_bp.route('/whatsapp/user_status')
@cross_origin()
def user_status():
    user_id = request.args.get('user_id')
    try:
        r = requests.get(
            'http://localhost:3001/whatsapp/user_status',
            params={'user_id': user_id},
            timeout=5
        )
        
        # tenta extrair JSON do Node, mas se falhar, retorna fallback
        try:
            data = r.json()
        except ValueError:
            data = {'connected': False, 'nodeserver': 'on', 'error': 'Node did not return JSON'}
        # print(f"--------------------- teste: {r.json()} ------------")
        return jsonify(data), r.status_code
    except requests.exceptions.RequestException as e:
        # Node offline ou erro de conexão
        return jsonify({'connected': False, 'nodeserver': 'off', 'error': f'Node request failed: {str(e)}'}), 200

# CREATING WHATSAPP CLIENT =======================================
@public_bp.route('/whatsapp/connect_user')
@cross_origin()
def connect_user():
    user_id = request.args.get('user_id')
    try:
        r = requests.get(
            'http://localhost:3001/whatsapp/connect_user',
            params={'user_id': user_id},
            timeout=5
        )
        # tenta extrair JSON do Node, mas se falhar, retorna fallback
        try:
            data = r.json()
        except ValueError:
            data = {'user': 'empty'}

        return jsonify(data), r.status_code
    except requests.exceptions.RequestException as e:
        # Node offline ou erro de conexão
        return jsonify({'user': 'empty','error': f'Node request failed: {str(e)}'}), 200

# CREATING QR CODE ===============================================
def get_qr_queue(user_id):
    if user_id not in qr_queues:
        qr_queues[user_id] = queue.Queue()
    return qr_queues[user_id]

@public_bp.route('/whatsapp/qr_code', methods=['POST'])
@cross_origin()
def receive_qr():
    data = request.json
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id missing'}), 400
    get_qr_queue(user_id).put(data['qr'])
    return '', 204

#  STREAM ========================================================
@public_bp.route('/whatsapp/stream')
@cross_origin()
def stream_qr():
    user_id = request.args.get('user_id')
    if not user_id or user_id not in qr_queues:
        def invalid_stream():
            yield "event: status\ndata: session-removed\n\n"
        return Response(
            invalid_stream(),
            content_type="text/event-stream"
        )

    def event_stream(user_id):
        q = get_qr_queue(user_id)

        # 1️⃣ existe QR pendente? envia imediatamente
        if not q.empty():
            qr = q.get()
            yield f"event: qr\ndata: {qr}\n\n"
        else:
            # 2️⃣ não existe QR ainda
            yield "event: status\ndata: waiting\n\n"

        # 3️⃣ loop contínuo
        while True:
            try:
                qr = q.get(timeout=20)
                yield f"event: qr\ndata: {qr}\n\n"
            except queue.Empty:
                yield "event: status\ndata: keep-alive\n\n"
    # def event_stream(user_id):
    #     q = get_qr_queue(user_id)

    #     # evento inicial obrigatório
    #     yield "data: connected\n\n"

    #     while True:
    #         try:
    #             qr = q.get(timeout=20)
    #             yield f"data: {qr}\n\n"
    #         except queue.Empty:
    #             yield ": keep-alive\n\n"
    return Response(
        stream_with_context(event_stream(user_id)),
        headers={
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        }
    )

# ==============================================================================================
# NODE SERVER ==================================================================================

#  NODE STOP ======================================================
@public_bp.route('/whatsapp/node_stop')
def node_stop():
    try:
        subprocess.run(['fuser', '-k', '3001/tcp'], check=True)
        return jsonify({"stopped": True, "message": "Node stopped successfully"}), 200
    except subprocess.CalledProcessError:
        return jsonify({"stopped": False, "message": "No Node process found"}), 200


# NODE START MAIN FUNCTION ========================================
def wait_node_up(host='127.0.0.1', port=3001, timeout=10):
    start = time.time()
    while True:
        try:
            with socket.create_connection((host, port), timeout=1):
                break  # Node subiu
        except (ConnectionRefusedError, OSError):
            if time.time() - start > timeout:
                raise TimeoutError("Node did not start in time")
            time.sleep(0.5)

@public_bp.route('/whatsapp/node_start')
def node_start():
    if is_node_running_socket():
        return jsonify({"running": True, "message": "Node is already running"}), 200

    """Inicia Node desacoplado do Flask"""
    subprocess.Popen(
        ['node', NODE_PATH],
        stdout=open(NODE_LOG, 'a'),
        stderr=subprocess.STDOUT,
        start_new_session=True
    )

    try:
        wait_node_up()
        return jsonify({"running": True, "message": "Node started successfully"}), 200
    except TimeoutError:
        return jsonify({"running": False, "message": "Node failed to start in time"}), 500


# NODE STATUS ======================================================
def is_node_running_socket(host='127.0.0.1', port=3001, timeout=1):
    """Verifica se o Node está aceitando conexões na porta"""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (ConnectionRefusedError, OSError):
        return False

@public_bp.route('/whatsapp/node_status')
def node_status():
    """Endpoint para verificar se o Node está rodando via socket"""
    running = is_node_running_socket()
    if running:
        return jsonify({"running": True, "message": "Node is running"}), 200
    else:
        return jsonify({"running": False, "message": "Node is not running"}), 200


# ========================================


# @public_bp.route('/whatsapp/connect', methods=['POST'])
# def whatsapp_connect_proxy():
#     data = request.json
#     # Encaminha para o Node local
#     r = requests.post('http://localhost:3001/whatsapp/connect', json=data, timeout=5)
#     return Response(r.content, status=r.status_code, content_type=r.headers['Content-Type'])





# def get_qr_queue(user_id):
    if user_id not in qr_queues:
        qr_queues[user_id] = queue.Queue()
    return qr_queues[user_id]


# DISCONNECT + CLEAN QUEUES + REVOME SESSION =======================
def remove_session_dir(user_id):
    path = f"/home/limanetouser/punilissa/app/static/js/whatsapp/session_{user_id}"
    if os.path.exists(path):
        shutil.rmtree(path)
        print(f"Diretório de sessão do user {user_id} removido")
    else:
        print(f"Diretório {path} não existe")

def clear_qr_queue(user_id):
    if user_id in qr_queues:
        q = qr_queues[user_id]
        while not q.empty():
            q.get()  # remove cada item
        print(f"Fila de QR do user {user_id} limpa")

@public_bp.route('/whatsapp/disconnect_user', methods=['GET'])
@cross_origin()
def whatsapp_disconnect():
    user_id = request.args.get('user_id')
    try:
        r = requests.get(
            'http://localhost:3001/whatsapp/disconnect_user',
            params={'user_id': user_id},
            timeout=5
        )
        try:
            data = r.json()
            clear_qr_queue(user_id)
            remove_session_dir(user_id)  
        except ValueError:
            data = {'status': 'disconnected', 'error': 'Node did not return JSON'}
        return jsonify(data), 200
    except requests.exceptions.RequestException as e:
        return jsonify({'status': 'disconnected', 'error': f'Node request failed: {str(e)}'}), 200


# @public_bp.route('/whatsapp/restart-node', methods=['POST'])
# @cross_origin()
# def restart_node():
#     try:
#         # 1. Mata Node antigo (somente o app)
#         for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
#             if (
#                 proc.info['name']
#                 and 'node' in proc.info['name'].lower()
#                 and proc.info['cmdline']
#                 and NODE_PATH in ' '.join(proc.info['cmdline'])
#             ):
#                 print(f"Matando Node PID {proc.pid}")

#                 proc.kill()

#         # 2. Inicia Node desacoplado do terminal
#         with open(NODE_LOG, 'a') as log_file:
#             subprocess.Popen(
#                 ['node', NODE_PATH],
#                 stdout=log_file,
#                 stderr=subprocess.STDOUT,
#                 start_new_session=True
#             )
#         print("Node iniciado com sucesso")

#         return jsonify({'message': 'Node server restarted/started'})

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500


# def is_node_running():
#     """Verifica se algum processo Node está rodando na porta 3001"""
#     for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
#         if proc.info['name'] and 'node' in proc.info['name'].lower():
#             if NODE_PATH in ' '.join(proc.info['cmdline']):
#                 return True
#     return False






# ======================================================
# Home page
# ======================================================

@public_bp.route('/')
def homePage():
    """
    Render the home page.
    """
    return render_template('home.html')

# ======================================================
# Utility functions
# ======================================================

def format_date(date_str):
    """
    Convert date string from 'YYYY-MM-DD' to 'DD/MM/YYYY'.
    Used as a Jinja filter.
    """
    if date_str:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        return dt.strftime("%d/%m/%Y")
    return ''



# RSS = 
# @public_bp.route('/hr-news')
# def hr_news():
#     feed_url = "https://www.bizcommunity.com/rss/1/0"
#     headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
#     response = requests.get(feed_url, headers=headers)
#     feed = feedparser.parse(response.content)
#     items = []
#     for entry in feed.entries[:5]:
#         title = entry.title
#         link = entry.link
#         published = entry.get("published", "")
#         items.append({"title": title, "link": link, "published": published})
    
#     return jsonify({"items": items})
