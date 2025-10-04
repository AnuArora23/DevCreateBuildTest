from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from database import get_db
from models import WishlistItem
import requests
from bs4 import BeautifulSoup

router = APIRouter()

class WishlistItemCreate(BaseModel):
    username: str
    product_name: str
    description: str
    price: float
    image_url: str

class WishlistItemOut(WishlistItemCreate):
    id: int
    class Config:
        from_attributes = True

@router.post("/add", response_model=WishlistItemOut)
def add_wishlist(item: WishlistItemCreate, db: Session = Depends(get_db)):
    db_item = WishlistItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/list/{username}", response_model=List[WishlistItemOut])
def get_wishlist(username: str, db: Session = Depends(get_db)):
    items = db.query(WishlistItem).filter(WishlistItem.username == username).all()
    return items

class ScrapeRequest(BaseModel):
    url: str

class ProductOut(BaseModel):
    product_name: str
    description: str
    price: float
    image_url: str

@router.post("/scrape", response_model=List[ProductOut])
def scrape_wishlist_url(req: ScrapeRequest):
    response = requests.get(req.url)
    if response.status_code != 200:
        raise HTTPException(status_code=404, detail="Not Found")
    html = response.text
    soup = BeautifulSoup(html, "html.parser")
    products = []
    for card in soup.select('.product-card'):
        try:
            name = card.select_one('.product-name').text.strip()
            desc = card.select_one('.desc').text.strip()
            price = float(card.select_one('.price').text.strip().replace("₹", "").replace(",", ""))
            img_tag = card.select_one('img')
            image_url = img_tag['src'] if img_tag and 'src' in img_tag.attrs else ""
            products.append(ProductOut(
                product_name=name,
                description=desc,
                price=price,
                image_url=image_url
            ))
        except Exception:
            continue
    return products


