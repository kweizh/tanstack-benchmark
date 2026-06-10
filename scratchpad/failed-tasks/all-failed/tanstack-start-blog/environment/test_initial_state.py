import os
import shutil
import socket
import pytest

PROJECT_DIR = "/home/user/blog"

def test_node_available():
    assert shutil.which("node") is not None, "node binary not found in PATH."

def test_npm_available():
    assert shutil.which("npm") is not None, "npm binary not found in PATH."

def test_project_dir_exists():
    assert os.path.isdir(PROJECT_DIR), f"Project directory {PROJECT_DIR} does not exist."

def test_port_7392_available():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        # Returns 0 if port is open (meaning it's in use and not available for our app)
        # We want it to be closed (available)
        result = s.connect_ex(('localhost', 7392))
        assert result != 0, "Port 7392 is already in use."
