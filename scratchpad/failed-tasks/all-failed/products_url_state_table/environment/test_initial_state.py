import os
import shutil
import socket


PROJECT_DIR = "/home/user/myproject"
APP_PORT = 42101


def test_home_user_directory_exists():
    assert os.path.isdir("/home/user"), "/home/user directory must exist."


def test_node_binary_available():
    assert shutil.which("node") is not None, "node binary not found in PATH."


def test_npm_binary_available():
    assert shutil.which("npm") is not None, "npm binary not found in PATH."


def test_npx_binary_available():
    assert shutil.which("npx") is not None, "npx binary not found in PATH."


def test_app_port_is_free():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(1.0)
    try:
        result = sock.connect_ex(("127.0.0.1", APP_PORT))
    finally:
        sock.close()
    assert result != 0, (
        f"Port {APP_PORT} must be free before the task starts, "
        f"but something is already listening on it."
    )


def test_project_dir_does_not_already_contain_built_app():
    # The task's executor is expected to create the project at PROJECT_DIR.
    # The directory itself may or may not exist before the task starts, but it
    # must not already contain a built TanStack Start app (i.e. no node_modules
    # plus a real package.json that we did not create).
    pkg = os.path.join(PROJECT_DIR, "package.json")
    node_modules = os.path.join(PROJECT_DIR, "node_modules")
    if os.path.isfile(pkg) and os.path.isdir(node_modules):
        raise AssertionError(
            f"{PROJECT_DIR} already appears to contain an installed project "
            f"(package.json + node_modules). The task expects the executor to "
            f"build the project from scratch."
        )
