DATABASE = {
    'dbname': 'hr_system',
    'user': 'postgres',
    'password': 'your_ps',
    'host': 'localhost',  # или IP-адрес вашего сервера
    'port': '5432'  # стандартный порт PostgreSQL
}

SQLALCHEMY_DATABASE_URI = (
    f"postgresql://{DATABASE['user']}:{DATABASE['password']}@"
    f"{DATABASE['host']}:{DATABASE['port']}/{DATABASE['dbname']}?client_encoding=utf8"
)

SQLALCHEMY_TRACK_MODIFICATIONS = False
