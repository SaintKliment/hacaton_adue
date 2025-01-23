from db import db
from sqlalchemy.orm import relationship
from flask_login import UserMixin

# Модель пользователя
class User(UserMixin,   db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(256), nullable=False)
    email = db.Column(db.String(256), nullable=False, unique=True)
    password = db.Column(db.String(256), nullable=False)  
    position = db.Column(db.String(256), nullable=False)  
    sys_role = db.Column(db.String(256), nullable=True)

    def __repr__(self):
        return f'<User {self.full_name}>'
