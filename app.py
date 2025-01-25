from flask import Flask, render_template, request, redirect, jsonify, url_for, flash, session, send_from_directory
from flask_mail import Mail, Message
import os
import json
from models.Activity import Activity
from werkzeug.utils import secure_filename 
from flask_bootstrap import Bootstrap
from config import SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS
from db import db
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from models.User import User
from flask_migrate import Migrate
from models.Module import Module
from flask_socketio import SocketIO, emit
from flask_apscheduler import APScheduler  
from datetime import datetime, timedelta
import time


app = Flask(__name__)
Bootstrap(app)
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Ограничение 16 МБ
ALLOWED_EXTENSIONS = {'pdf', 'pptx', 'xlsx', 'docx', 'jpg', 'mkv', 'avi', 'mp', 'url'}
app.config.from_object('config_smtp')  # Загрузка конфигурации из файла config.py
mail = Mail(app)
socketio = SocketIO(app)
app.secret_key = os.urandom(24)  # Для безопасности сессий
db.init_app(app)
migrate = Migrate(app, db)
scheduler = APScheduler()



@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:  # Проверяем, есть ли пользователь в сессии
            flash("Сначала войдите в систему.", "warning")
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


##########################################AUTH LOGIC START##############################################
# Регистрация
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        full_name = request.form['full_name']
        email = request.form['email']
        password = request.form['password']
        position = request.form.get('position', '')

        # Проверяем, существует ли пользователь с указанным email
        User.query.filter_by(email=email).first() # user_with_email = 

        # Проверяем, существует ли хотя бы один пользователь с таким email
        email_exists = User.query.filter_by(email=email).count() > 0

        # Возвращаем True, если email существует в базе данных, иначе False
        if email_exists:
            flash("Пользователь с таким email уже существует", "error")
            return redirect(url_for('login'))
        
        print(False)  # Email не найден
            

        hashed_password = generate_password_hash(password)
        new_user = User(full_name=full_name, email=email, password=hashed_password, position=position)
        db.session.add(new_user)
        db.session.commit()

        flash("Регистрация прошла успешно!", "success")
        return redirect(url_for('login'))
    return render_template('signup.html')

# Вход
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            session['user_name'] = user.full_name
            flash("Вход выполнен успешно!", "success")
            return redirect(url_for('index'))
        flash("Неверный email или пароль.", "danger")
    return render_template('login.html')

# Выход
@app.route('/logout')
def logout():
    session.clear()  
    flash("Вы успешно вышли из системы.", "success")
    return redirect(url_for('login'))  
##########################################AUTH LOGIC END##############################################


##########################################INDEX LOGIC START##############################################

@app.route('/')
@login_required
def index():
    count_modules = 0
    modules = Module.query.all()
    count_modules = Module.query.filter(Module.state == 'новый').count()
    user_logged_in = 'user_id' in session  
    current_user_id = session['user_id']
    user = User.query.filter_by(id=current_user_id).first()
    user_name = user.full_name
    return render_template('index.html',current_user_id=user_name, modules=modules, count_modules=count_modules, user_logged_in=user_logged_in), 200

##########################################INDEX LOGIC END##############################################


##########################################CREATE MODULE FOR WORKER LOGIC START##############################################

