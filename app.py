from flask import Flask, render_template, Response, jsonify
from vehicle_detection import detect_vehicles_from_camera, detect_vehicles, vehicle_counts
from traffic_controller import calculate_duration, INITIAL_DURATION

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed1')
def video_feed1():
    stream_url = 'http://192.168.1.6:8080/video'  # IP Webcam stream URL
    return Response(detect_vehicles_from_camera(stream_url, 'camera1'),
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

@app.route('/calculate_duration', methods=['POST'])
def calculate_duration_route():
    duration = calculate_duration(list(vehicle_counts.values()))
    return jsonify({'duration': duration})

@app.route('/initial_duration', methods=['GET'])
def get_initial_duration():
    return jsonify({'duration': INITIAL_DURATION})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)