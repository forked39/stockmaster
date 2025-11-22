import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os
from .mysql_controller import create_table

load_dotenv()

HOST= os.getenv("HOST")
PORT = os.getenv("PORT",3306)
USER = os.getenv("USER")
PASS = os.getenv("PASS")
DB_NAME = os.getenv("DB_NAME")

TABLES = {

    "categories": """
        CREATE TABLE IF NOT EXISTS categories (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(80) NOT NULL UNIQUE,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP 
                ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    """,

    "users": """
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(50) NOT NULL,
            email VARCHAR(80) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP 
                ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    """,

    "warehouses": """
        CREATE TABLE IF NOT EXISTS warehouses (
            id INT PRIMARY KEY AUTO_INCREMENT,
            wh_name VARCHAR(50) NOT NULL,
            short_code VARCHAR(10),
            address VARCHAR(120),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP 
                ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    """,

    "locations": """
        CREATE TABLE IF NOT EXISTS locations (
            id INT PRIMARY KEY AUTO_INCREMENT,
            loc_name VARCHAR(50) NOT NULL,
            short_code VARCHAR(10),
            warehouse_id INT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP 
                ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_locations_warehouse 
                FOREIGN KEY (warehouse_id)
                REFERENCES warehouses(id)
                ON DELETE RESTRICT 
                ON UPDATE CASCADE
        ) ENGINE=InnoDB;
    """,

    "products": """
        CREATE TABLE IF NOT EXISTS products (
            id INT PRIMARY KEY AUTO_INCREMENT,
            product_name VARCHAR(60) NOT NULL,
            sku VARCHAR(40) NOT NULL UNIQUE,
            category_id INT,
            uom VARCHAR(20),
            unit_cost DECIMAL(10,2) DEFAULT 0.00,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP 
                ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_products_category 
                FOREIGN KEY (category_id)
                REFERENCES categories(id)
                ON DELETE SET NULL 
                ON UPDATE CASCADE
        ) ENGINE=InnoDB;
    """,

    "stock_levels": """
        CREATE TABLE IF NOT EXISTS stock_levels (
            id INT PRIMARY KEY AUTO_INCREMENT,
            product_id INT NOT NULL,
            warehouse_id INT NOT NULL,
            location_id INT,
            qty_on_hand INT NOT NULL DEFAULT 0,
            qty_reserved INT NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP 
                ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY ux_stock_prod_wh_loc (product_id, warehouse_id, location_id),
            INDEX idx_stock_product (product_id),
            INDEX idx_stock_warehouse (warehouse_id),
            CONSTRAINT fk_stock_product 
                FOREIGN KEY (product_id)
                REFERENCES products(id)
                ON DELETE CASCADE 
                ON UPDATE CASCADE,
            CONSTRAINT fk_stock_warehouse 
                FOREIGN KEY (warehouse_id)
                REFERENCES warehouses(id)
                ON DELETE CASCADE 
                ON UPDATE CASCADE,
            CONSTRAINT fk_stock_location 
                FOREIGN KEY (location_id)
                REFERENCES locations(id)
                ON DELETE SET NULL 
                ON UPDATE CASCADE
        ) ENGINE=InnoDB;
    """,

    "receipts": """
        CREATE TABLE IF NOT EXISTS receipts (
            id INT PRIMARY KEY AUTO_INCREMENT,
            reference VARCHAR(40) NOT NULL UNIQUE,
            from_contact VARCHAR(60),
            warehouse_id INT NOT NULL,
            location_id INT,
            schedule_date DATE,
            status ENUM('draft','ready','done') NOT NULL DEFAULT 'draft',
            responsible VARCHAR(60),
            created_by INT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP 
                ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_receipts_wh 
                FOREIGN KEY (warehouse_id)
                REFERENCES warehouses(id)
                ON DELETE RESTRICT 
                ON UPDATE CASCADE,
            CONSTRAINT fk_receipts_loc 
                FOREIGN KEY (location_id)
                REFERENCES locations(id)
                ON DELETE SET NULL 
                ON UPDATE CASCADE,
            CONSTRAINT fk_receipts_user 
                FOREIGN KEY (created_by)
                REFERENCES users(id)
                ON DELETE SET NULL 
                ON UPDATE CASCADE
        ) ENGINE=InnoDB;
    """,

    "receipt_items": """
        CREATE TABLE IF NOT EXISTS receipt_items (
            id INT PRIMARY KEY AUTO_INCREMENT,
            receipt_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL DEFAULT 0,
            unit_cost DECIMAL(10,2),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_receiptitems_receipt 
                FOREIGN KEY (receipt_id)
                REFERENCES receipts(id)
                ON DELETE CASCADE 
                ON UPDATE CASCADE,
            CONSTRAINT fk_receiptitems_product 
                FOREIGN KEY (product_id)
                REFERENCES products(id)
                ON DELETE RESTRICT 
                ON UPDATE CASCADE
        ) ENGINE=InnoDB;
    """,

    "deliveries": """
        CREATE TABLE IF NOT EXISTS deliveries (
            id INT PRIMARY KEY AUTO_INCREMENT,
            reference VARCHAR(40) NOT NULL UNIQUE,
            warehouse_id INT NOT NULL,
            location_id INT,
            delivery_address VARCHAR(120),
            responsible VARCHAR(60),
            operation_type VARCHAR(40),
            schedule_date DATE,
            status ENUM('draft','waiting','ready','done') 
                NOT NULL DEFAULT 'draft',
            created_by INT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP 
                ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_deliveries_wh 
                FOREIGN KEY (warehouse_id)
                REFERENCES warehouses(id)
                ON DELETE RESTRICT 
                ON UPDATE CASCADE,
            CONSTRAINT fk_deliveries_loc 
                FOREIGN KEY (location_id)
                REFERENCES locations(id)
                ON DELETE SET NULL 
                ON UPDATE CASCADE,
            CONSTRAINT fk_deliveries_user 
                FOREIGN KEY (created_by)
                REFERENCES users(id)
                ON DELETE SET NULL 
                ON UPDATE CASCADE
        ) ENGINE=InnoDB;
    """,

    "delivery_items": """
        CREATE TABLE IF NOT EXISTS delivery_items (
            id INT PRIMARY KEY AUTO_INCREMENT,
            delivery_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_deliveryitems_delivery 
                FOREIGN KEY (delivery_id)
                REFERENCES deliveries(id)
                ON DELETE CASCADE 
                ON UPDATE CASCADE,
            CONSTRAINT fk_deliveryitems_product 
                FOREIGN KEY (product_id)
                REFERENCES products(id)
                ON DELETE RESTRICT 
                ON UPDATE CASCADE
        ) ENGINE=InnoDB;
    """,

    "move_history": """
        CREATE TABLE IF NOT EXISTS move_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reference VARCHAR(40),
    `date` DATE,
    from_location VARCHAR(60),
    to_location VARCHAR(60),
    product_id INT,
    qty INT NOT NULL DEFAULT 0,
    doc_type VARCHAR(30),
    doc_id INT,
    status VARCHAR(30),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_movehistory_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    INDEX idx_move_product (product_id),
    INDEX idx_move_doc (doc_type, doc_id)
        ) ENGINE=InnoDB;
    """
}



def get_connection():
    
    connection = None
    try:
        connection = mysql.connector.connect(
            host=HOST,
            user=USER,
            password=PASS,
            database=DB_NAME,
            port=PORT,
            use_pure=True,
            buffered=True)
        
        if connection.is_connected():
            print("DB Connection succeeded\n")

            if connection:
                for table_name, sql in TABLES.items():
                    print(f"Creating table: {table_name}")
                    create_table(connection, sql)


            return connection

    except Error as e:
        print(f"\n!!! CONNECTION ERROR !!!")
        print(f"Error Code: {e.errno}")
        print(f"Error Message: {e.msg}")
        return None

