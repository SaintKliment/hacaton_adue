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

# Десериализация публичного ключа из PEM-формата
def deserialize_public_key(public_pem):
    public_key = serialization.load_pem_public_key(
        public_pem,
        backend=default_backend()
    )
    return public_key

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
def verify_signature(data, signature, public_key):
    # Преобразуем данные в JSON-строку
    data_json = json.dumps(data, sort_keys=True).encode('utf-8')
    
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