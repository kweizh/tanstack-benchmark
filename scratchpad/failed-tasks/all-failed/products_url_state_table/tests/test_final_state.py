import os
import socket
import time

import pytest
import requests
from xprocess import ProcessStarter


PROJECT_DIR = "/home/user/myproject"
APP_PORT = 42101
BASE_URL = f"http://localhost:{APP_PORT}"

BOOK_NAMES = [
    "JavaScript Programming",
    "The Pragmatic Programmer",
    "Design Patterns",
    "Clean Code",
]
NON_BOOK_NAMES = [
    "Wireless Mouse",
    "Mechanical Keyboard",
    "USB-C Hub",
    "4K Monitor",
    "Coffee Maker",
    "Vacuum Cleaner",
    "Desk Lamp",
    "Throw Pillow",
]


def _port_open(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1.0)
        return s.connect_ex((host, port)) == 0


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
        timeout = 240
        terminate_on_interrupt = True

        def startup_check(self):
            return _port_open("localhost", APP_PORT)

    xprocess.ensure(Starter.name, Starter)

    # Give the app a brief warm-up window so first-route SSR is ready.
    deadline = time.time() + 60
    while time.time() < deadline:
        try:
            r = requests.get(f"{BASE_URL}/api/products", timeout=5)
            if r.status_code in (200, 400):
                break
        except requests.RequestException:
            pass
        time.sleep(1)

    yield

    info = xprocess.getinfo(Starter.name)
    info.terminate()


def test_default_listing_pagination(start_app):
    r = requests.get(f"{BASE_URL}/api/products", timeout=15)
    assert r.status_code == 200, (
        f"GET /api/products should return 200, got {r.status_code}: {r.text[:300]}"
    )
    data = r.json()
    assert isinstance(data, dict), f"Response body must be a JSON object, got: {type(data).__name__}"
    assert data.get("total") == 12, f"Expected total === 12, got {data.get('total')!r}"
    assert data.get("page") == 1, f"Expected default page === 1, got {data.get('page')!r}"
    assert data.get("pageSize") == 5, f"Expected default pageSize === 5, got {data.get('pageSize')!r}"
    rows = data.get("rows")
    assert isinstance(rows, list), f"'rows' must be a list, got {type(rows).__name__}"
    assert len(rows) == 5, f"Expected rows.length === 5 on the default page, got {len(rows)}"


def test_category_filter_books_only(start_app):
    r = requests.get(
        f"{BASE_URL}/api/products",
        params={"category": "books", "pageSize": "20"},
        timeout=15,
    )
    assert r.status_code == 200, (
        f"GET /api/products?category=books should return 200, got {r.status_code}: {r.text[:300]}"
    )
    rows = r.json().get("rows", [])
    assert rows, "Expected at least one book product in the response."
    for row in rows:
        assert row.get("category") == "books", (
            f"Every row must have category 'books', got row={row!r}"
        )
    names = {row.get("name") for row in rows}
    assert names == set(BOOK_NAMES), (
        f"Expected the set of book names to be {set(BOOK_NAMES)!r}, got {names!r}"
    )


def test_price_range_filter(start_app):
    r = requests.get(
        f"{BASE_URL}/api/products",
        params={"minPrice": "50", "maxPrice": "100", "pageSize": "20"},
        timeout=15,
    )
    assert r.status_code == 200, (
        f"GET /api/products?minPrice=50&maxPrice=100 should return 200, "
        f"got {r.status_code}: {r.text[:300]}"
    )
    rows = r.json().get("rows", [])
    assert rows, "Expected at least one product in [50, 100] price range."
    for row in rows:
        price = row.get("price")
        assert isinstance(price, (int, float)), f"price must be numeric, got {price!r}"
        assert 50 <= price <= 100, (
            f"Every row's price must be within [50, 100], got row={row!r}"
        )
    names = {row.get("name") for row in rows}
    assert names == {"Design Patterns", "Mechanical Keyboard", "Coffee Maker"}, (
        f"Expected exactly the three products priced in [50, 100], got names={names!r}"
    )


