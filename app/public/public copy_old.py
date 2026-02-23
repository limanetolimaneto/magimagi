from flask import Blueprint, render_template, request, Response
from datetime import datetime
import queue
# import feedparser
# import requests


# ======================================================
# Blueprint & utilities
# ======================================================

# Public blueprint with URL prefix
public_bp = Blueprint('public', __name__, url_prefix='')  

# ======================================================
# QR code queue
# ======================================================
qr_queue = queue.Queue()
# RECEIVES QR code from Node
@public_bp.route('/whatsapp/qr', methods=['POST'])
def receive_qr():
    data = request.json
    qr_queue.put(data['qr'])
    return '', 204

# rota SSE para frontend
@public_bp.route('/whatsapp/stream')
def stream_qr():
    def event_stream():
        while True:
            qr = qr_queue.get()
            yield f"data: {qr}\n\n"
            yield ": keep-alive\n\n"  # mantém conexão viva

    return Response(
        event_stream(),
        headers={
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


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
