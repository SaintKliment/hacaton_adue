import re
import html
from markupsafe import escape

def validate_registration_data(full_name, email, password):
    # Проверка обязательных полей
    if not full_name or not email or not password:
        return "Все поля обязательны для заполнения"

    # Валидация email
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return "Некорректный email"

    # Валидация длины пароля
    if len(password) < 8:
        return "Пароль должен быть не менее 8 символов"

    # Очистка входных данных от возможных XSS атак
    full_name = sanitize_input(full_name)
    email = sanitize_input(email)

    # Валидация email после очистки
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return "Некорректный email"

    # Если все в порядке, возвращаем None
    return None

def sanitize_input(input_string):
    """Удаляет потенциально опасные символы для предотвращения XSS атак."""
    # Экранируем HTML теги
    sanitized_string = html.escape(input_string)

    # Удаляем потенциально опасные ссылки и скрипты
    sanitized_string = re.sub(r"javascript:[^ ]+", "", sanitized_string)  # Удаляем javascript: ссылки
    sanitized_string = re.sub(r"(<[^>]+>)", "", sanitized_string)  # Удаляем все теги HTML (если нужно)

    return sanitized_string

def validate_module_data(module_name, positions, activities, data_source, duration, responsible, materials):
    # Проверка обязательных полей
    if not module_name or not positions or not activities or not data_source or not duration or not responsible:
        return "Все поля обязательны для заполнения"

    # Валидация длительности (предположим, что это должно быть число, например, количество дней)
    try:
        duration = float(duration)
        if duration <= 0:
            return "Длительность должна быть положительным числом"
    except ValueError:
        return "Длительность должна быть числом"

    # Валидация для поля positions (если это список, он должен быть непустым)
    if not isinstance(positions, list) or not positions:
        return "Список позиций должен быть непустым"

    # Валидация для поля activities (аналогично)
    if not isinstance(activities, list) or not activities:
        return "Список активностей должен быть непустым"

    # Валидация для materials (если это список, он может быть пустым, но если не пустой, то элементы должны быть строками)
    if materials and not all(isinstance(material, str) for material in materials):
        return "Все материалы должны быть строками"

    # Валидация поля data_source (проверка на корректность URL или пути, если это путь к файлу)
    if not isinstance(data_source, str) or len(data_source.strip()) == 0:
        return "Источник данных должен быть строкой"
    
    # Дополнительная защита от SQL инъекций: проверка на небезопасные символы
    # Изменено регулярное выражение, чтобы избежать ошибки с диапазоном
    if re.search(r"[;\"'\\]", data_source):  # Допускаются только безопасные символы
        return "Источник данных содержит недопустимые символы"

    # Валидация для поля responsible (должно быть имя, строка)
    if not isinstance(responsible, str) or len(responsible.strip()) == 0:
        return "Ответственный должен быть строкой"
    
    # Защита от XSS: экранируем все данные перед сохранением
    module_name = escape(module_name)
    positions = [escape(pos) for pos in positions]
    activities = [escape(act) for act in activities]
    data_source = escape(data_source)
    responsible = escape(responsible)
    materials = [escape(material) for material in materials] if materials else []

    # Если все проверки прошли успешно, возвращаем None
    return None
