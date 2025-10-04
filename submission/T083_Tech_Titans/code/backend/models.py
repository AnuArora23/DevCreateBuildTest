from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# User Table
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)

# Wishlist Table (must match your code and DB schema)
class WishlistItem(Base):
    __tablename__ = 'wishlist'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    product_name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    image_url = Column(String)
    product_url = Column(String)

# Virtual Closet Table
class ClosetItem(Base):
    __tablename__ = "closet_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)  # FK to user (optional: add ForeignKey/user relationship)
    file_name = Column(String, index=True)
    category = Column(String)  # e.g., 'Shirt', 'Trousers', etc.
    color = Column(String)     # e.g., 'Blue', 'Black', etc.
    image_url = Column(String, unique=True, nullable=False)

    def __repr__(self):
        return f"<ClosetItem(name='{self.file_name}', category='{self.category}', color='{self.color}')>"
