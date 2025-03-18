const mazeElement = document.getElementById("maze");
const levelElement = document.getElementById("level");
const timerElement = document.getElementById("timer");
const attemptsElement = document.getElementById("attempts");
const messageElement = document.getElementById("message");
const nextLevelButton = document.getElementById("nextLevel");
const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");

let currentLevel = 1;
let timer = 0;
let attempts = 0;
let timerInterval;
let ball;
let finish;

const levels = [
  {
    walls: [
      { top: 0, left: 0, width: 100, height: 10 },
      { top: 0, left: 0, width: 10, height: 100 },
      { top: 90, left: 0, width: 100, height: 10 },
      { top: 0, left: 90, width: 10, height: 100 },
      { top: 20, left: 0, width: 80, height: 10 },
      { top: 40, left: 20, width: 80, height: 10 },
      { top: 60, left: 0, width: 80, height: 10 },
      { top: 80, left: 20, width: 80, height: 10 },
    ],
    finish: { top: 85, left: 85 },
  },
  {
    walls: [
      { top: 0, left: 0, width: 100, height: 10 },
      { top: 0, left: 0, width: 10, height: 100 },
      { top: 90, left: 0, width: 100, height: 10 },
      { top: 0, left: 90, width: 10, height: 100 },
      { top: 20, left: 0, width: 60, height: 10 },
      { top: 40, left: 40, width: 60, height: 10 },
      { top: 60, left: 0, width: 60, height: 10 },
      { top: 80, left: 40, width: 60, height: 10 },
    ],
    finish: { top: 85, left: 85 },
  },
  // Добавьте больше уровней по желанию
];

function startGame() {
  clearInterval(timerInterval);
  timer = 0;
  attempts = 0;
  updateUI();
  loadLevel(currentLevel);
  startTimer();
}

function loadLevel(level) {
  mazeElement.innerHTML = "";
  const levelData = levels[level - 1];

  // Создаем стены
  levelData.walls.forEach((wall) => {
    const wallElement = document.createElement("div");
    wallElement.className = "wall";
    wallElement.style.top = `${wall.top}%`;
    wallElement.style.left = `${wall.left}%`;
    wallElement.style.width = `${wall.width}%`;
    wallElement.style.height = `${wall.height}%`;
    mazeElement.appendChild(wallElement);
  });

  // Создаем финиш
  finish = document.createElement("div");
  finish.className = "finish";
  finish.style.top = `${levelData.finish.top}%`;
  finish.style.left = `${levelData.finish.left}%`;
  mazeElement.appendChild(finish);

  // Создаем шарик
  ball = document.createElement("div");
  ball.className = "ball";
  mazeElement.appendChild(ball);

  // Сбрасываем позицию шарика
  ball.style.top = "5%";
  ball.style.left = "5%";
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer++;
    timerElement.textContent = timer;
  }, 1000);
}

function updateUI() {
  levelElement.textContent = currentLevel;
  attemptsElement.textContent = attempts;
}

function checkWin() {
  if (isColliding(ball, finish)) {
    clearInterval(timerInterval);
    messageElement.textContent = "Поздравляем! Вы прошли уровень!";
    nextLevelButton.disabled = false;
    winSound.play();
  }
}

function isColliding(element1, element2) {
  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();

  return !(
    rect1.top > rect2.bottom ||
    rect1.bottom < rect2.top ||
    rect1.left > rect2.right ||
    rect1.right < rect2.left
  );
}

document.addEventListener("touchmove", function (event) {
  event.preventDefault();
  const touch = event.touches[0];
  const rect = mazeElement.getBoundingClientRect();
  const newX = touch.clientX - rect.left - 10;
  const newY = touch.clientY - rect.top - 10;

  if (newX >= 0 && newX <= 260 && newY >= 0 && newY <= 260) {
    ball.style.left = `${newX}px`;
    ball.style.top = `${newY}px`;
    checkWin();
  }
});

nextLevelButton.addEventListener("click", () => {
  currentLevel++;
  nextLevelButton.disabled = true;
  messageElement.textContent = "Проведи шарик к финишу!";
  startGame();
});

// Запуск игры
startGame();
