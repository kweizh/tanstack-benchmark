import pytest
import os
import socket
from xprocess import ProcessStarter
from pochi_verifier import PochiVerifier

PROJECT_DIR = "/home/user/project"

@pytest.fixture(scope="session")
def browser_verifier():
    yield PochiVerifier()

@pytest.fixture(scope="session")
def start_app(xprocess):
    class Starter(ProcessStarter):
        name = "start_app"
        args = ["npm", "run", "dev"]
        env = os.environ.copy()
        popen_kwargs = {
            "cwd": PROJECT_DIR,
            "text": True,
        }
        timeout = 180
        terminate_on_interrupt = True

        def startup_check(self):
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                return s.connect_ex(("localhost", 8394)) == 0

    xprocess.ensure(Starter.name, Starter)
    yield
    info = xprocess.getinfo(Starter.name)
    info.terminate()

def test_counter_app(start_app, browser_verifier):
    reason = "The application should display a counter that increments when the button is clicked and persists the value across page reloads."
    truth = "Navigate to http://localhost:8394. Verify that the page loads and contains an element with `data-testid=\"count\"` displaying a number (e.g., \"0\"). Click the button with `data-testid=\"increment\"`. Verify that the count displayed in `data-testid=\"count\"` increases by 1. Refresh the page at http://localhost:8394. Verify that the count displayed in `data-testid=\"count\"` remains the incremented value, proving it was persisted across page reloads."

    verifier = PochiVerifier()
    result = verifier.verify(
        reason=reason,
        truth=truth,
        use_browser_agent=True,
        trajectory_dir="/logs/verifier/pochi/test_counter_app"
    )
    assert result.status == "pass", f"Browser verification failed: {result.reason}"
