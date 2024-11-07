let currentVideoIndex = 0;
const videoCount = 4;
let timer = null;
let feedIntervals = [];
let isRunning = false;
let vehicleCounts = [0, 0, 0, 0];

// Update vehicle counts
function updateVehicleCounts() {
    fetch('/vehicle_counts')
        .then(response => response.json())
        .then(data => {
            document.querySelector('.video-container:nth-child(1) .vehicle-count').innerText = `Vehicles: ${data.camera1}`;
            document.querySelector('.video-container:nth-child(2) .vehicle-count').innerText = `Vehicles: ${data.video2}`;
            document.querySelector('.video-container:nth-child(3) .vehicle-count').innerText = `Vehicles: ${data.video3}`;
            document.querySelector('.video-container:nth-child(4) .vehicle-count').innerText = `Vehicles: ${data.video4}`;
            
            // Store the current lane vehicle count
            vehicleCounts[currentVideoIndex] = data[`video${currentVideoIndex + 2}`] || 0;
        })
        .catch(error => console.error('Error fetching vehicle counts:', error));
}

// Update vehicle counts every 2 seconds
setInterval(updateVehicleCounts, 2000);

function startFeed(feedIndex) {
    if (feedIntervals[feedIndex]) {
        clearInterval(feedIntervals[feedIndex]);
    }
    
    const img = document.getElementById(`video${feedIndex + 1}`);
    img.src = `/video_feed${feedIndex + 1}?t=${new Date().getTime()}`;

    feedIntervals[feedIndex] = setInterval(() => {
        img.src = `/video_feed${feedIndex + 1}?t=${new Date().getTime()}`;
    }, 1000 * 60);
}

function pauseFeed(feedIndex) {
    if (feedIntervals[feedIndex]) {
        clearInterval(feedIntervals[feedIndex]);
        feedIntervals[feedIndex] = null;
    }
}

function takeAllScreenshots() {
    const currentLaneCount = vehicleCounts[currentVideoIndex];
    console.log(currentLaneCount);

    return fetch('/calculate_duration', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            currentLaneCount: currentLaneCount
        })
    })
    .then(response => response.json())
    .then(data => {
        window.nextDuration = data.duration;
        return data.duration;
    })
    .catch(error => {
        console.error('Error calculating duration:', error);
        window.nextDuration = 60; // Default fallback duration
        return 60;
    });
}

function startTimer(initialDuration) {
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }

    let timeLeft = initialDuration;
    const timerDisplay = document.getElementById('timer-display');

    function updateTimer() {
        if (!isRunning) return;

        if (timeLeft >= 0) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft === 5) {
                takeAllScreenshots()
                    .then(duration => {
                        // Store the duration for use after current timer ends
                        window.nextDuration = duration;
                    })
                    .catch(error => {
                        console.error("Error in calculating new duration:", error);
                        window.nextDuration = 60; // Default duration
                    });
            }

            timeLeft--;
            timer = setTimeout(updateTimer, 1000);
        } else {
            // Timer has ended, switch to the next video feed
            if (isRunning) {
                switchToNextLane();
            }
        }
    }

    updateTimer();
}

function switchToNextLane() {
    // Pause current feed
    pauseFeed(currentVideoIndex);
    
    // Switch to next lane
    currentVideoIndex = (currentVideoIndex + 1) % videoCount;
    
    // Update traffic lights
    updateTrafficLights(currentVideoIndex + 1);
    
    // Start new feed
    startFeed(currentVideoIndex);
    
    // Start timer with stored duration or default
    const duration = window.nextDuration || 10;
    window.nextDuration = null; // Clear stored duration
    startTimer(duration);
}

function updateTrafficLights(activeVideoIndex) {
    const containers = document.querySelectorAll('.video-container');
    containers.forEach((container, index) => {
        container.classList.remove('active', 'green', 'yellow', 'red');
        
        if (index + 1 === activeVideoIndex) {
            container.classList.add('active', 'green');
            if (isRunning) {
                startFeed(index);
            }
        } else {
            container.classList.add('red');
            pauseFeed(index);
        }
    });
}

function updateCurrentTime() {
    const currentTimeElement = document.getElementById('current-time');
    if (!currentTimeElement) return;

    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        currentTimeElement.textContent = timeString;
    }

    updateTime();
    return setInterval(updateTime, 1000);
}

function initializeSimulator() {
    isRunning = false;
    currentVideoIndex = 0;
    vehicleCounts = [0, 0, 0, 0];
    window.nextDuration = null;
    
    if (timer) clearTimeout(timer);
    feedIntervals.forEach(interval => {
        if (interval) clearInterval(interval);
    });
    feedIntervals = [];

    updateTrafficLights(1);
    document.getElementById('timer-display').textContent = '00:00';
}

document.addEventListener('DOMContentLoaded', () => {
    updateCurrentTime();
    initializeSimulator();

    const startButton = document.querySelector('.controls button:nth-child(1)');
    const pauseButton = document.querySelector('.controls button:nth-child(2)');
    const resetButton = document.querySelector('.controls button:nth-child(3)');

    startButton?.addEventListener('click', () => {
        if (!isRunning) {
            isRunning = true;
            fetch('/initial_duration')
                .then(response => response.json())
                .then(data => {
                    startFeed(currentVideoIndex);
                    startTimer(data.duration);
                })
                .catch(error => {
                    console.error('Error getting initial duration:', error);
                    startTimer(60); // Default fallback duration
                });
        }
    });

    pauseButton?.addEventListener('click', () => {
        isRunning = false;
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        feedIntervals.forEach((interval, index) => {
            if (interval) {
                clearInterval(interval);
                feedIntervals[index] = null;
            }
        });
    });

    resetButton?.addEventListener('click', () => {
        isRunning = false;
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        feedIntervals.forEach((interval, index) => {
            if (interval) {
                clearInterval(interval);
                feedIntervals[index] = null;
            }
        });
        initializeSimulator();
    });
});