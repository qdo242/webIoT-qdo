from flask import Flask, request, jsonify, Response
from pymongo import MongoClient
import base64
import datetime
from zoneinfo import ZoneInfo  # New in Python 3.9+
from ultralytics import YOLO
import cv2
import numpy as np
import os
import re
import threading
from threading import Thread
from bson import ObjectId

app = Flask(__name__)

SAVE_DIR = "esp32_cam_captured_images"
os.makedirs(SAVE_DIR, exist_ok=True)

# Connect to MongoDB Atlas
client = MongoClient("mongodb+srv://lehoanggiang03:lhg29102003@jianglee-cluster.npz9rbr.mongodb.net/?retryWrites=true&w=majority")

# db = client["mydatabase"]
# collection = db["test"]
# collection = db["plant_image"]

# Declare Database in Cluster.
db = client["project_database"]

#declare Collections in database.
collection_image = db["plant_image"]
collection_environment_data = db["environment_data"]

# Load YOLOv8n model
# model = YOLO("yolov8n.pt")  # Replace with your custom model path if needed
model = YOLO('best.pt')


# Use this URL:
# http://127.0.0.1:5000/latest_image  -  Localhost.
# http://192.168.1.173:5000/latest_image  -  Connect to Internet.


# @app.route("/upload_sensor_data", methods=["GET"])
# def upload_sensor_data_get():
#     # Extract all the parameters from the URL
#     temp = request.args.get("temp", type=float)
#     humd = request.args.get("humd", type=float)
#     lux = request.args.get("lux", type=float)
#     sensor_1 = request.args.get("sensor_1", type=int)
#     sensor_2 = request.args.get("sensor_2", type=int)
#     sensor_3 = request.args.get("sensor_3", type=int)
#     sensor_4 = request.args.get("sensor_4", type=int)
#     sensor_5 = request.args.get("sensor_5", type=int)
#     sensor_6 = request.args.get("sensor_6", type=int)

#     # Check if all required parameters are provided
#     if None in [temp, humd, lux, sensor_1, sensor_2, sensor_3, sensor_4, sensor_5, sensor_6]:
#         return jsonify({"error": "Missing one or more parameters"}), 400

#     # Create the document to store in MongoDB
#     now = datetime.datetime.now()
#     doc = {
#         "date": now.strftime("%Y-%m-%d"),
#         "time": now.strftime("%H:%M:%S"),
#         "temp": temp,
#         "humd": humd,
#         "lux": lux,
#         "sensor_1": sensor_1,
#         "sensor_2": sensor_2,
#         "sensor_3": sensor_3,
#         "sensor_4": sensor_4,
#         "sensor_5": sensor_5,
#         "sensor_6": sensor_6,
#     }

#     # Insert the document into MongoDB
#     collection_environment_data.insert_one(doc)

#     return jsonify({"status": "success", "message": "Data stored"}), 200

# Upload data from Sensor_Node to MongoDB.
@app.route("/upload_sensor_data", methods=["POST"])
def upload_sensor_data():
    data = request.json
    # print("Raw JSON received:", data)
    required_fields = ["temp", "humd", "lux", "sensor_1", "sensor_2", "sensor_3", "sensor_4", "sensor_5", "sensor_6"]

    if not data or not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    missing = [field for field in required_fields if field not in data]
    if missing:
        print("Missing fields:", missing)
        return jsonify({"error": "Missing required fields", "missing": missing}), 400

    # now = datetime.datetime.now(datetime.UTC)
    now = datetime.datetime.now(ZoneInfo("Asia/Ho_Chi_Minh"))
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M:%S")

    doc = {
        "date": date_str,
        "time": time_str,
        "temp": float(data["temp"]),
        "humid": float(data["humd"]),
        "lux": float(data["lux"]),
        "soil_1": float(data["sensor_1"]),
        "soil_2": float(data["sensor_2"]),
        "soil_3": float(data["sensor_3"]),
        "soil_4": float(data["sensor_4"]),
        "soil_5": float(data["sensor_5"]),
        "soil_6": float(data["sensor_6"])
    }

    collection_environment_data.insert_one(doc)

    return jsonify({"status": "success", "message": "Data stored"}), 200

