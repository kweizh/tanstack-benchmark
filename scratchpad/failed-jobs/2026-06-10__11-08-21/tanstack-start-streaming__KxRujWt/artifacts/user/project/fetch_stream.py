import urllib.request
import time

url = "http://localhost:7384/dashboard"

req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
)

print("Fetching URL chunk by chunk:")
start_time = time.time()
with urllib.request.urlopen(req) as response:
    while True:
        chunk = response.read(1024)
        if not chunk:
            break
        elapsed = time.time() - start_time
        print(f"[{elapsed:.2f}s] Received chunk ({len(chunk)} bytes):")
        print(chunk.decode('utf-8', errors='ignore'))
        print("-" * 40)
