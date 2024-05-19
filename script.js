const passwords = {
    1: '0519',  // number found in the image
    2: '',
    3: ''
};

function startGame() {
    const titleScreen = document.getElementById('title-screen');
    titleScreen.classList.add('hidden');
    playSound('start');

    setTimeout(() => {
        titleScreen.style.display = 'none';
        document.getElementById('game').style.display = 'flex';
        document.getElementById('room1').classList.add('active');
    }, 2000);
}

function checkPassword(roomNumber) {
    const userInput = document.getElementById(`password${roomNumber}`).value;
    const errorElement = document.getElementById(`error${roomNumber}`);

    if (userInput === passwords[roomNumber]) {
        errorElement.textContent = '';
        alert('The second part of the IP is 168');
        playSound('correct');
        document.getElementById(`room${roomNumber}`).classList.remove('active');
        if (roomNumber < 3) {
            document.getElementById(`room${roomNumber + 1}`).classList.add('active');
            if (roomNumber === 1) {
                startSnakeGame();
            }
        } else {
            document.getElementById('room4').classList.add('active');
        }
    } else {
        errorElement.textContent = 'Incorrect password. Try again.';
        playSound('incorrect');
    }
}

// Check if the crossword puzzle is correct
function checkCrossword() {
    const crosswordSolution = ['F', 'I', 'R', 'E', 'W', 'A', 'L', 'L'];
    const userSolution = crosswordSolution.map((_, i) => document.getElementById(`c${i + 1}`).value.toUpperCase());

    if (JSON.stringify(crosswordSolution) === JSON.stringify(userSolution)) {
        playSound('correct');
        alert('The last part of the IP is 254');
        document.getElementById('room3').classList.remove('active'); // Hide current room
        document.getElementById('room4').classList.add('active'); // Show next room
        document.getElementById('error3').textContent = ''; // Clear error message
    } else {
        playSound('incorrect');
        document.getElementById('error3').textContent = 'Incorrect solution. Try again.'; // Display error message
    }
}

function checkIPAddress() {
    const ipAddress = document.getElementById('ipAddress').value;
    const hackerIPAddress = '192.168.213.254'; // Panera IP (for fun)
    if (ipAddress === hackerIPAddress) {
        playSound('correct');
        document.getElementById('room4').style.display = 'none';
        document.getElementById('victory').classList.add('active');
    } else {
        playSound('incorrect');
        document.getElementById('error4').textContent = 'Incorrect IP address. Try again.';
    }
}

function playSound(type) {
    let audio;
    switch(type) {
        case 'start':
            audio = new Audio('sounds/start.mp3');
            break;
        case 'correct':
            audio = new Audio('sounds/correct.mp3');
            break;
        case 'incorrect':
            audio = new Audio('sounds/incorrect.mp3');
            break;
        case 'apple':
            audio = new Audio('sounds/apple.mp3');
    }
    if (audio) {
        audio.play();
    }
}

let snake;
let apple;
let snakeLength;
let appleCount;
let interval;

function startSnakeGame() {
    const canvas = document.getElementById('snakeGame');
    const ctx = canvas.getContext('2d');
    const box = 20;
    const canvasSize = 400;
    const canvasBoxes = canvasSize / box;

    snake = [{ x: 9 * box, y: 10 * box }];
    apple = { x: Math.floor(Math.random() * canvasBoxes) * box, y: Math.floor(Math.random() * canvasBoxes) * box };
    snakeLength = 1;
    appleCount = 0;

    document.addEventListener('keydown', changeDirection);
    interval = setInterval(draw, 100);

    function draw() {
        ctx.clearRect(0, 0, canvasSize, canvasSize);

        for (let i = 0; i < snake.length; i++) {
            ctx.fillStyle = (i === 0) ? 'green' : 'white';
            ctx.fillRect(snake[i].x, snake[i].y, box, box);
            ctx.strokeStyle = 'red';
            ctx.strokeRect(snake[i].x, snake[i].y, box, box);
        }

        ctx.fillStyle = 'red';
        ctx.fillRect(apple.x, apple.y, box, box);

        let snakeX = snake[0].x;
        let snakeY = snake[0].y;

        if (direction === 'LEFT') snakeX -= box;
        if (direction === 'UP') snakeY -= box;
        if (direction === 'RIGHT') snakeX += box;
        if (direction === 'DOWN') snakeY += box;

        if (snakeX === apple.x && snakeY === apple.y) {
            playSound('apple');
            appleCount++;
            document.getElementById('appleCount').textContent = `Apples Collected: ${appleCount}/7`;
            if (appleCount === 7) {
                clearInterval(interval);
                alert('The third part of the IP is 213');
                document.getElementById('room2').classList.remove('active');
                document.getElementById('room3').classList.add('active');
                playSound('correct'); // Play correct sound when Room 2 is cleared
            } else {
                apple = { x: Math.floor(Math.random() * canvasBoxes) * box, y: Math.floor(Math.random() * canvasBoxes) * box };
            }
        } else {
            snake.pop();
        }

        const newHead = { x: snakeX, y: snakeY };

        if (snakeX < 0 || snakeX >= canvasSize || snakeY < 0 || snakeY >= canvasSize || collision(newHead, snake)) {
            clearInterval(interval);
            document.getElementById('error2').textContent = 'Game Over. Refresh to try again.';
            playSound('incorrect');
            return;
        }

        snake.unshift(newHead);
    }

    function collision(head, array) {
        for (let i = 0; i < array.length; i++) {
            if (head.x === array[i].x && head.y === array[i].y) {
                return true;
            }
        }
        return false;
    }

    let direction;
    function changeDirection(event) {
        const key = event.keyCode;
        if (key === 37 && direction !== 'RIGHT') {
            direction = 'LEFT';
        } else if (key === 38 && direction !== 'DOWN') {
            direction = 'UP';
        } else if (key === 39 && direction !== 'LEFT') {
            direction = 'RIGHT';
        } else if (key === 40 && direction !== 'UP') {
            direction = 'DOWN';
        }
    }
}

// Audio Decibel Meter
async function startAudioMeter() {
    const constraints = { audio: true };
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const scriptProcessor = audioContext.createScriptProcessor(256, 1, 1);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);
        scriptProcessor.onaudioprocess = function () {
            const array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            const values = array.reduce((a, b) => a + b, 0);
            const average = values / array.length;
            const decibels = 20 * Math.log10(average / 255) + 90;

            document.getElementById('decibel-value').textContent = Math.round(decibels);

            if (decibels > 84) { // Adjust threshold as needed
                alert('Congratulations! Out of your anger, you discovered the first part of DarkByte\'s IP: 192');
            } else {
                document.getElementById('audio-message').style.display = 'none';
            }
        };
    } catch (err) {
        console.error('Error accessing audio stream:', err);
    }
}

window.onload = function() {
    startAudioMeter();
};