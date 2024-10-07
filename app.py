from flask import Flask, render_template, Response, jsonify
import cv2
import torch
import time
import numpy as np
import requests

app = Flask(__name__)

# Load YOLOv5 model (use pre-trained YOLOv5 model)
model = torch.hub.load('ultralytics/yolov5', 'yolov5s')

# Global variable to store vehicle counts
vehicle_counts = {
    'camera1': 0,
    'video2': 0,
    'video3': 0,
    'video4': 0,
}

# Function to detect vehicles and count them from the IP Webcam stream
def detect_vehicles_from_camera(stream_url, video_key):
    global vehicle_counts

    while True:
        try:
            img_resp = requests.get(stream_url, stream=True, timeout=10)
            img_resp.raise_for_status()
            byte_stream = b''

            for chunk in img_resp.iter_content(chunk_size=1024):
                byte_stream += chunk
                a = byte_stream.find(b'\xff\xd8')
                b = byte_stream.find(b'\xff\xd9')
                
                if a != -1 and b != -1:
                    jpg = byte_stream[a:b+2]
                    byte_stream = byte_stream[b+2:]
                    frame = cv2.imdecode(np.frombuffer(jpg, dtype=np.uint8), cv2.IMREAD_COLOR)

                    # Perform vehicle detection
                    results = model(frame)
                    vehicles = results.xyxy[0].cpu().numpy()

                    # Count vehicles for 'car', 'truck', 'bus', 'motorcycle'
                    vehicle_count = sum(1 for obj in vehicles if obj[5] in [2, 3, 5, 7])  # Class IDs for vehicles
                    
                    # Update the global vehicle count
                    vehicle_counts[video_key] = vehicle_count

                    # Optionally, display the video with bounding boxes
                    for obj in vehicles:
                        x1, y1, x2, y2, conf, class_id = obj
                        if class_id in [2, 3, 5, 7]:  # Vehicle classes
                            cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)

                    # Encode frame to stream in Flask
                    _, buffer = cv2.imencode('.jpg', frame)
                    frame = buffer.tobytes()

                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

        except requests.RequestException as e:
            print(f"Error connecting to stream: {e}")
            time.sleep(5)  # Wait for 5 seconds before retrying
        except Exception as e:
            print(f"An error occurred: {e}")
            time.sleep(5)  # Wait for 5 seconds before retrying

# Function to detect vehicles and count them from videos (for video2, video3, video4)
def detect_vehicles(video_path, video_key):
    global vehicle_counts  # Access the global variable

    cap = cv2.VideoCapture(video_path)
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Perform vehicle detection
        results = model(frame)
        vehicles = results.xyxy[0].cpu().numpy()

        # Count vehicles for 'car', 'truck', 'bus', 'motorcycle'
        vehicle_count = sum(1 for obj in vehicles if obj[5] in [2, 3, 5, 7])  # Class IDs for vehicles
        
        # Update the global vehicle count
        vehicle_counts[video_key] = vehicle_count

        # Optionally, display the video with bounding boxes
        for obj in vehicles:
            x1, y1, x2, y2, conf, class_id = obj
            if class_id in [2, 3, 5, 7]:  # Vehicle classes
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)

        # Encode frame to stream in Flask
        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    cap.release()

@app.route('/')
def index():
    return render_template('index.html')

# Camera stream feed (IP Webcam)
@app.route('/video_feed1')
def video_feed1():
    stream_url = 'http://192.168.1.6:8080/video'  # IP Webcam stream URL
    return Response(detect_vehicles_from_camera(stream_url, 'camera1'),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# Video feeds for video2, video3, and video4 remain the same
@app.route('/video_feed2')
def video_feed2():
    return Response(detect_vehicles('static/assets/video2.mp4', 'video2'),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/video_feed3')
def video_feed3():
    return Response(detect_vehicles('static/assets/video3.mp4', 'video3'),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/video_feed4')
def video_feed4():
    return Response(detect_vehicles('static/assets/video4.mp4', 'video4'),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# Endpoint to return vehicle counts for all feeds
@app.route('/vehicle_counts')
def get_vehicle_counts():
    return jsonify(vehicle_counts)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)