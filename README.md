# Dynamic Time Allocation for Traffic Management  
*A web-based system for demonstrating real-time adaptive traffic signal control using Flask, HTML, CSS, and JavaScript.*

---

## Overview  
The **Dynamic Time Allocation for Traffic Management** system is a prototype web application developed to demonstrate how traffic signal timings can be adjusted dynamically based on real-time data inputs.  
This project simulates an intelligent traffic control system where traffic light durations change according to live camera feeds or input sources.

The system uses **Flask (Python)** for backend processing, **HTML/CSS** for frontend structure and design, and **JavaScript** for interactivity.  
The application can integrate with **IP cameras or connected devices** to analyze real-time traffic flow and adjust signal timing accordingly.

---

## Objectives  
The main goals of this project are:
- To demonstrate a **real-time adaptive traffic control** mechanism.  
- To integrate a **computer vision-based model** (YOLOv5) for vehicle detection.  
- To provide a **web interface** that visualizes live traffic and signal control.  
- To showcase **Flask as a lightweight backend** framework for real-time data handling.  

---

## Features  
- **Dynamic Signal Time Allocation:** Adjusts traffic light durations based on detected traffic density.  
- **Real-Time Camera Integration:** Supports live feed via IP camera or local video source.  
- **Object Detection Module:** Uses YOLOv5 for detecting vehicles in each lane.  
- **Web-Based Visualization:** Displays camera input, signal timers, and control status on a clean web dashboard.  
- **Lightweight and Modular:** Can be easily extended with additional sensors or APIs.  

---

## Tech Stack  
| Component | Technology |
|------------|-------------|
| **Frontend** | HTML5, CSS3, JavaScript |
| **Backend** | Flask (Python) |
| **Machine Learning Model** | YOLOv5 (PyTorch) |
| **Environment Management** | Python Virtual Environment / FlaskEnv |
| **Dependencies** | Listed in `requirements.txt` |

---
---

## Installation and Setup  

### 1. Clone the Repository  
```bash
git clone https://github.com/your-username/dynamic-traffic-time-allocation.git
cd dynamic-traffic-time-allocation```




## Folder Structure  
