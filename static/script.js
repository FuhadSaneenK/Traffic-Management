let currentVideoIndex = 0;
const videoCount = 4;
let timer = null;
let feedIntervals = [];
let isRunning = false;
let vehicleCounts = [0, 0, 0, 0];

// Function to start or resume a feed
function startFeed(feedIndex) {
    // Clear any existing interval first
    if (feedIntervals[feedIndex]) {
        clearInterval(feedIntervals[feedIndex]);
    }
    
    const img = document.getElementById(`video${feedIndex + 1}`);
    feedIntervals[feedIndex] = setInterval(() => {
        img.src = `/video_feed${feedIndex + 1}?t=${new Date().getTime()}`;
    }, 1000);
}

// Function to pause a feed
function pauseFeed(feedIndex) {
    if (feedIntervals[feedIndex]) {
        clearInterval(feedIntervals[feedIndex]);
        feedIntervals[feedIndex] = null;
    }
}

// Function to take screenshots of all lanes
function takeAllScreenshots() {
    for (let i = 0; i < videoCount; i++) {
        const img = document.getElementById(`video${i + 1}`);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
        
        canvas.toBlob((blob) => {
            const formData = new FormData();
            formData.append('screenshot', blob, `screenshot_video${i + 1}.png`);
            formData.append('videoIndex', i);
            
            fetch('/save_screenshot', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log(`Screenshot saved for lane ${i + 1}:`, data);
                vehicleCounts[i] = data.vehicleCount;
                
                // Update vehicle count display
                const countElement = document.querySelector(`.video-container:nth-child(${i + 1}) .vehicle-count`);
                if (countElement) {
                    countElement.textContent = `Vehicles: ${data.vehicleCount}`;
                }
            })
            .catch(error => console.error(`Error saving screenshot for lane ${i + 1}:`, error));
        }, 'image/png');
    }
}


// Improved timer functionality
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
            
            // Take screenshots of all lanes when 5 seconds remain
            if (timeLeft === 5) {
                takeAllScreenshots();
            }
            
            timeLeft--;
            timer = setTimeout(updateTimer, 1000);
        } else {
            // Calculate next duration based on updated vehicle counts
            fetch('/calculate_duration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ vehicleCounts: vehicleCounts })
            })
            .then(response => response.json())
            .then(data => {
                if (isRunning) {
                    pauseFeed(currentVideoIndex);
                    currentVideoIndex = (currentVideoIndex + 1) % videoCount;
                    startFeed(currentVideoIndex);
                    updateTrafficLights(currentVideoIndex + 1);
                    console.log(`Switching to lane ${currentVideoIndex + 1} with duration: ${data.duration}s`);
                    startTimer(data.duration);
                }
            })
            .catch(error => {
                console.error('Error calculating duration:', error);
                if (isRunning) {
                    startTimer(10); // Fallback to minimum duration
                }
            });
        }
    }

    updateTimer();
}
// Improved traffic light update function
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

// Improved current time update function
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

    // Update immediately and then every second
    updateTime();
    return setInterval(updateTime, 1000);
}

// Improved initialization function
function initializeSimulator() {
    isRunning = false;
    currentVideoIndex = 0;
    vehicleCounts = [0, 0, 0, 0];
    
    // Clear any existing intervals
    if (timer) clearTimeout(timer);
    feedIntervals.forEach(interval => {
        if (interval) clearInterval(interval);
    });
    feedIntervals = [];

    updateTrafficLights(1);
    document.getElementById('timer-display').textContent = '00:00';
}

// Improved event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Start the current time update
    updateCurrentTime();
    
    // Initialize the simulator
    initializeSimulator();

    // Set up control buttons
    const startButton = document.querySelector('.control-btn:nth-child(1)');
    const pauseButton = document.querySelector('.control-btn:nth-child(2)');
    const resetButton = document.querySelector('.control-btn:nth-child(3)');

    startButton.addEventListener('click', () => {
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
                    startTimer(15); // Fallback duration
                });
        }
    });

    pauseButton.addEventListener('click', () => {
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

    resetButton.addEventListener('click', () => {
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