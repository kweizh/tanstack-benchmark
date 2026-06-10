import os
import shutil
import socket


PORT = 47821


def test_node_available() -> None:
    assert shutil.which("node") is not None, "Node.js binary 'node' is required but was not found in PATH."


def test_npm_available() -> None:
    assert shutil.which("npm") is not None, "Node package manager 'npm' is required but was not found in PATH."


def test_npx_available() -> None:
    assert shutil.which("npx") is not None, "'npx' is required to scaffold a TanStack Start project but was not found in PATH."


def test_home_user_exists() -> None:
    assert os.path.isdir("/home/user"), "Expected the executor home directory /home/user to exist."


def test_target_port_is_free() -> None:
    # The task description hard-codes port 47821 for the TanStack Start server.
    # If something is already bound to it before evaluation, the final-state HTTP checks would be unreliable.
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.settimeout(1.0)
        result = sock.connect_ex(("127.0.0.1", PORT))
    finally:
        sock.close()
    assert result != 0, (
        f"Port {PORT} is already accepting connections before the task starts; "
        "it must be free so the candidate's TanStack Start server can bind to it."
    )
