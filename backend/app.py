from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pydantic
from backend import mysql_connect as db
from backend import mysql_controller as db1
from mysql.connector import Error


#Fast api app creating for stockmaster
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

#MYSQL connection
connection = db.get_connection()

#REST Controller-Dashboard
@app.get("/dashboard")
def get_dashboard_metrics():
    response_data = {
        "total_products": 0,
        "total_stock_on_hand": 0,
        "receipts": 0,
        "deliveries": 0
    }

    try:
        # products & stock (unchanged)
        prod_res = db1.read_query(connection, "SELECT COUNT(*) FROM products")
        if prod_res and prod_res[0][0] is not None:
            response_data["total_products"] = int(prod_res[0][0])

        stock_res = db1.read_query(connection, "SELECT SUM(qty_on_hand) FROM stock_levels")
        if stock_res and stock_res[0][0] is not None:
            response_data["total_stock_on_hand"] = int(stock_res[0][0])

        # single aggregated query for receipts/deliveries (robust to spaces/case)
        agg_sql = """
        SELECT
          SUM(CASE WHEN TRIM(UPPER(op_type)) = 'IN'  THEN 1 ELSE 0 END) AS receipts,
          SUM(CASE WHEN TRIM(UPPER(op_type)) = 'OUT' THEN 1 ELSE 0 END) AS deliveries
        FROM operations;
        """
        agg_res = db1.read_query(connection, agg_sql)
        if agg_res and len(agg_res) > 0:
            # agg_res[0] is a tuple (receipts, deliveries)
            receipts_val, deliveries_val = agg_res[0]
            response_data["receipts"] = int(receipts_val or 0)
            response_data["deliveries"] = int(deliveries_val or 0)

        return response_data

    except Error as e:
        print(f"Dashboard DB Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"Dashboard Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/search")
def search_items(q: str = None, limit: int = 10):
    return {"query": q, "limit": limit}