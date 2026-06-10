import os
import socket
import subprocess
import pytest
import requests
from xprocess import ProcessStarter
from pochi_verifier import PochiVerifier

PROJECT_DIR = "/home/user/project"
PORT = 4821
BASE_URL = f"http://localhost:{PORT}"

@pytest.fixture(scope="session")
def browser_verifier():
    yield PochiVerifier()

@pytest.fixture(scope="session")
def start_app(xprocess):
    # Run build first
    build_result = subprocess.run(
        ["npm", "run", "build"],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True
    )
    assert build_result.returncode == 0, f"npm run build failed: {build_result.stderr}\n{build_result.stdout}"

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

def test_api_initial_state(start_app):
    response = requests.get(f"{BASE_URL}/api/posts")
    assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
    data = response.json()
    assert isinstance(data, list), "Expected response to be a JSON array"
    assert len(data) > 0, "Expected at least one post in the array"
    assert "likes" in data[0], "Expected post to have a 'likes' count"

def test_api_successful_like(start_app):
    # Get initial likes
    resp1 = requests.get(f"{BASE_URL}/api/posts")
    post_id = resp1.json()[0]["id"]
    initial_likes = resp1.json()[0]["likes"]

    # Post successful like
    resp2 = requests.post(f"{BASE_URL}/api/posts/{post_id}/like", json={"fail": False})
    assert resp2.status_code == 200, f"Expected status 200, got {resp2.status_code}"

    # Get updated likes
    resp3 = requests.get(f"{BASE_URL}/api/posts")
    updated_post = next(p for p in resp3.json() if p["id"] == post_id)
    assert updated_post["likes"] == initial_likes + 1, "Expected likes to increment by 1"

def test_api_failed_like(start_app):
    # Get initial likes
    resp1 = requests.get(f"{BASE_URL}/api/posts")
    post_id = resp1.json()[0]["id"]
    initial_likes = resp1.json()[0]["likes"]

    # Post failed like
    resp2 = requests.post(f"{BASE_URL}/api/posts/{post_id}/like", json={"fail": True})
    assert resp2.status_code == 500, f"Expected status 500, got {resp2.status_code}"

    # Get updated likes
    resp3 = requests.get(f"{BASE_URL}/api/posts")
    updated_post = next(p for p in resp3.json() if p["id"] == post_id)
    assert updated_post["likes"] == initial_likes, "Expected likes to remain unchanged after failure"

def test_optimistic_ui(start_app, browser_verifier):
    reason = "The application must implement an optimistic update for the like button. When the user clicks like and the server request fails, the UI should immediately update the like count and then revert back to the original count."
    truth = (
        "Navigate to http://localhost:4821/. "
        "Locate the like count element (data-testid='like-count') and record the initial count. "
        "Check the 'Simulate Failure' checkbox (data-testid='simulate-failure'). "
        "Click the 'Like' button (data-testid='like-button'). "
        "Immediately (without waiting for network idle) verify that the like count element displays the initial count + 1. "
        "Wait for the network request to fail and the UI to settle. "
        "Verify that the like count element reverts to the initial count."
    )

    result = browser_verifier.verify(
        reason=reason,
        truth=truth,
        use_browser_agent=True,
        trajectory_dir="/logs/verifier/pochi/test_optimistic_ui"
    )
    assert result.status == "pass", f"Browser verification failed: {result.reason}"
