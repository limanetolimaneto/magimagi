from flask import Blueprint, render_template, request, Response, jsonify
from datetime import datetime
import queue
import requests
from flask_cors import cross_origin
import subprocess
import psutil
import os
import time
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



@public_bp.route('/whatsapp/connect', methods=['POST'])
def whatsapp_connect_proxy():
    data = request.json
    # Encaminha para o Node local
    r = requests.post('http://localhost:3001/whatsapp/connect', json=data, timeout=5)
    return Response(r.content, status=r.status_code, content_type=r.headers['Content-Type'])



qr_queues = {}

def get_qr_queue(user_id):
    if user_id not in qr_queues:
        qr_queues[user_id] = queue.Queue()
    return qr_queues[user_id]

@public_bp.route('/whatsapp/qr', methods=['POST'])
@cross_origin()
def receive_qr():
    data = request.json
    user_id = request.args.get('user_id')
    get_qr_queue(user_id).put(data['qr'])
    return '', 204

@public_bp.route('/whatsapp/stream')
@cross_origin()
def stream_qr():
    user_id = request.args.get('user_id')
    q = get_qr_queue(user_id)

    def event_stream():
        while True:
            qr = q.get()
            yield f"data: {qr}\n\n"
            yield ": keep-alive\n\n"

    return Response(event_stream(), headers={
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
    })

@public_bp.route('/whatsapp/status', methods=['GET'])
@cross_origin()
def whatsapp_status():
    user_id = request.args.get('user_id')
    try:
        r = requests.get(
            'http://localhost:3001/whatsapp/status',
            params={'user_id': user_id},
            timeout=5
        )
        # tenta extrair JSON do Node, mas se falhar, retorna fallback
        try:
            data = r.json()
        except ValueError:
            data = {'connected': False, 'nodeserver': 'on', 'error': 'Node did not return JSON'}

        return jsonify(data), r.status_code
    except requests.exceptions.RequestException as e:
        # Node offline ou erro de conexão
        return jsonify({'connected': False, 'nodeserver': 'off', 'error': f'Node request failed: {str(e)}'}), 200


@public_bp.route('/whatsapp/disconnect', methods=['GET'])
@cross_origin()
def whatsapp_disconnect():
    user_id = request.args.get('user_id')
    print(user_id)
    if not is_node_running():
        start_node()
    try:
        print('getado')
        if user_id:
            try:
                r = requests.get(
                    'http://localhost:3001/whatsapp/disconnect',
                    params={'user_id': user_id},
                    timeout=5
                )
                print('getado 2')  # só vai imprimir se Node estiver online
                try:
                    data = r.json()
                except ValueError:
                    data = {'status': 'disconnected', 'error': 'Node did not return JSON'}
                    print(r)
            except requests.exceptions.RequestException as e:
                print('Node offline ou erro na requisição:', e)
                data = {'status': 'disconnected', 'error': f'Node request failed: {str(e)}'}
        else:        
            data = {'status': 'disconnected', 'error': 'Node did not return user_id'}
        return jsonify(data), 200
    except requests.exceptions.RequestException as e:
        # Node offline → retorna sempre JSON previsível
        return jsonify({'status': 'disconnected', 'error': f'Node request failed: {str(e)}'}), 200


@public_bp.route('/whatsapp/restart-node', methods=['POST'])
@cross_origin()
def restart_node():
    try:
        # 1. Mata Node antigo (somente o app)
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            if (
                proc.info['name']
                and 'node' in proc.info['name'].lower()
                and proc.info['cmdline']
                and NODE_PATH in ' '.join(proc.info['cmdline'])
            ):
                print(f"Matando Node PID {proc.pid}")

                proc.kill()

        # 2. Inicia Node desacoplado do terminal
        with open(NODE_LOG, 'a') as log_file:
            subprocess.Popen(
                ['node', NODE_PATH],
                stdout=log_file,
                stderr=subprocess.STDOUT,
                start_new_session=True
            )
        print("Node iniciado com sucesso")

        return jsonify({'message': 'Node server restarted/started'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def is_node_running():
    """Verifica se algum processo Node está rodando na porta 3001"""
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        if proc.info['name'] and 'node' in proc.info['name'].lower():
            if NODE_PATH in ' '.join(proc.info['cmdline']):
                return True
    return False

def start_node():
    """Inicia Node desacoplado do Flask"""
    subprocess.Popen(
        ['node', NODE_PATH],
        stdout=open(NODE_LOG, 'a'),
        stderr=subprocess.STDOUT,
        start_new_session=True
    )
    print("Node iniciado")
    # opcional: aguarda um pouco para o Node subir
    time.sleep(2)
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
