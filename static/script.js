// traffic-simulator.js

let currentVideoIndex = 0;
const videoCount = 4; // Total number of videos
let timer;

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
            timeLeft = 10; // Reset timer
            currentVideoIndex = (currentVideoIndex + 1) % videoCount; // Cycle through videos
            playCurrentVideo();
            updateTimer();
        }
    }
    
    updateTimer();
}

// Function to play the current video
function playCurrentVideo() {
    // Hide all videos
    for (let i = 1; i <= videoCount; i++) {
        document.getElementById(`video${i}`).style.display = 'none';
    }
    
    // Show the current video
    document.getElementById(`video${currentVideoIndex + 1}`).style.display = 'block';
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
    playCurrentVideo(); // Start with the first video
}

// Run initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeSimulator);
