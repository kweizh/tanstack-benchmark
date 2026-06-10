import shutil
import socket
import pytest

def test_node_available():
    assert shutil.which("node") is not None, "node binary not found in PATH."

def test_npm_available():
    assert shutil.which("npm") is not None, "npm binary not found in PATH."

def test_port_4821_available():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        # returns 0 if connection succeeds (port in use), error code otherwise
        result = s.connect_ex(('localhost', 4821))
        assert result != 0, "Port 4821 is already in use. It should be available for the task."
