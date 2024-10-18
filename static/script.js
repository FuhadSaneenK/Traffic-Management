// traffic-simulator.js

// Timer functionality
function startTimer() {
    let timeLeft = 10;
    const timerDisplay = document.getElementById('timer-display');
    
    function updateTimer() {
        if (timeLeft >= 0) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            timeLeft--;
            setTimeout(updateTimer, 1000);
        } else {
            timeLeft = 10;
            updateTimer();
        }
    }
    
    updateTimer();
}

// Update current time in the header
function updateCurrentTime() {
    const currentTimeElement = document.getElementById('current-time');
    setInterval(() => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour12: false });
        currentTimeElement.textContent = timeString;
    }, 1000);
}

// Simulation control buttons functionality
function setupSimulationControls() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');

    startBtn.addEventListener('click', () => {
        console.log('Simulation started');
        // Add logic to start the simulation
    });

    pauseBtn.addEventListener('click', () => {
        console.log('Simulation paused');
        // Add logic to pause the simulation
    });

    resetBtn.addEventListener('click', () => {
        console.log('Simulation reset');
        // Add logic to reset the simulation
    });
}

// Update vehicle counts 
// Update vehicle counts
function updateVehicleCounts() {
    fetch('/vehicle_counts')
        .then(response => response.json())
        .then(data => {
            document.querySelector('.video-container:nth-child(1) .vehicle-count').innerText = `Vehicles: ${data.camera1}`;
            document.querySelector('.video-container:nth-child(2) .vehicle-count').innerText = `Vehicles: ${data.camera2}`;
            document.querySelector('.video-container:nth-child(3) .vehicle-count').innerText = `Vehicles: ${data.camera3}`;
            document.querySelector('.video-container:nth-child(4) .vehicle-count').innerText = `Vehicles: ${data.camera4}`;
        })
        .catch(error => console.error('Error fetching vehicle counts:', error));
}


// Initialize all functionalities
function initializeSimulator() {
    startTimer();
    updateCurrentTime();
    // setupSimulationControls();
    // updateVehicleCounts();
    
    // Update vehicle counts every 5 seconds (for demonstration)
    setInterval(updateVehicleCounts, 5000);
}

// Run initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeSimulator);