from db import db

class Module(db.Model):
    __tablename__ = 'modules'
    __table_args__ = {'extend_existing': True} 

    id = db.Column(db.Integer, primary_key=True)
    code_name = db.Column(db.String(255), nullable=True)
    state =  db.Column(db.String(255),  nullable=True)
    responsible_user_ids = db.Column(db.String(255), nullable=True)
    duration_develop = db.Column(db.Integer, nullable=True)
    sogl_users = db.Column(db.String(255), nullable=True)
    
    module_name = db.Column(db.String(255), nullable=True)
    positions = db.Column(db.JSON, nullable=True)  
    activities = db.Column(db.JSON, nullable=True)  
    data_source = db.Column(db.String(255), nullable=True)
    duration = db.Column(db.Integer, nullable=True)
    responsible = db.Column(db.String(255), nullable=True)
    materials = db.Column(db.JSON, nullable=True) 

    def __repr__(self):
        return f"<Module {self.module_name}>"
