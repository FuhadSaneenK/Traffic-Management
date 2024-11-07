from flask import Flask, render_template, Response, jsonify, request
from vehicle_detection import detect_vehicles_from_camera, detect_vehicles, vehicle_counts
import traffic_controller 

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed1')
def video_feed1():
    stream_url = 'http://192.168.1.7:8080/video'  # IP Webcam stream URL
    return Response(detect_vehicles_from_camera(stream_url, 'camera1'),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/video_feed2')
def video_feed2():
    return Response(detect_vehicles('static/assets/video6.mp4', 'video2'),
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

@app.route('/calculate_duration', methods=['POST'])
def calculate_duration_route():
    data = request.get_json()
    current_lane_count = data.get('currentLaneCount', 0)
    
    # Calculate duration based on currentLaneCount
    duration = traffic_controller.calculate_duration(current_lane_count)
    
    return jsonify({'duration': duration})

@app.route('/initial_duration', methods=['GET'])
def get_initial_duration():
    return jsonify({'duration': 10})  # Initial duration is 10 seconds

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)