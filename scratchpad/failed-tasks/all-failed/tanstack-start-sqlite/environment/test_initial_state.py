import os
import shutil
import socket

def test_node_available():
    assert shutil.which("node") is not None, "node binary not found in PATH."

def test_npm_available():
    assert shutil.which("npm") is not None, "npm binary not found in PATH."

def test_project_dir_exists():
    assert os.path.isdir("/home/user/project"), "Project directory /home/user/project does not exist."

def test_port_available():
    port = 8394
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        # If connect_ex returns 0, it means the port is in use
        assert s.connect_ex(('localhost', port)) != 0, f"Port {port} is already in use."
