class PomodoroTimer {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentSession = 'work'; // 'work' or 'break'
        this.sessionCount = 1;
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.workTime = 25; // minutes
        this.breakTime = 5; // minutes
        this.interval = null;
        this.totalTime = 25 * 60; // Total time for current session
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.timeElement = document.getElementById('time');
        this.sessionTypeElement = document.getElementById('sessionType');
        this.sessionCountElement = document.getElementById('sessionCount');
        this.progressElement = document.getElementById('progress');
        this.startPauseBtn = document.getElementById('startPauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.workTimeInput = document.getElementById('workTime');
        this.breakTimeInput = document.getElementById('breakTime');
    }
    
    bindEvents() {
        this.startPauseBtn.addEventListener('click', () => this.toggleStartPause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        this.workTimeInput.addEventListener('change', () => this.updateWorkTime());
        this.breakTimeInput.addEventListener('change', () => this.updateBreakTime());
        
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
        
        // Reset to work session
        this.currentSession = 'work';
        this.sessionCount = 1;
        this.timeLeft = this.workTime * 60;
        this.totalTime = this.workTime * 60;
        
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
        
        // Switch to next session
        if (this.currentSession === 'work') {
            this.currentSession = 'break';
            this.timeLeft = this.breakTime * 60;
            this.totalTime = this.breakTime * 60;
        } else {
            this.currentSession = 'work';
            this.sessionCount++;
            this.timeLeft = this.workTime * 60;
            this.totalTime = this.workTime * 60;
        }
        
        this.updateDisplay();
        this.addPulseAnimation();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.timeElement.textContent = timeString;
        this.sessionTypeElement.textContent = this.currentSession === 'work' ? 'Work Session' : 'Break Time';
        this.sessionCountElement.textContent = this.sessionCount;
        
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
    
    updateWorkTime() {
        const newTime = parseInt(this.workTimeInput.value);
        if (newTime >= 1 && newTime <= 60) {
            this.workTime = newTime;
            if (this.currentSession === 'work' && !this.isRunning) {
                this.timeLeft = this.workTime * 60;
                this.totalTime = this.workTime * 60;
                this.updateDisplay();
            }
        }
    }
    
    updateBreakTime() {
        const newTime = parseInt(this.breakTimeInput.value);
        if (newTime >= 1 && newTime <= 30) {
            this.breakTime = newTime;
            if (this.currentSession === 'break' && !this.isRunning) {
                this.timeLeft = this.breakTime * 60;
                this.totalTime = this.breakTime * 60;
                this.updateDisplay();
            }
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
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});
