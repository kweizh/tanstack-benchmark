import os
import socket
import time

import pytest
import requests
from xprocess import ProcessStarter


PROJECT_DIR = "/home/user/myproject"
PORT = 47821
BASE_URL = f"http://localhost:{PORT}"

PARENT_BODY = "hello-from-test-parent-zealt"
CHILD_BODY = "hello-from-test-child-zealt"
FAIL_BODY = "this-should-not-persist-zealt"


def _port_open(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1.0)
        return s.connect_ex((host, port)) == 0


@pytest.fixture(scope="session")
def start_app(xprocess):
    """Start the candidate's TanStack Start server on the hard-coded port."""

    class Starter(ProcessStarter):
        name = "tanstack_optimistic_comments_app"
        # `npm run start` should serve the production build configured to listen on PORT.
        args = ["npm", "run", "start"]
        env = os.environ.copy()
        env["PORT"] = str(PORT)
        popen_kwargs = {
            "cwd": PROJECT_DIR,
            "text": True,
        }
        timeout = 240
        terminate_on_interrupt = True

        def startup_check(self) -> bool:
            return _port_open("127.0.0.1", PORT)

    xprocess.ensure(Starter.name, Starter)

    # Give the server a small grace period beyond raw TCP readiness so it
    # is fully accepting HTTP requests.
    deadline = time.time() + 30
    last_err: Exception | None = None
    while time.time() < deadline:
        try:
            resp = requests.get(f"{BASE_URL}/api/comments", timeout=5)
            if resp.status_code == 200:
                break
        except Exception as exc:  # noqa: BLE001
            last_err = exc
        time.sleep(0.5)
    else:  # pragma: no cover - only triggered when server never becomes ready
        raise RuntimeError(
            f"Server on port {PORT} did not respond successfully to GET /api/comments: {last_err}"
        )

    yield

    info = xprocess.getinfo(Starter.name)
    info.terminate()


def _get_comments() -> list[dict]:
    resp = requests.get(f"{BASE_URL}/api/comments", timeout=10)
    assert resp.status_code == 200, (
        f"GET /api/comments returned status {resp.status_code} (expected 200). Body: {resp.text!r}"
    )
    data = resp.json()
    assert isinstance(data, list), f"GET /api/comments must return a JSON array, got: {type(data).__name__}"
    return data


def test_initial_list_is_array(start_app) -> None:
    data = _get_comments()
    # Every element must conform to the documented schema.
    for c in data:
        assert isinstance(c, dict), f"Each comment must be a JSON object, got: {c!r}"
        assert "id" in c and isinstance(c["id"], str) and c["id"], \
            f"Each comment must have a non-empty string 'id'. Got: {c!r}"
        assert "parentId" in c, f"Each comment must have a 'parentId' key. Got: {c!r}"
        assert c["parentId"] is None or isinstance(c["parentId"], str), \
            f"'parentId' must be null or string. Got: {c!r}"
        assert isinstance(c.get("body"), str), f"Each comment must have a string 'body'. Got: {c!r}"
        assert isinstance(c.get("createdAt"), (int, float)), \
            f"Each comment must have a numeric 'createdAt'. Got: {c!r}"


