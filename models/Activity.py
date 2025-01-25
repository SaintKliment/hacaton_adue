from sqlalchemy import Column, Integer, String, Text
from db import db

class Activity(db.Model):
    __tablename__ = 'activities'
    id = Column(Integer, primary_key=True)
    name = Column(String(510), nullable=True)
    type = Column(String(510), nullable=True)
    content = Column(Text, nullable=True)
    activityCount = Column(Integer, nullable=True)
    module_id = Column(String(255), nullable=False)  # Идентификатор модуля