from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
import json

# Генерация ключей
def generate_keys():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    public_key = private_key.public_key()
    return private_key, public_key

# Сериализация ключей в PEM-формат
def serialize_keys(private_key, public_key):
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    return private_pem, public_pem

# Десериализация приватного ключа из PEM-формата
def deserialize_private_key(private_pem):
    private_key = serialization.load_pem_private_key(
        private_pem,
        password=None,
        backend=default_backend()
    )
    return private_key


def deserialize_public_key(public_pem_hex):
    """
    Десериализует открытый ключ из PEM-формата, хранящегося в hex-формате.
    """
    # Преобразуем hex-строку в байты
    if isinstance(public_pem_hex, str) and public_pem_hex.startswith("\\x"):
        # Убираем префикс "\x" и преобразуем hex-строку в байты
        public_pem_bytes = bytes.fromhex(public_pem_hex[2:])
    elif isinstance(public_pem_hex, bytes):
        # Если данные уже в байтах, используем их напрямую
        public_pem_bytes = public_pem_hex
    else:
        raise ValueError("Неподдерживаемый формат данных для public_pem")

    # Преобразуем байты в строку UTF-8
    public_pem_str = public_pem_bytes.decode('utf-8')

    # Загружаем открытый ключ
    public_key = serialization.load_pem_public_key(
        public_pem_str.encode('utf-8'),
        backend=default_backend()
    )
    return public_key
    
def deserialize_signature(signature_hex):
    """
    Преобразует подпись из hex-формата в байты.
    """
    if isinstance(signature_hex, str) and signature_hex.startswith("\\x"):
        # Убираем префикс "\x" и преобразуем hex-строку в байты
        return bytes.fromhex(signature_hex[2:])
    elif isinstance(signature_hex, bytes):
        # Если данные уже в байтах, используем их напрямую
        return signature_hex
    else:
        raise ValueError("Неподдерживаемый формат данных для подписи")

# Создание ЭЦП для данных
def sign_data(data, private_key):
    # Преобразуем данные в JSON-строку
    data_json = json.dumps(data, sort_keys=True).encode('utf-8')
    
    # Создаём подпись
    signature = private_key.sign(
        data_json,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    return signature

# Проверка ЭЦП
def verify_signature(data, signature_hex, public_key):
    # Преобразуем данные в JSON-строку
    data_json = json.dumps(data, sort_keys=True).encode('utf-8')
    
    signature = deserialize_signature(signature_hex)
    try:
        # Проверяем подпись
        public_key.verify(
            signature,
            data_json,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return True  # Подпись верна
    except Exception as e:
        return False  # Подпись неверна