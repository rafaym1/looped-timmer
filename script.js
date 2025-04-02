let timeLeft;
let timerId = null;
let isPaused = false;
let currentRep = 0;
let totalReps = 0;
let duration = 0;
let isResting = false;
let restDuration = 0;
let restReps = 0;
let trialsLeft = 2;
let vibratingSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
vibratingSound.loop = true; // Make the sound loop continuously

const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const repsInput = document.getElementById('reps');
const durationInput = document.getElementById('duration');
const restRepsInput = document.getElementById('restReps');
const restDurationInput = document.getElementById('restDuration');
const currentRepDisplay = document.getElementById('currentRep');
const buzzerSoundSelect = document.getElementById('buzzerSound');
const clapping = document.getElementById('clapping');
const partyContainer = document.getElementById('party-container');
const statusDisplay = document.getElementById('status');
const trialsLeftDisplay = document.getElementById('trials-left');
const paymentModal = document.getElementById('payment-modal');
const purchaseLink = document.getElementById('purchaseLink');

// Create an object to store all buzzer sounds
const buzzerSounds = {
    buzzer1: document.getElementById('buzzer1'),
    buzzer2: document.getElementById('buzzer2'),
    buzzer3: document.getElementById('buzzer3'),
    buzzer4: document.getElementById('buzzer4')
};

// Cookie functions
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Check if user has trials left
function checkTrials() {
    const savedTrials = getCookie('trialsLeft');
    if (savedTrials !== null) {
        trialsLeft = parseInt(savedTrials);
    }
    
    if (trialsLeft <= 0) {
        paymentModal.style.display = 'flex';
        return false;
    }
    return true;
}

// Update trials display and save to cookie
function updateTrialsDisplay() {
    trialsLeftDisplay.textContent = trialsLeft;
    setCookie('trialsLeft', trialsLeft, 30); // Cookie expires in 30 days
}

function createConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        partyContainer.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    currentRepDisplay.textContent = `Rep: ${currentRep}/${totalReps}`;
    statusDisplay.textContent = isResting ? 'Rest Period' : 'Working';
}

function playBuzzer() {
    const selectedBuzzer = buzzerSoundSelect.value;
    buzzerSounds[selectedBuzzer].currentTime = 0;
    buzzerSounds[selectedBuzzer].play();
}

function playClapping() {
    clapping.currentTime = 0;
    clapping.play();
    setTimeout(() => {
        clapping.currentTime = 0;
        clapping.play();
    }, 1000);
    setTimeout(() => {
        clapping.currentTime = 0;
        clapping.play();
    }, 2000);
}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
}

function startTimer() {
    if (timerId === null) {
        if (!checkTrials()) return;

        totalReps = parseInt(repsInput.value);
        duration = parseInt(durationInput.value);
        restReps = parseInt(restRepsInput.value);
        restDuration = parseInt(restDurationInput.value);

        if (totalReps < 1 || duration < 1 || restReps < 1 || restDuration < 1) {
            alert('Please enter valid numbers for all fields');
            return;
        }

        currentRep = 1;
        timeLeft = duration;
        isResting = false;
        updateDisplay();
        
        timerId = setInterval(() => {
            if (!isPaused) {
                timeLeft--;
                updateDisplay();
                
                if (timeLeft === 0) {
                    if (isResting) {
                        // Rest period ended
                        vibratingSound.pause(); // Stop the vibrating sound
                        vibratingSound.currentTime = 0;
                        speak("Rest ended");
                        playBuzzer();
                        currentRep++;
                        timeLeft = duration;
                        isResting = false;
                        updateDisplay();
                    } else if (currentRep === totalReps) {
                        // Last rep completed
                        playBuzzer();
                        setTimeout(() => {
                            clearInterval(timerId);
                            timerId = null;
                            currentRep = 0;
                            timeLeft = duration;
                            isResting = false;
                            updateDisplay();
                            createConfetti();
                            playClapping();
                            trialsLeft--;
                            updateTrialsDisplay();
                            setTimeout(() => {
                                alert('Workout completed!');
                            }, 3000);
                        }, 1000);
                    } else {
                        // Check if it's time for rest
                        if (currentRep % restReps === 0) {
                            // Time for rest period
                            speak("Rest starts");
                            vibratingSound.play(); // Start the vibrating sound
                            playBuzzer();
                            isResting = true;
                            timeLeft = restDuration;
                            updateDisplay();
                        } else {
                            // Regular rep completed
                            playBuzzer();
                            currentRep++;
                            timeLeft = duration;
                            isResting = false;
                            updateDisplay();
                        }
                    }
                }
            }
        }, 1000);
    }
}

function pauseTimer() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
}

function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    isPaused = false;
    currentRep = 0;
    timeLeft = duration;
    isResting = false;
    vibratingSound.pause(); // Stop the vibrating sound when resetting
    vibratingSound.currentTime = 0;
    updateDisplay();
    pauseBtn.textContent = 'Pause';
    partyContainer.innerHTML = '';
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Initialize display and check trials
updateDisplay();
checkTrials();
updateTrialsDisplay(); 