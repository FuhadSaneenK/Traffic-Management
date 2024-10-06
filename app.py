from flask import Flask, render_template, Response, jsonify
import cv2
import torch

app = Flask(__name__)

# Load YOLOv5 model (use pre-trained YOLOv5 model)
model = torch.hub.load('ultralytics/yolov5', 'yolov5s')

# Global variable to store vehicle counts
vehicle_counts = {
    'video1': 0,
    'video2': 0,
    'video3': 0,
    'video4': 0,
}

# Function to detect vehicles and count them
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

@app.route('/video_feed1')
def video_feed1():
    return Response(detect_vehicles('static/assets/video1.mp4', 'video1'),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

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

@app.route('/vehicle_counts')
def get_vehicle_counts():
    return jsonify(vehicle_counts)

if __name__ == '__main__':
    app.run(debug=True)
