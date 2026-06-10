import pytest
import subprocess
import os
import socket
from xprocess import ProcessStarter
from pochi_verifier import PochiVerifier

PROJECT_DIR = "/home/user/blog"

@pytest.fixture(scope="session")
def browser_verifier():
    yield PochiVerifier()

@pytest.fixture(scope="session")
def start_app(xprocess):
    # Run npm install
    subprocess.run(["npm", "install"], cwd=PROJECT_DIR, check=True)
    
    # Seed database
    db_path = os.path.join(PROJECT_DIR, "blog.db")
    sql = "CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY, title TEXT, content TEXT); INSERT OR REPLACE INTO posts (id, title, content) VALUES (1, 'Test Post 123', '# My Heading\\nThis is **bold**.');"
    subprocess.run(["sqlite3", db_path, sql], check=True)

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
                return s.connect_ex(("localhost", 7392)) == 0

    xprocess.ensure(Starter.name, Starter)
    yield
    info = xprocess.getinfo(Starter.name)
    info.terminate()

def test_verify_home_page(start_app, browser_verifier):
    reason = "The home page should list all blog posts fetched from the database."
    truth = "Navigate to http://localhost:7392/. Verify that the page contains the text 'Test Post 123' and an 'a' link pointing to '/posts/1'."
    
    result = browser_verifier.verify(
        reason=reason,
        truth=truth,
        use_browser_agent=True,
        trajectory_dir="/logs/verifier/pochi/test_verify_home_page"
    )
    assert result.status == "pass", f"Home page verification failed: {result.reason}"

def test_verify_post_page(start_app, browser_verifier):
    reason = "The post page should render the specific post's markdown content as HTML."
    truth = "Navigate to http://localhost:7392/posts/1. Verify that the page contains an 'h1' element with the text 'My Heading' and a 'strong' or 'b' element with the text 'bold'."
    
    result = browser_verifier.verify(
        reason=reason,
        truth=truth,
        use_browser_agent=True,
        trajectory_dir="/logs/verifier/pochi/test_verify_post_page"
    )
    assert result.status == "pass", f"Post page verification failed: {result.reason}"
