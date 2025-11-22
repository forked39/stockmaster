import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os

load_dotenv()

HOST= os.getenv("HOST")
PORT = os.getenv("PORT",3306)
USER = os.getenv("USER")
PASS = os.getenv("PASS")
DB_NAME = os.getenv("DB_NAME")


def get_connection():
    
    connection = None
    try:
        connection = mysql.connector.connect(
            host=HOST,
            user=USER,
            password=PASS,
            database=DB_NAME,
            port=PORT,
            use_pure=True)
        
        if connection.is_connected():
            print("DB Connection succeeded\n")
            return connection

    except Error as e:
        print(f"\n!!! CONNECTION ERROR !!!")
        print(f"Error Code: {e.errno}")
        print(f"Error Message: {e.msg}")
        return None

def close_connection(connection):
    """Safely closes the connection."""
    if connection and connection.is_connected():
        connection.close()