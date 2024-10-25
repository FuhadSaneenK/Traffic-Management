import cv2
import torch
import numpy as np
import requests
import time

# Load YOLOv5 model (use pre-trained YOLOv5 model)
model = torch.hub.load('ultralytics/yolov5', 'yolov5s')

# Global variable to store vehicle counts
vehicle_counts = {
    'camera1': 0,
    'video2': 0,
    'video3': 0,
    'video4': 0,
}

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

def detect_vehicles(video_path, video_key):
    global vehicle_counts

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