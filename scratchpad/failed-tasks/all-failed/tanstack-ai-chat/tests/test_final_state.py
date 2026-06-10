import os
import sqlite3
import pytest
import requests
import socket
from xprocess import ProcessStarter

PROJECT_DIR = "/home/user/myproject"
PORT = 4821

@pytest.fixture(scope="session")
def start_app(xprocess):
    class Starter(ProcessStarter):
        name = "start_app"
        args = ["npm", "run", "dev", "--", "--port", str(PORT)]
        env = os.environ.copy()
        popen_kwargs = {
            "cwd": PROJECT_DIR,
            "text": True,
        }
        timeout = 180
        terminate_on_interrupt = True

        def startup_check(self):
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                return s.connect_ex(("localhost", PORT)) == 0

    xprocess.ensure(Starter.name, Starter)
    yield
    info = xprocess.getinfo(Starter.name)
    info.terminate()

def test_chat_interface(start_app):
    url = f"http://localhost:{PORT}/"
    response = requests.get(url)
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    assert "html" in response.text.lower(), "Expected HTML response for chat interface"

def test_ai_tool_call_request(start_app):
    url = f"http://localhost:{PORT}/api/chat"
    payload = {
        "messages": [
            {"role": "user", "content": "Create a note saying 'Hello Harbor'"}
        ]
    }
    response = requests.post(url, json=payload, stream=True)
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    content = response.text
    assert "createNote" in content, f"Expected tool call 'createNote' in stream, got {content}"
    assert "Hello Harbor" in content, f"Expected note text 'Hello Harbor' in stream, got {content}"

def test_tool_approval_and_db_write(start_app):
    url = f"http://localhost:{PORT}/api/chat"
    payload = {
        "messages": [
            {"role": "user", "content": "Create a note saying 'Hello Harbor'"},
            {"role": "assistant", "content": "", "tool_calls": [{"id": "call_123", "type": "function", "function": {"name": "createNote", "arguments": '{"text": "Hello Harbor"}'}}]},
            {"role": "tool", "tool_call_id": "call_123", "content": "approved"}
        ]
    }
    response = requests.post(url, json=payload)
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

def test_database_record(start_app):
    db_path = os.path.join(PROJECT_DIR, "notes.db")
    assert os.path.exists(db_path), f"Database file {db_path} does not exist"
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM notes WHERE text = 'Hello Harbor';")
        rows = cursor.fetchall()
        assert len(rows) > 0, "Expected at least one record with text 'Hello Harbor' in notes table"
    except sqlite3.OperationalError as e:
        pytest.fail(f"Database query failed: {e}")
    finally:
        conn.close()