positions_dict = {
    "position1": "Должность 1",
    "position2": "Должность 2",
    "position3": "Должность 3",
    "position4": "Должность 4"
}
activities_dict = {
    "theory": "Теория",
    "practice": "Практика"
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/download/<filename>')
def download_file(filename):
    # Отправка файла пользователю для скачивания
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/add', methods=['GET', 'POST'])
@login_required
def add_module():
    if request.method == 'POST':
        module_name = request.form['module_name']
        
        # Получаем список должностей и преобразуем их в русские названия
        positions = [positions_dict.get(pos, pos) for pos in request.form.getlist('positions')]
        
        # Формируем список мероприятий и преобразуем типы в русские названия
        activities = [
            {
                'name': request.form.getlist('activity_name[]')[i],
                'type': activities_dict.get(request.form.getlist('activity_type[]')[i], request.form.getlist('activity_type[]')[i]),
                'content': request.form.getlist('activity_content[]')[i]
            }
            for i in range(len(request.form.getlist('activity_name[]')))
        ]
    
        data_source = request.form['data_source']
        duration = int(request.form['duration'])  # Приводим к целому числу
        responsible = request.form['responsible']
        
        # Проверяем наличие файлов, если нет - оставляем пустой список материалов
        materials = []
        if 'materials[]' in request.files:
            files = request.files.getlist('materials[]')
    
            # Проверяем каждый файл и сохраняем в папку
            for file in files:
                if file.filename != '':  # Только если файл был выбран
                    materials.append(str(file.filename))
    
                    if file and allowed_file(file.filename):
                        # Генерируем путь для сохранения файла
                        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    
                        # Сохраняем файл
                        file.save(filename)
    
        new_module = Module(
            module_name=module_name,
            positions=positions,
            activities=activities,
            data_source=data_source,
            duration=duration,
            responsible=responsible,
            state='выполнен',
            code_name="без кодового названия",
            materials=materials  # Если файлов нет, то просто пустой список
        )
    
        # Добавление записи в сессию и сохранение в базе данных
        try:
            db.session.add(new_module)
            db.session.commit()
            print("Новый модуль успешно добавлен в базу данных.")
        except Exception as e:
            db.session.rollback()
            print(f"Произошла ошибка при добавлении модуля: {str(e)}")
        finally:
            db.session.close()
    
        return redirect(url_for('index'))

    return render_template('add_module.html', positions_dict=positions_dict)
##########################################CREATE MODULE FOR WORKER LOGIC END##############################################



##########################################DRAFT FOR WORKER LOGIC START##############################################
@app.route('/draft', methods=['GET', 'POST'])
@login_required
def draft():
    return render_template('draft.html', positions_dict=positions_dict)
##########################################DRAFT FOR WORKER LOGIC END##############################################



##########################################ADD MODULE BY HR LOGIC START##############################################
def send_email(recipient):
    msg = Message("Назначение разработчиком адаптационного модуля",
                  recipients=[recipient])
    msg.body = "Добрый день, коллеги.\nВы назначены разработчиком адаптационного модуля. Просим ознакомиться с приказом и приступить к работе."
    msg.html = "<p>Добрый день, коллеги.</p><p>Вы назначены разработчиком адаптационного модуля. Просим ознакомиться с приказом и приступить к работе.</p>"
    
    with app.app_context():
        mail.send(msg)

@app.route('/hr_add', methods=['GET', 'POST'])
@login_required
def hr_add():
    if request.method == 'POST':
        # Получаем данные из формы
        code_name = request.form.get('module_name')
        responsible_user_ids = request.form.getlist('responsible_users')
        duration_develop = request.form.get('duration')
        selected_sogl_users = request.form.getlist('sogl_users[]')  
        state = "новый"


        new_module = Module(
        code_name=code_name,
        state=state,
        responsible_user_ids=responsible_user_ids,
        duration_develop=duration_develop,
        sogl_users=selected_sogl_users
        )

        try:
            db.session.add(new_module)
            db.session.commit()
            print("Новый модуль успешно добавлен в базу данных.")
            users = User.query.filter(User.id.in_(responsible_user_ids)).all()
            emails = [user.email for user in users]

            for email in emails:
                print(email)
                # send_email(email) # отправка шаблонного сообщения - уведомления о новом модуле
        except Exception as e:
            db.session.rollback()
            print(f"Произошла ошибка при добавлении модуля: {str(e)}")
        finally:
            db.session.close()

        return redirect(url_for('index'))
    
    users = User.query.filter_by(sys_role='работник').all()
    sogl_users = User.query.filter_by(sys_role='согласовант').all()
    return render_template('hr_add_module.html', users=users, sogl_users=sogl_users)  

##########################################ADD MODULE BY HR LOGIC END##############################################


##########################################VIEW MODULES  LOGIC START#################################################
@app.route('/view_modules', methods=['GET'])
@login_required
def view_modules():
    Module.query.filter(Module.state == 'новый').update({'state': 'новый просмотрен'})
    db.session.commit()
    modules = Module.query.filter(Module.state.in_( ['новый просмотрен', 'черновик'] )).all()
    arch_modules = Module.query.filter(Module.state.in_( ['выполнен'])).all()
    return render_template('modules.html', modules=modules, arch_modules=arch_modules)  

@app.route('/module/<int:module_id>', methods=['GET'])
@login_required
def module_detail(module_id):
    module = Module.query.get_or_404(module_id)  # Получаем модуль по ID или 404, если не найден
    
    responsible_user_ids_str = module.responsible_user_ids
    if not responsible_user_ids_str or responsible_user_ids_str == 'None':
        responsible_users = None  # Возвращаем None, если строка пустая или 'None'
    else:
    # Убираем фигурные скобки и пробелы, а затем разделяем по запятой
        responsible_user_ids = responsible_user_ids_str.strip('{}').replace(' ', '').split(',')
    # Извлекаем пользователей по этим id
        responsible_users = User.query.filter(User.id.in_([int(user_id) for user_id in responsible_user_ids])).all()
 
    return render_template('module_detail.html', module=module, responsible_users=responsible_users)

##########################################VIEW MODULES  LOGIC END####################################################

##########################################VIEW MODULES  LOGIC END####################################################
# Настройка расписания (каждые 24 часа)
@scheduler.task('interval', id='update_durations', hours=24, start_date='2025-01-25 00:00:00')
def update_durations():
    with app.app_context():
        # Получаем все модули
        modules = Module.query.all()
        
        for module in modules:
            if module.duration_develop > 0:
                module.duration_develop -= 1
            if module.duration > 0:
                module.duration -= 1
        
        # Сохраняем изменения
        db.session.commit()
        print("Длительности обновлены")

##########################################VIEW MODULES  LOGIC END####################################################

##########################################JOINT DEVELOPMENT  LOGIC START####################################################

@app.route('/joint_development', methods=['GET'])
@login_required
def joint_development():
    current_user_id = session['user_id']

    modules = Module.query.filter(
        Module.state.in_(['новый', 'черновик', 'новый просмотрен']),
        Module.responsible_user_ids.like(f'%{current_user_id}%')  # Проверяем наличие ID в строке
    ).all()

    return render_template('joint_modules.html', modules=modules)  

@app.route('/joint_development/<int:module_id>', methods=['GET', 'POST'])
@login_required
def joint_development_detail(module_id):
    module = Module.query.get_or_404(module_id)
    global positions_dict
    global activities_dict

    # Обновляем состояние только для текущего модуля
    if module.state == 'новый просмотрен':
        module.state = 'черновик'
        db.session.commit()

    module_activities_name = (
        module.activities[0]['name'].strip() if module.activities and module.activities[0].get('name') else ""
    )
    module_activities_type = (
        module.activities[0]['type'].strip() if module.activities and module.activities[0].get('type') else ""
    )
    module_activities_content = (
        module.activities[0]['content'].strip() if module.activities and module.activities[0].get('content') else ""
    )

    return render_template('joint_module_develop.html',module_activities_name=module_activities_name,module_activities_type=module_activities_type, module_activities_content=module_activities_content,  module=module, positions_dict=positions_dict, activities_dict=activities_dict)

##########################################JOINT DEVELOPMENT  LOGIC END####################################################


##########################################JOINT DEVELOPMENT SOCKET LOGIC START####################################################

@socketio.on('update_joint_const_inputs')
def handle_update_joint_const_inputs(data):
    module_id = data.get('module_id')
    new_name = data.get('module_name')
    new_source = data.get('data_source')
    new_duration = data.get('duration')
    new_responsible = data.get('responsible')
    selected_positions = data.get('selectedPositions', [])

    activity_name_1 = data.get('activity_name_1')
    activity_type_1 = data.get('activity_type_1')
    activity_content_1 = data.get('activity_content_1')
    
    activities = [{
    "name": activity_name_1,
    "type": activity_type_1,
    "content": activity_content_1
}]


    new_duration = int(new_duration) if new_duration else None
    
    MAX_INT = 1000000 
    MIN_INT = 1   

    # Проверка на допустимость значения для duration
    if new_duration is not None:
        if new_duration > MAX_INT or new_duration < MIN_INT:
            new_duration = None

    # Обновление записи в БД
    module = Module.query.get(module_id)
    if module:
        module.module_name = new_name
        module.data_source = new_source 
        module.duration = new_duration 
        module.responsible = new_responsible 
        module.positions = selected_positions
        module.activities = activities
        db.session.commit()

        # Рассылка обновленных данных всем клиентам
        socketio.emit('const_fiedls', {
            'module_id': module_id,
            'module_name': new_name,
            'data_source': new_source,
            'duration': new_duration,
            'responsible': new_responsible,
            'selected_positions': selected_positions,
            'activities': activities,
        })

##########################################ACTIVITIES SOCKET LOGIC START####################################################

@socketio.on('add_activity')
def handle_add_activity(data):
    activityCount = data['activityCount']
    module_id = data['moduleId']

    existing_activity = Activity.query.filter_by(module_id=module_id).first()

    if existing_activity:
        # Если запись найдена, обновляем поле activityCount
        existing_activity.activityCount = activityCount
    else:
        # Если запись не найдена, создаём новую
        new_activity = Activity(
            module_id=module_id,
            activityCount=activityCount,
        )

        db.session.add(new_activity)
    
    db.session.commit()
    
    emit('activity_added', data, broadcast=True, include_self=False)

@socketio.on('remove_activity')
def handle_remove_activity(data):
    module_id = data['moduleId']

    # Ищем запись с указанным module_id
    existing_activity = Activity.query.filter_by(module_id=module_id).first()

    if existing_activity:
        # Проверяем, можно ли уменьшить activityCount
        if existing_activity.activityCount > 0:
            existing_activity.activityCount -= 1
            db.session.commit()

            # Рассылка другим пользователям обновлённых данных
            emit('activity_removed', {
                'moduleId': module_id,
                'activityCount': existing_activity.activityCount
            }, broadcast=True, include_self=False)
        else:
            # Если activityCount уже 0, уведомляем клиента (если требуется)
            emit('error', {
                'message': f"Activity count for module_id {module_id} is already 0."
            }, to=request.sid)  # Отправляем только вызывающему клиенту
    else:
        # Если запись не найдена, уведомляем клиента об ошибке
        emit('error', {
            'message': f"No activity found for module_id {module_id}."
        }, to=request.sid)

    emit('activity_removed', data, broadcast=True, include_self=False)

# Обработка изменений в инпутах
@socketio.on('update_activity')
def handle_update_activity(data):
    module_id = data['moduleId']
    activity_id = data['activityId']
    activity_id = activity_id[-1]
    field = data['field']
    value = data['value']

    # Ищем запись с данным module_id и activity_id
    activity = Activity.query.filter_by(module_id=module_id).first()
  
    if activity:
        column_name = field  # Получаем имя колонки из поля 'field'

        if hasattr(activity, column_name):  # Проверяем, существует ли такая колонка
            # Загружаем текущие значения из колонки (если они есть)
            current_values = getattr(activity, column_name, None)  # Если ничего нет, значение None
            if current_values is None:
                current_values = []  # Если пусто, инициализируем пустой список
            else:
                try:
                    current_values = json.loads(current_values)  # Преобразуем строку в список
                except json.JSONDecodeError:
                    current_values = []  # В случае ошибки парсинга берем пустой список

            # Формируем новое значение как комбинацию value и activity_id
            new_value = f"{value}_{activity_id}"

            # Проверяем, существует ли уже значение с суффиксом _activity.id
            value_exists = any(val.endswith(f"_{activity_id}") for val in current_values)

            if value_exists:
                # Если такое значение уже есть, обновляем его
                for i, val in enumerate(current_values):
                    if val.endswith(f"_{activity_id}"):
                        current_values[i] = new_value  # Обновляем значение
                        break
            else:
                # Если значения нет, добавляем новое
                current_values.append(new_value)

            # Сохраняем обновленные значения обратно в колонку
            setattr(activity, column_name, json.dumps(current_values))  # Преобразуем обратно в строку

            # Сохраняем изменения в базе данных
            db.session.commit()
        else:
            print(f"Колонка {column_name} не существует в модели Activity.")

    emit('activity_updated', data, broadcast=True, include_self=False)


##########################################ACTIVITIES SOCKET LOGIC END####################################################

##########################################downloading updates start############################################################################

@socketio.on("connect")
def on_connect():
    emit("reload_page", broadcast=True, include_self=False)


##############################################downloading updates end########################################################################

#########################################api for load activities start#######################################################

@app.route('/get_activities/<int:module_id>', methods=['GET'])
@login_required
def get_activities(module_id):
    
    # Предположим, у вас есть модель Activity для хранения данных о действиях
    activities = Activity.query.filter_by(module_id=str(module_id)).all()

    activities_dicts = [
        {
            "id": activity.id,
            "name": activity.name,
            "type": activity.type,
            "content": activity.content,
            "activity_count": activity.activityCount,
            "module_id": activity.module_id
        }
        for activity in activities
    ]
    
    return activities_dicts



#########################################api for load activities end#######################################################

##########################################JOINT DEVELOPMENT SOCKET LOGIC END####################################################

if __name__ == '__main__':
    scheduler.init_app(app)
    scheduler.start()

    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    with app.app_context():
        db.create_all()  
    socketio.run(app, debug=True)

