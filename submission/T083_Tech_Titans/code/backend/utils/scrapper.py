import requests
from bs4 import BeautifulSoup

def get_product_price(product_url):
    try:
        response = requests.get(product_url, timeout=10, headers={
            "User-Agent": "Mozilla/5.0"
        })
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, "html.parser")
            price_div = soup.find("div", class_="price")
            if price_div:
                price_text = price_div.get_text(strip=True)
                price_num = price_text.replace("₹", "").replace(",", "").strip()
                price_num = ''.join(c for c in price_num if c.isdigit() or c == '.')
                return float(price_num)
        return None
    except Exception as e:
        print(f"Error fetching price: {e}")
        return None