def test_post_top_level_comment(start_app) -> None:
    initial = _get_comments()
    initial_len = len(initial)

    payload = {"parentId": None, "body": PARENT_BODY}
    resp = requests.post(f"{BASE_URL}/api/comments", json=payload, timeout=15)
    assert resp.status_code == 200, (
        f"POST /api/comments (top-level) returned status {resp.status_code} (expected 200). Body: {resp.text!r}"
    )
    created = resp.json()
    assert isinstance(created, dict), f"POST /api/comments must return a JSON object. Got: {created!r}"
    assert isinstance(created.get("id"), str) and created["id"], \
        f"Created comment must include a non-empty string 'id'. Got: {created!r}"
    assert created.get("parentId") is None, \
        f"Top-level comment must have parentId == null. Got: {created!r}"
    assert created.get("body") == PARENT_BODY, \
        f"Created comment body must echo the request body. Got: {created!r}"
    assert isinstance(created.get("createdAt"), (int, float)), \
        f"Created comment must include numeric 'createdAt'. Got: {created!r}"

    parent_id = created["id"]

    # --- nested reply ---
    child_payload = {"parentId": parent_id, "body": CHILD_BODY}
    child_resp = requests.post(f"{BASE_URL}/api/comments", json=child_payload, timeout=15)
    assert child_resp.status_code == 200, (
        f"POST /api/comments (child) returned status {child_resp.status_code} (expected 200). Body: {child_resp.text!r}"
    )
    child = child_resp.json()
    assert isinstance(child, dict), f"Nested POST must return a JSON object. Got: {child!r}"
    assert isinstance(child.get("id"), str) and child["id"] and child["id"] != parent_id, \
        f"Child comment must have a fresh, non-empty string 'id'. Got: {child!r}"
    assert child.get("parentId") == parent_id, \
        f"Child comment must have parentId == {parent_id!r}. Got: {child!r}"
    assert child.get("body") == CHILD_BODY, \
        f"Child comment body must echo the request body. Got: {child!r}"
    assert isinstance(child.get("createdAt"), (int, float)), \
        f"Child comment must include numeric 'createdAt'. Got: {child!r}"

    # --- tree contains both with correct linkage ---
    after = _get_comments()
    assert len(after) == initial_len + 2, (
        f"Expected comment count to grow by 2 (from {initial_len} to {initial_len + 2}), got {len(after)}."
    )
    by_id = {c["id"]: c for c in after}
    assert parent_id in by_id, f"Parent comment {parent_id!r} not present in GET /api/comments after creation."
    assert child["id"] in by_id, f"Child comment {child['id']!r} not present in GET /api/comments after creation."
    assert by_id[parent_id]["parentId"] is None, \
        f"Parent comment {parent_id!r} should have parentId == null. Got: {by_id[parent_id]!r}"
    assert by_id[child["id"]]["parentId"] == parent_id, (
        f"Child comment {child['id']!r} should have parentId == {parent_id!r}. Got: {by_id[child['id']]!r}"
    )
    assert by_id[parent_id]["body"] == PARENT_BODY, \
        f"Parent body mismatch in tree. Expected {PARENT_BODY!r}, got: {by_id[parent_id]!r}"
    assert by_id[child["id"]]["body"] == CHILD_BODY, \
        f"Child body mismatch in tree. Expected {CHILD_BODY!r}, got: {by_id[child['id']]!r}"


def test_forced_failure_does_not_persist(start_app) -> None:
    before = _get_comments()
    payload = {"parentId": None, "body": FAIL_BODY}
    resp = requests.post(f"{BASE_URL}/api/comments?fail=1", json=payload, timeout=15)
    assert resp.status_code == 500, (
        f"POST /api/comments?fail=1 must return HTTP 500 to drive client rollback. "
        f"Got status {resp.status_code}. Body: {resp.text!r}"
    )
    after = _get_comments()
    assert len(after) == len(before), (
        f"Failed POST must not persist a comment. Before count: {len(before)}, after count: {len(after)}."
    )
    assert all(c.get("body") != FAIL_BODY for c in after), (
        f"Failed POST body {FAIL_BODY!r} should not appear in GET /api/comments. Got: {after!r}"
    )


def test_html_renders_comment_bodies(start_app) -> None:
    # Wait briefly so client-side hydration / fetch has time to populate the rendered
    # tree if SSR did not already include it.
    deadline = time.time() + 15
    last_html = ""
    while time.time() < deadline:
        resp = requests.get(f"{BASE_URL}/", timeout=10)
        assert resp.status_code == 200, (
            f"GET / returned status {resp.status_code} (expected 200). Body: {resp.text[:500]!r}"
        )
        last_html = resp.text
        if PARENT_BODY in last_html and CHILD_BODY in last_html:
            return
        time.sleep(1.0)

    assert PARENT_BODY in last_html, (
        f"Expected the rendered HTML at GET / to contain the parent comment body {PARENT_BODY!r}. "
        f"Last HTML (truncated): {last_html[:1000]!r}"
    )
    assert CHILD_BODY in last_html, (
        f"Expected the rendered HTML at GET / to contain the child comment body {CHILD_BODY!r}. "
        f"Last HTML (truncated): {last_html[:1000]!r}"
    )
