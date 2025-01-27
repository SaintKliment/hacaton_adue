from db import db

class Approval(db.Model):
    __tablename__ = 'approval'

    id = db.Column(db.Integer, primary_key=True)
    total_counter = db.Column(db.String(256), nullable=True)
    now_counter = db.Column(db.String(256), nullable=True, default='0')
    module_id = db.Column(db.String(256), nullable=True)