# Process the received image, then insert it to MongoDB. 
# This function will only work if the Server has successfully received the image from ESP32.
def process_and_store_image(img_bytes, index):
    # Convert bytes to image
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        print("Error: Invalid image")
        return
    
    # # Run YOLO model
    # results = model(img)[0]
    
    # resize the image to 480 x 320 pixel.
    resized_img = cv2.resize(img, (600, 400))

    # Run YOLO model
    results = model(resized_img)[0]

    # Annotate image and collect result summary
    result_summary = []
    for box in results.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        conf = float(box.conf[0])
        cls = int(box.cls[0])
        label = model.names[cls]
        result_summary.append(f"{label} {conf:.2f}")
        cv2.rectangle(resized_img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(resized_img, f'{label} {conf:.2f}', (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    # Convert image to base64
    _, buffer = cv2.imencode('.jpg', resized_img)
    img_b64 = base64.b64encode(buffer).decode('utf-8')

    # Prepare MongoDB document
    now = datetime.datetime.now(ZoneInfo("Asia/Ho_Chi_Minh"))
    doc = {
        "date": now.strftime("%Y-%m-%d"),
        "time": now.strftime("%H:%M:%S"),
        "index": index,
        "image_base64": img_b64,
        "result": result_summary
    }

    # Insert into MongoDB
    result = collection_image.insert_one(doc)
    print(f"Image stored with ID: {result.inserted_id}")

# Upload the processed image which was sent from ESP32 to MongoDB.
@app.route("/upload_image", methods=["POST"])
def upload_image():
    img_bytes = request.data
    index = request.args.get("index", default=0, type=int)

    if not img_bytes:
        return jsonify({"error": "No image received"}), 400

    # Immediately return a success response
    Thread(target=process_and_store_image, args=(img_bytes, index)).start()
    return jsonify({"status": "received"}), 200

# def upload_image():
#     img_bytes = request.data
#     index = request.args.get("index", default=0, type=int)

#     if not img_bytes:
#         return jsonify({"error": "No image received"}), 400

#     nparr = np.frombuffer(img_bytes, np.uint8)
#     img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
#     if img is None:
#         return jsonify({"error": "Invalid image"}), 400

#     results = model(img)[0]

#     result_summary = []
#     for box in results.boxes:
#         x1, y1, x2, y2 = map(int, box.xyxy[0])
#         conf = float(box.conf[0])
#         cls = int(box.cls[0])
#         label = model.names[cls]
#         result_summary.append(f"{label} {conf:.2f}")
#         cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
#         cv2.putText(img, f'{label} {conf:.2f}', (x1, y1 - 10),
#                     cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

#     _, buffer = cv2.imencode('.jpg', img)
#     img_b64 = base64.b64encode(buffer).decode('utf-8')

#     # now = datetime.datetime.utcnow()
#     # now = datetime.datetime.now(datetime.UTC)
#     now = datetime.datetime.now(ZoneInfo("Asia/Ho_Chi_Minh"))
#     doc = {
#         "date": now.strftime("%Y-%m-%d"),
#         "time": now.strftime("%H:%M:%S"),
#         "index": index,
#         "image_base64": img_b64,
#         "result": result_summary
#     }

#     result = collection_image.insert_one(doc)
#     return jsonify({"status": "success", "id": str(result.inserted_id)}), 200

# Get the index of the latest image in the folder. User has to modify the index value, base on datasets.
def get_next_filename():
    index = len(os.listdir(SAVE_DIR)) + 201
    return os.path.join(SAVE_DIR, f"img_{index}.jpg")

# Background image processing
def process_image_after_receive(img_bytes):
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        print("[ERROR] Invalid image data")
        return

    cv2.imshow("ESP32-CAM Image", img)
    key = cv2.waitKey(0) & 0xFF
    if key == ord('s'):
        filename = get_next_filename()
        cv2.imwrite(filename, img)
        print(f"[INFO] Image saved as {filename}")
    elif key == ord('d'):
        print("[INFO] Image discarded")
    else:
        print("[INFO] No action taken")
    cv2.destroyAllWindows()

# get the image sent from ESP32, then User will decide to store the image on Server, or discard it.
@app.route("/capture_and_save_to_server", methods=["POST"])
def capture_and_save_to_server():
    img_bytes = request.data

    if not img_bytes:
        return jsonify({"error": "No image received"}), 400

    # Launch processing in background
    threading.Thread(target=process_image_after_receive, args=(img_bytes,)).start()

    # Respond immediately
    return jsonify({"status": "received"}), 200

# read the latest image in MongoDB, base on the index of the picture (from 1 - 6), then return it, can use web browser to access.
@app.route("/latest_image", methods=["GET"])
def latest_image():
    # Get the index from the query string (e.g., /latest_image?ieddndex=2)
    index = request.args.get("index", type=int)

    # Validate the index
    if not index or not (1 <= index <= 6):
        return "Invalid or missing index. Index must be between 1 and 6.", 400

    # Fetch the latest document with the given index
    latest_doc = collection_image.find_one(
        {"index": index},  # filter by index
        sort=[("_id", -1)]  # sort by insertion time (latest first)
    )

    if not latest_doc:
        return f"No documents found with index {index}.", 404
    if "image_base64" not in latest_doc:
        return "No 'image_base64' field found in the latest document.", 404

    # Decode the base64 image
    try:
        image_data = base64.b64decode(latest_doc["image_base64"])
    except Exception as e:
        return f"Failed to decode base64 image: {e}", 500

    # Return the image
    return Response(image_data, mimetype="image/jpeg")

# Cách gọi URL để xem ảnh: 
# 1. Chạy chương trình
# 2. Copy URL http://192.168......./get_image_by_index_and_id?id=Gán id trong MongoDB
@app.route("/get_image_by_index_and_id", methods=["GET"])
def get_image_by_index_and_id():
    # Get 'index' and 'id' from the query string
    # index = request.args.get("index", type=int)
    doc_id = request.args.get("id", type=str)

    # # Validate parameters
    # if not index or not (1 <= index <= 6):
    #     return "Invalid or missing index. Must be between 1 and 6.", 400
    # if not doc_id:
    #     return "Missing 'id' parameter.", 400

    try:
        object_id = ObjectId(doc_id)
    except Exception as e:
        return f"Invalid ObjectId format: {e}", 400

    # Query MongoDB using both 'index' and '_id'
    doc = collection_image.find_one({
        "_id": object_id,
        # "index": index
    })

    if not doc:
        return f"No document found with id {doc_id}.", 404
    if "image_base64" not in doc:
        return "Field 'image_base64' not found in the document.", 404

    try:
        image_data = base64.b64decode(doc["image_base64"])
    except Exception as e:
        return f"Error decoding image: {e}", 500

    return Response(image_data, mimetype="image/jpeg")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)