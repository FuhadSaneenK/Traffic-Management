// traffic-simulator.js

let currentVideoIndex = 0;
const videoCount = 4; // Total number of videos
let timer;
let feedIntervals = [];

// Function to start or resume a feed
function startFeed(feedIndex) {
    const img = document.getElementById(`video${feedIndex + 1}`);
    feedIntervals[feedIndex] = setInterval(() => {
        img.src = `/video_feed${feedIndex + 1}?t=${new Date().getTime()}`;
    }, 1000); // Adjust this interval based on your feed update frequency
}

// Function to pause a feed
function pauseFeed(feedIndex) {
    clearInterval(feedIntervals[feedIndex]);
}

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
            timer = setTimeout(updateTimer, 1000);
        } else {
            timeLeft = 10; // Reset timer
            pauseFeed(currentVideoIndex);
            currentVideoIndex = (currentVideoIndex + 1) % videoCount; // Cycle through videos
            startFeed(currentVideoIndex);
            updateTrafficLights(currentVideoIndex + 1);
            updateTimer();
        }
    }
    
    updateTimer();
}

// Function to update traffic lights and video states
function updateTrafficLights(activeVideoIndex) {
    const containers = document.querySelectorAll('.video-container');
    containers.forEach((container, index) => {
        if (index + 1 === activeVideoIndex) {
            container.classList.add('active');
            container.classList.remove('red', 'yellow');
            container.classList.add('green');
            startFeed(index);
        } else {
            container.classList.remove('active', 'green', 'yellow');
            container.classList.add('red');
            pauseFeed(index);
        }
    });
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

// Initialize all functionalities
function initializeSimulator() {
    startTimer();
    updateCurrentTime();
    updateTrafficLights(1); // Start with the first video active
}

// Run initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeSimulator);

// Add event listeners for control buttons
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.querySelector('.control-btn:nth-child(1)');
    const pauseButton = document.querySelector('.control-btn:nth-child(2)');
    const resetButton = document.querySelector('.control-btn:nth-child(3)');

    startButton.addEventListener('click', () => {
        // Start the simulation logic
        startTimer();
        startFeed(currentVideoIndex);
    });

    pauseButton.addEventListener('click', () => {
        // Pause the simulation logic
        clearTimeout(timer);
        pauseFeed(currentVideoIndex);
    });

    resetButton.addEventListener('click', () => {
        // Reset the simulation logic
        clearTimeout(timer);
        feedIntervals.forEach((interval, index) => {
            clearInterval(interval);
        });
        currentVideoIndex = 0;
        updateTrafficLights(1);
        startTimer();
    });
});