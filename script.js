class PomodoroTimer {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentSession = 'work'; // 'work' or 'break'
        this.sessionCount = 1;
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.workTime = 25; // minutes
        this.breakTime = 5; // minutes
        this.selectedDuration = 25; // selected duration from dropdown
        this.interval = null;
        this.totalTime = 25 * 60; // Total time for current session
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.timeElement = document.getElementById('time');
        this.progressElement = document.getElementById('progress');
        this.startPauseBtn = document.getElementById('startPauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.timerDurationSelect = document.getElementById('timerDuration');
        this.progressBar = document.getElementById('progressBar');
    }
    
    bindEvents() {
        this.startPauseBtn.addEventListener('click', () => this.toggleStartPause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.timerDurationSelect.addEventListener('change', () => this.updateDuration());
        this.progressBar.addEventListener('click', (event) => this.advanceTimer(event));
        
        
        // Prevent timer from stopping when page loses focus
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isRunning) {
                // Timer continues running in background
            }
        });
    }
    
    toggleStartPause() {
        if (!this.isRunning) {
            this.start();
        } else {
            this.pause();
        }
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.updateStartPauseButton();
            
            this.interval = setInterval(() => {
                this.tick();
            }, 1000);
        }
    }
    
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.isPaused = true;
            this.updateStartPauseButton();
            
            clearInterval(this.interval);
        }
    }
    
    updateStartPauseButton() {
        if (this.isRunning) {
            this.startPauseBtn.textContent = 'Pause';
            this.startPauseBtn.className = 'btn btn-pause';
        } else {
            this.startPauseBtn.textContent = 'Start';
            this.startPauseBtn.className = 'btn btn-start';
        }
    }
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.updateStartPauseButton();
        
        clearInterval(this.interval);
        
        // Reset to work session with selected duration
        this.currentSession = 'work';
        this.sessionCount = 1;
        this.selectedDuration = parseInt(this.timerDurationSelect.value);
        this.timeLeft = this.selectedDuration * 60;
        this.totalTime = this.selectedDuration * 60;
        
        this.updateDisplay();
    }
    
    tick() {
        this.timeLeft--;
        this.updateDisplay();
        
        if (this.timeLeft <= 0) {
            this.sessionComplete();
        }
    }
    
    sessionComplete() {
        clearInterval(this.interval);
        this.isRunning = false;
        this.isPaused = false;
        this.updateStartPauseButton();
        
        // Show notification
        this.showNotification();
        
        // Play birds chirping sound
        this.playBirdsSound();
        
        // Switch to next session
        if (this.currentSession === 'work') {
            this.currentSession = 'break';
            this.timeLeft = this.breakTime * 60;
            this.totalTime = this.breakTime * 60;
        } else {
            this.currentSession = 'work';
            this.sessionCount++;
            this.timeLeft = this.selectedDuration * 60;
            this.totalTime = this.selectedDuration * 60;
        }
        
        this.updateDisplay();
        this.addPulseAnimation();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.timeElement.textContent = timeString;
        
        // Update page title with countdown when running
        if (this.isRunning) {
            document.title = `${timeString} - ChronoChris`;
        } else {
            document.title = 'ChronoChris';
        }
        
        // Update progress bar
        const progress = ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
        this.progressElement.style.width = `${progress}%`;
        
        // Change progress bar color based on session type
        if (this.currentSession === 'work') {
            this.progressElement.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
        } else {
            this.progressElement.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
        }
    }
    
    
    showNotification() {
        const message = this.currentSession === 'work' 
            ? 'Work session complete! Time for a break.' 
            : 'Break time over! Ready to work?';
        
        // Use browser notification if permission is granted
        if (Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', {
                body: message,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍅</text></svg>'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Pomodoro Timer', {
                        body: message,
                        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍅</text></svg>'
                    });
                }
            });
        }
        
        // Fallback: alert if notifications are not available
        if (Notification.permission === 'denied') {
            alert(message);
        }
    }
    
    addPulseAnimation() {
        this.timeElement.classList.add('changing');
        setTimeout(() => {
            this.timeElement.classList.remove('changing');
        }, 500);
    }
    
    updateDuration() {
        if (!this.isRunning) {
            this.selectedDuration = parseInt(this.timerDurationSelect.value);
            this.timeLeft = this.selectedDuration * 60;
            this.totalTime = this.selectedDuration * 60;
            this.updateDisplay();
        }
    }
    
    playBirdsSound() {
        try {
            // Simple approach: create a data URI for a birds chirping sound
            // This creates a short audio file that sounds like birds chirping
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create a simple birds chirping pattern
            this.playChirpSequence(audioContext);
        } catch (error) {
            console.log('Web Audio API failed, trying fallback:', error);
            // Fallback: simple beep pattern
            this.playFallbackSound();
        }
    }
    
    playFallbackSound() {
        // Simple fallback using HTML5 Audio with data URI
        const audio = new Audio();
        // Create a simple beep pattern that sounds like birds
        const beepPattern = [800, 1000, 900, 1200, 750];
        let currentBeep = 0;
        
        const playBeep = () => {
            if (currentBeep < beepPattern.length) {
                // Create a simple beep using Web Audio API
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(beepPattern[currentBeep], audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
                gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                
                currentBeep++;
                setTimeout(playBeep, 300);
            }
        };
        
        playBeep();
    }
    
    playChirpSequence(audioContext) {
        // Play 5 chirps with different frequencies and timing
        const chirpData = [
            { freq: 800, startTime: 0, duration: 0.2 },
            { freq: 1000, startTime: 0.3, duration: 0.15 },
            { freq: 900, startTime: 0.6, duration: 0.25 },
            { freq: 1200, startTime: 0.9, duration: 0.18 },
            { freq: 750, startTime: 1.2, duration: 0.22 }
        ];
        
        chirpData.forEach(chirp => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(chirp.freq, audioContext.currentTime + chirp.startTime);
            oscillator.type = 'sine';
            
            // Create chirp envelope
            gainNode.gain.setValueAtTime(0, audioContext.currentTime + chirp.startTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + chirp.startTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + chirp.startTime + chirp.duration);
            
            oscillator.start(audioContext.currentTime + chirp.startTime);
            oscillator.stop(audioContext.currentTime + chirp.startTime + chirp.duration);
        });
    }
    
    advanceTimer(event) {
        // Get the click position on the progress bar
        const rect = this.progressBar.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const barWidth = rect.width;
        const clickPercentage = clickX / barWidth;
        
        // Calculate how much time should have passed based on click position
        const timePassed = Math.floor(this.totalTime * clickPercentage);
        const newTimeLeft = this.totalTime - timePassed;
        
        // Update the timer
        this.timeLeft = Math.max(0, newTimeLeft);
        this.updateDisplay();
        
        // If we've reached the end, complete the session
        if (this.timeLeft <= 0) {
            this.sessionComplete();
        }
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});
