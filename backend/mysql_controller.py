import mysql.connector
from mysql.connector import Error

def init_database(connection, db_name):
    """Creates a database if it doesn't exist."""
    cursor = connection.cursor(buffered=True)
    try:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        print(f"Database '{db_name}' checked/created successfully")
    except Error as err:
        print(f"Error: '{err}'")
    finally:
        cursor.close()

def execute_query(connection, query, data=None):
    """
    Universal function for CREATE, UPDATE, DELETE.
    """
    cursor = connection.cursor(buffered=True)
    try:
        if data:
            cursor.execute(query, data)
        else:
            cursor.execute(query)
        connection.commit()
        print("Query successful")
    except Error as err:
        print(f"Error: '{err}'")
    finally:
        cursor.close()

def read_query(connection, query, data=None):
    """
    Internal function to execute SELECT queries.
    """
    cursor = connection.cursor(buffered=True)
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
    finally:
        cursor.close()

# --- Exposed CRUD Wrappers ---

def create_table(connection, create_table_sql):
    execute_query(connection, create_table_sql)

def insert_record(connection, query, data):
    execute_query(connection, query, data)

def update_record(connection, query, data=None):
    execute_query(connection, query, data)

def delete_record(connection, query, data=None):
    execute_query(connection, query, data)

# --- MODIFIED READ FUNCTIONS ---

def get_all_records(connection, table_name):
    """
    Fetches ALL rows from a table.
    Usage: get_all_records(conn, "users")
    """
    query = f"SELECT * FROM {table_name}"
    return read_query(connection, query)

def get_specific_records(connection, table_name, condition_dict):
    """
    Fetches specific rows based on a dictionary of conditions.
    Usage: get_specific_records(conn, "users", {"id": 5, "status": "active"})
    """
    conditions = []
    for key in condition_dict:
        conditions.append(f"{key} = %s")

    where_clause = " AND ".join(conditions)
    query = f"SELECT * FROM {table_name} WHERE {where_clause}"
    values = tuple(condition_dict.values())

    return read_query(connection, query, values)
