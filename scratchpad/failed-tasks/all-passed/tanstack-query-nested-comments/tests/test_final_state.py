import pytest
import subprocess
import os
import socket
import requests
import time
from xprocess import ProcessStarter
from pochi_verifier import PochiVerifier

PROJECT_DIR = "/home/user/project"
PORT = 5732
BASE_URL = f"http://localhost:{PORT}"

@pytest.fixture(scope="session")
def browser_verifier():
    yield PochiVerifier()

@pytest.fixture(scope="session")
def start_app(xprocess):
    class Starter(ProcessStarter):
        name = "start_app"
        args = ["npm", "run", "start"]
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

def test_api_initial(start_app):
    """Verify the API returns a JSON array initially."""
    response = requests.get(f"{BASE_URL}/api/comments")
    assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
    data = response.json()
    assert isinstance(data, list), f"Expected JSON array, got {type(data)}"

def test_browser_optimistic_update(start_app, browser_verifier):
    """Verify the optimistic update flow in the browser."""
    reason = "The frontend must use TanStack Query's optimistic updates to immediately display a new comment before the server responds (which has a 1000ms delay)."
    truth = (
        f"Navigate to {BASE_URL}. "
        "Locate the text input for adding a comment and type 'Optimistic Test Comment'. "
        "Click the submit button. "
        "IMMEDIATELY check the page content to verify that 'Optimistic Test Comment' is visible on the page (proving the optimistic update worked before the 1000ms delay finishes). "
        "Wait for 1.5 seconds to allow the POST request to complete. "
        "Check the page content again and verify that 'Optimistic Test Comment' is still visible."
    )

    result = browser_verifier.verify(
        reason=reason,
        truth=truth,
        use_browser_agent=True,
        trajectory_dir="/logs/verifier/pochi/test_browser_optimistic_update"
    )
    assert result.status == "pass", f"Browser verification failed: {result.reason}"

def test_api_persistence(start_app):
    """Verify the comment was actually persisted to the backend."""
    # Give it a tiny bit of time in case the browser test just finished
    time.sleep(1)
    response = requests.get(f"{BASE_URL}/api/comments")
    assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
    data = response.json()
    assert isinstance(data, list), f"Expected JSON array, got {type(data)}"
    
    found = any(comment.get("text") == "Optimistic Test Comment" for comment in data)
    assert found, "The comment 'Optimistic Test Comment' was not found in the backend API response."