def test_sort_by_price_ascending(start_app):
    r = requests.get(
        f"{BASE_URL}/api/products",
        params={"sort": "price", "order": "asc", "pageSize": "12"},
        timeout=15,
    )
    assert r.status_code == 200, (
        f"GET sorted by price asc should return 200, got {r.status_code}: {r.text[:300]}"
    )
    data = r.json()
    rows = data.get("rows", [])
    assert len(rows) == 12, f"Expected all 12 rows on a single page, got {len(rows)}"
    prices = [row.get("price") for row in rows]
    for i in range(1, len(prices)):
        assert prices[i - 1] <= prices[i], (
            f"Prices must be monotonically non-decreasing, got {prices!r}"
        )


def test_search_substring_case_insensitive_keyboard(start_app):
    r = requests.get(
        f"{BASE_URL}/api/products",
        params={"q": "keyboard", "pageSize": "20"},
        timeout=15,
    )
    assert r.status_code == 200, (
        f"GET ?q=keyboard should return 200, got {r.status_code}: {r.text[:300]}"
    )
    rows = r.json().get("rows", [])
    assert rows, "Expected at least one row matching q=keyboard."
    for row in rows:
        name = row.get("name", "")
        assert "keyboard" in name.lower(), (
            f"Every row's name must contain 'keyboard' case-insensitively, got row={row!r}"
        )
    names = {row.get("name") for row in rows}
    assert "Mechanical Keyboard" in names, (
        f"Expected 'Mechanical Keyboard' in matched rows, got names={names!r}"
    )


def test_search_substring_case_insensitive_program(start_app):
    r = requests.get(
        f"{BASE_URL}/api/products",
        params={"q": "PROGRAM", "pageSize": "20"},
        timeout=15,
    )
    assert r.status_code == 200, (
        f"GET ?q=PROGRAM should return 200, got {r.status_code}: {r.text[:300]}"
    )
    rows = r.json().get("rows", [])
    for row in rows:
        name = row.get("name", "")
        assert "program" in name.lower(), (
            f"Every row's name must contain 'program' case-insensitively, got row={row!r}"
        )
    names = {row.get("name") for row in rows}
    assert "JavaScript Programming" in names and "The Pragmatic Programmer" in names, (
        f"Expected both 'JavaScript Programming' and 'The Pragmatic Programmer' to "
        f"match q=PROGRAM, got names={names!r}"
    )


def test_pagination_second_page_default_sort(start_app):
    r = requests.get(
        f"{BASE_URL}/api/products",
        params={"page": "2", "pageSize": "5"},
        timeout=15,
    )
    assert r.status_code == 200, (
        f"GET ?page=2&pageSize=5 should return 200, got {r.status_code}: {r.text[:300]}"
    )
    data = r.json()
    assert data.get("page") == 2, f"Expected page === 2, got {data.get('page')!r}"
    assert data.get("pageSize") == 5, f"Expected pageSize === 5, got {data.get('pageSize')!r}"
    assert data.get("total") == 12, f"Expected total === 12, got {data.get('total')!r}"
    ids = [row.get("id") for row in data.get("rows", [])]
    assert ids == [6, 7, 8, 9, 10], (
        f"With default sort by id ascending, page 2 of size 5 must be ids [6,7,8,9,10], got {ids!r}"
    )


def test_invalid_category_returns_400(start_app):
    r = requests.get(
        f"{BASE_URL}/api/products",
        params={"category": "invalid"},
        timeout=15,
    )
    assert r.status_code == 400, (
        f"GET ?category=invalid must return HTTP 400, got {r.status_code}: {r.text[:300]}"
    )
    body = r.json()
    assert isinstance(body, dict), f"400 response must be a JSON object, got {type(body).__name__}"
    err = body.get("error")
    assert isinstance(err, str) and err, (
        f"400 response must contain a non-empty 'error' string, got body={body!r}"
    )


def test_html_route_filters_books(start_app):
    r = requests.get(
        f"{BASE_URL}/products",
        params={"category": "books"},
        timeout=20,
    )
    assert r.status_code == 200, (
        f"GET /products?category=books should return 200, got {r.status_code}: {r.text[:300]}"
    )
    content_type = r.headers.get("Content-Type", "")
    assert "text/html" in content_type.lower(), (
        f"GET /products should return HTML, got Content-Type={content_type!r}"
    )
    body = r.text
    for name in BOOK_NAMES:
        assert name in body, (
            f"Expected the HTML body to contain the book name {name!r}, but it did not."
        )
    for name in NON_BOOK_NAMES:
        assert name not in body, (
            f"Expected the HTML body NOT to contain the non-book name {name!r}, but it did."
        )
