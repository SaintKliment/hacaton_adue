import re

def validate_fullname(fullname):
    """Валидация ФИО: должно содержать только буквы и пробелы."""
    pattern = r'^[А-ЯЁа-яё\s-]+$'  # Поддержка кириллицы и пробелов
    return bool(re.match(pattern, fullname))

def validate_email(email):
    """Валидация электронной почты."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_number(number):
    """Валидация числа (например, срока модуля)."""
    return number.isdigit() and int(number) > 0

def validate_activity_content(content):
    """Валидация содержания мероприятия: не должно быть пустым."""
    return bool(content.strip())

def validate_module_name(module_name):
    """Валидация названия модуля: не должно быть пустым."""
    return bool(module_name.strip())

def validate_positions(positions):
    """Валидация должностей: должно быть выбрано значение."""
    return positions != ""

def validate_file_upload(file_name):
    """Валидация имени файла: разрешенные расширения."""
    allowed_extensions = {'pdf', 'pptx', 'xlsx', 'docx', 'jpg', 'mkv', 'avi', 'mp', 'url'}
    extension = file_name.rsplit('.', 1)[1].lower() if '.' in file_name else ''
    
    return extension in allowed_extensions
