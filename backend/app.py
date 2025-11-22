from fastapi import FastAPI
import pydantic
from backend import mysql_connect as db

#Fast api app creating for stockmaster
app = FastAPI()

#MYSQL connection
connection = db.get_connection()