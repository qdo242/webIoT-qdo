from pymongo import MongoClient
from datetime import datetime
import random

# Setup database info on MongoDB.
client = MongoClient("mongodb+srv://lehoanggiang03:lhg29102003@jianglee-cluster.npz9rbr.mongodb.net/?retryWrites=true&w=majority")
db = client["project_database"]
collection_environment_data = db["environment_data"]

# Function to generate the document base on random info.
def create_document(date_str, time_str):
    doc = {
        "date": date_str,
        "time": time_str,
        "temp": round(random.uniform(29.00, 32.00), 2),
        "humid": round(random.uniform(69.00, 75.00), 2),
        "lux": random.randint(130, 150),
        "soil_1": round(random.uniform(70.00, 81.00), 2),
        "soil_2": round(random.uniform(70.00, 81.00), 2),
        "soil_3": round(random.uniform(70.00, 81.00), 2),
        "soil_4": round(random.uniform(70.00, 81.00), 2),
        "soil_5": round(random.uniform(70.00, 81.00), 2),
        "soil_6": round(random.uniform(70.00, 81.00), 2),
    }
    return doc

# date input with format: DD-MM-YYYY.
while True:
    date_input = input("Enter date (DD-MM-YYYY): ").strip()
    try:
        parsed_date = datetime.strptime(date_input, "%d-%m-%Y")
        date_str = parsed_date.strftime("%Y-%m-%d")
        break
    except ValueError:
        print("[ERROR] Invalid date format. Please use DD-MM-YYYY.")

# time input with format: HH-MM-SS (24h format).
while True:
    time_input = input("Enter time in 24h format (HH:MM:SS): ").strip()
    try:
        datetime.strptime(time_input, "%H:%M:%S")
        break
    except ValueError:
        print("[ERROR] Invalid time format. Please use HH:MM:SS.")

# Create and insert the document
document = create_document(date_str, time_input)
insert_result = collection_environment_data.insert_one(document)

# Print result line by line
print(f"[INFO] Document inserted with _id: {insert_result.inserted_id}")
for key, value in document.items():
    print(f"{key}: {value}")
