import os
import shutil
import socket

def test_node_available():
    assert shutil.which("node") is not None, "node binary not found in PATH."
    assert shutil.which("npm") is not None, "npm binary not found in PATH."

def test_project_dir_exists():
    assert os.path.isdir("/home/user/project"), "Project directory /home/user/project does not exist."

def test_port_8321_available():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', 8321))
    assert result != 0, "Port 8321 is already in use. It should be available."
    sock.close()
