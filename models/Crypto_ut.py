from sqlalchemy import Column, Integer, String, Text
from db import db

class Crypto_ut(db.Model):
    __tablename__ = 'crypto'
    id = Column(Integer, primary_key=True)
    public_key_pem = Column(String(4096), nullable=True)
    signature = Column(String(4096), nullable=True)
    module_id = Column(String(255), nullable=False)  
    data = Column(Text, nullable=True)  