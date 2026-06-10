import pytest
import requests
import os
import socket
from xprocess import ProcessStarter
from pochi_verifier import PochiVerifier

PROJECT_DIR = "/home/user/project"
PORT = 8321

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

def test_api_pagination(start_app):
    url = f"http://localhost:{PORT}/api/data?page=2&limit=10&sortBy=id&sortDesc=false"
    response = requests.get(url)
    assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
    
    data = response.json()
    assert "totalCount" in data, "Response JSON missing 'totalCount'"
    assert data["totalCount"] == 50, f"Expected totalCount 50, got {data['totalCount']}"
    
    assert "data" in data, "Response JSON missing 'data'"
    assert len(data["data"]) == 10, f"Expected 10 items, got {len(data['data'])}"
    
    first_item = data["data"][0]
    assert first_item["id"] == 11, f"Expected first item id to be 11, got {first_item.get('id')}"
    last_item = data["data"][-1]
    assert last_item["id"] == 20, f"Expected last item id to be 20, got {last_item.get('id')}"

def test_api_sorting(start_app):
    url = f"http://localhost:{PORT}/api/data?page=1&limit=5&sortBy=value&sortDesc=true"
    response = requests.get(url)
    assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
    
    data = response.json()
    assert "data" in data, "Response JSON missing 'data'"
    assert len(data["data"]) == 5, f"Expected 5 items, got {len(data['data'])}"
    
    values = [item["value"] for item in data["data"]]
    assert values == sorted(values, reverse=True), f"Items are not sorted by value descending: {values}"

def test_ui_rendering(start_app, browser_verifier):
    reason = "The application should render a data table with 'id', 'name', and 'value' columns, displaying the first 10 items."
    truth = "Navigate to http://localhost:8321/. Verify that the page renders a table element. The table must contain the headers 'id', 'name', and 'value'. The table must display the first 10 items, including 'Item 1'."
    
    result = browser_verifier.verify(
        reason=reason,
        truth=truth,
        use_browser_agent=True,
        trajectory_dir="/logs/verifier/pochi/test_ui_rendering"
    )
    assert result.status == "pass", f"Browser verification failed: {result.reason}"

def test_ui_pagination_controls(start_app, browser_verifier):
    reason = "The application should have pagination controls that update the table data."
    truth = "Navigate to http://localhost:8321/. Check for the presence of 'Next' and 'Previous' buttons. Click the 'Next' button. Verify that the table updates to display 'Item 11'."
    
    result = browser_verifier.verify(
        reason=reason,
        truth=truth,
        use_browser_agent=True,
        trajectory_dir="/logs/verifier/pochi/test_ui_pagination_controls"
    )
    assert result.status == "pass", f"Browser verification failed: {result.reason}"
