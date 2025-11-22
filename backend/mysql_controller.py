import mysql.connector
from mysql.connector import Error


def init_database(connection, db_name):
    """Creates a database if it doesn't exist."""
    cursor = connection.cursor()
    try:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        print(f"Database '{db_name}' checked/created successfully")
    except Error as err:
        print(f"Error: '{err}'")

def execute_query(connection, query, data=None):
    """
    Universal function for CREATE, UPDATE, DELETE.
    Supports parameterized queries (preventing SQL injection).
    """
    cursor = connection.cursor()
    try:
        if data:
            cursor.execute(query, data)
        else:
            cursor.execute(query)
        connection.commit()
        print("Query successful")
    except Error as err:
        print(f"Error: '{err}'")

def read_query(connection, query, data=None):
    """
    Universal function for READ (SELECT).
    Returns a list of tuples.
    """
    cursor = connection.cursor()
    result = None
    try:
        if data:
            cursor.execute(query, data)
        else:
            cursor.execute(query)
        result = cursor.fetchall()
        return result
    except Error as err:
        print(f"Error: '{err}'")
        return []

# --- Exposed CRUD Wrappers ---

def create_table(connection, create_table_sql):
    """Wrapper for creating tables."""
    execute_query(connection, create_table_sql)

def insert_record(connection, query, data):
    """Wrapper for Insert (C in CRUD)."""
    execute_query(connection, query, data)

def get_records(connection, query):
    """Wrapper for Read (R in CRUD)."""
    return read_query(connection, query)

def update_record(connection, query, data=None):
    """Wrapper for Update (U in CRUD)."""
    execute_query(connection, query, data)

def delete_record(connection, query, data=None):
    """Wrapper for Delete (D in CRUD)."""
    execute_query(connection, query, data)