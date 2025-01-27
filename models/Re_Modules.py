from db import db

class Re_Modules(db.Model):
    __tablename__ = 're_modules'

    id = db.Column(db.Integer, primary_key=True)
    reason = db.Column(db.String(256), nullable=True)
    comments = db.Column(db.String(2048), nullable=True)
    correction_period = db.Column(db.String(256), nullable=True)
