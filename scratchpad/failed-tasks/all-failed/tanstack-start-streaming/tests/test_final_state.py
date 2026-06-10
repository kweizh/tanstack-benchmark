import os
import time
import socket
import subprocess
import requests
import pytest
from xprocess import ProcessStarter

PROJECT_DIR = "/home/user/project"
PORT = 7384

@pytest.fixture(scope="session")
def start_app(xprocess):
    # Run npm install first to ensure dependencies are ready
    subprocess.run(["npm", "install"], cwd=PROJECT_DIR, check=True)

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
                return s.connect_ex(("localhost", PORT)) == 0

    xprocess.ensure(Starter.name, Starter)

    yield

    info = xprocess.getinfo(Starter.name)
    info.terminate()

def test_port_availability(start_app):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        assert s.connect_ex(("localhost", PORT)) == 0, f"Port {PORT} is not open."

def test_streaming_ssr_and_final_data(start_app):
    url = f"http://localhost:{PORT}/dashboard"
    start_time = time.time()
    
    # Use stream=True to read the response as it arrives
    response = requests.get(url, stream=True)
    assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
    
    found_fallback = False
    chunks = []
    
    for chunk in response.iter_content(chunk_size=1024, decode_unicode=True):
        if chunk:
            chunks.append(chunk)
            current_content = "".join(chunks)
            if "Loading metrics..." in current_content and not found_fallback:
                found_fallback = True
                # Ensure we found it before the request is fully complete
                # We can check elapsed time, it should be fast
                elapsed_so_far = time.time() - start_time
                assert elapsed_so_far < 2.0, "Fallback text appeared too late, streaming might not be working."
                
    end_time = time.time()
    total_time = end_time - start_time
    
    final_html = "".join(chunks)
    
    assert found_fallback, "Expected 'Loading metrics...' in the early streamed HTML response."
    
    assert total_time >= 2.0, f"Expected simulated delay of at least 2 seconds, but request finished in {total_time:.2f}s."
    
    # Check final data
    assert "15000" in final_html, "Expected metrics data '15000' in the final HTML response."
    assert "420" in final_html, "Expected metrics data '420' in the final HTML response."
