document.addEventListener("DOMContentLoaded", () => {
  // Получаем элементы DOM
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const scoreElement = document.getElementById("score");
  const livesElement = document.getElementById("lives");
  const gameMessage = document.getElementById("gameMessage");
  const startBtn = document.getElementById("startBtn");
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");
  const jumpBtn = document.getElementById("jumpBtn");

  // Размеры игрового поля
  let canvasWidth, canvasHeight;

  // Игровые переменные
  let score = 0;
  let lives = 3;
  let gameRunning = false;
  let gameOver = false;

  // Персонаж
  const player = {
    x: 50,
    y: 0,
    width: 32,
    height: 48,
    speed: 5,
    jumpForce: 12,
    velocityY: 0,
    isJumping: false,
    direction: 1, // 1 - вправо, -1 - влево
    frame: 0,
    frameCount: 0,
  };

  // Платформы
  const platforms = [
    { x: 0, y: 400, width: 200, height: 20 },
    { x: 250, y: 350, width: 150, height: 20 },
    { x: 100, y: 250, width: 150, height: 20 },
    { x: 300, y: 200, width: 200, height: 20 },
    { x: 0, y: 150, width: 100, height: 20 },
  ];

  // Монеты
  let coins = [];

  // Враги
  let enemies = [];

  // Клавиши управления
  const keys = {
    left: false,
    right: false,
    up: false,
  };

  // Настройка размеров canvas
  function resizeCanvas() {
    const container = document.querySelector(".game-canvas-container");
    canvasWidth = container.clientWidth;
    canvasHeight = container.clientHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Пересчитываем позиции платформ и других объектов
    scaleGameElements();
  }

  // Масштабирование игровых элементов
  function scaleGameElements() {
    // В реальной игре здесь нужно масштабировать все объекты
    // Для простоты оставим фиксированные размеры
  }

  // Инициализация игры
  function initGame() {
    score = 0;
    lives = 3;
    gameOver = false;
    gameRunning = true;

    player.x = 50;
    player.y = 0;
    player.velocityY = 0;
    player.isJumping = false;

    // Создаем монеты
    coins = [];
    for (let i = 0; i < 10; i++) {
      coins.push({
        x: Math.random() * (canvasWidth - 20),
        y: Math.random() * (canvasHeight - 100),
        width: 16,
        height: 16,
        collected: false,
      });
    }

    // Создаем врагов
    enemies = [
      { x: 200, y: 380, width: 32, height: 32, speed: 2, direction: 1 },
      { x: 350, y: 330, width: 32, height: 32, speed: 1.5, direction: -1 },
    ];

    updateScore();
    updateLives();
    gameMessage.textContent = "";

    // Запускаем игровой цикл
    if (!gameLoopId) {
      gameLoopId = requestAnimationFrame(gameLoop);
    }
  }

  // Обновление счета
  function updateScore() {
    scoreElement.textContent = score;
  }

  // Обновление жизней
  function updateLives() {
    livesElement.textContent = lives;
  }

  // Отрисовка игрока
  function drawPlayer() {
    ctx.fillStyle = "#3498db";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Глаза (простые пиксельные глаза)
    ctx.fillStyle = "#fff";
    ctx.fillRect(player.x + 10, player.y + 10, 5, 5);
    ctx.fillRect(player.x + 20, player.y + 10, 5, 5);

    // Рот
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(player.x + 10, player.y + 20, 12, 3);
  }

  // Отрисовка платформ
  function drawPlatforms() {
    ctx.fillStyle = "#2ecc71";
    platforms.forEach((platform) => {
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
  }

  // Отрисовка монет
  function drawCoins() {
    ctx.fillStyle = "#f1c40f";
    coins.forEach((coin) => {
      if (!coin.collected) {
        ctx.beginPath();
        ctx.arc(
          coin.x + coin.width / 2,
          coin.y + coin.height / 2,
          coin.width / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });
  }

  // Отрисовка врагов
  function drawEnemies() {
    ctx.fillStyle = "#e74c3c";
    enemies.forEach((enemy) => {
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
  }

  // Проверка столкновений с платформами
  function checkPlatformCollision() {
    let onGround = false;

    platforms.forEach((platform) => {
      // Проверка столкновения снизу
      if (
        player.x + player.width > platform.x &&
        player.x < platform.x + platform.width &&
        player.y + player.height >= platform.y &&
        player.y + player.height <= platform.y + platform.height / 2 &&
        player.velocityY > 0
      ) {
        player.y = platform.y - player.height;
        player.velocityY = 0;
        player.isJumping = false;
        onGround = true;
      }
    });

    return onGround;
  }

  // Проверка столкновений с монетами
  function checkCoinCollision() {
    coins.forEach((coin) => {
      if (
        !coin.collected &&
        player.x + player.width > coin.x &&
        player.x < coin.x + coin.width &&
        player.y + player.height > coin.y &&
        player.y < coin.y + coin.height
      ) {
        coin.collected = true;
        score += 10;
        updateScore();

        // Воспроизведение звука сбора монеты (если бы он был)
        // new Audio('coin.wav').play();
      }
    });
  }

  // Проверка столкновений с врагами
  function checkEnemyCollision() {
    enemies.forEach((enemy) => {
      if (
        player.x + player.width > enemy.x &&
        player.x < enemy.x + enemy.width &&
        player.y + player.height > enemy.y &&
        player.y < enemy.y + enemy.height
      ) {
        // Игрок получает урон
        lives--;
        updateLives();

        // Отбрасывание игрока
        player.velocityY = -10;
        player.x += player.direction * -20;

        if (lives <= 0) {
          gameOver = true;
          gameMessage.textContent = "Игра окончена!";
        } else {
          gameMessage.textContent = "Ой! Будь осторожнее!";
          setTimeout(() => {
            gameMessage.textContent = "";
          }, 1500);
        }
      }
    });
  }

  // Движение врагов
  function moveEnemies() {
    enemies.forEach((enemy) => {
      enemy.x += enemy.speed * enemy.direction;

      // Проверка столкновения с краями платформ
      let onPlatform = false;
      platforms.forEach((platform) => {
        if (
          enemy.x + enemy.width > platform.x &&
          enemy.x < platform.x + platform.width &&
          enemy.y + enemy.height >= platform.y &&
          enemy.y + enemy.height <= platform.y + platform.height
        ) {
          onPlatform = true;

          // Если враг достиг края платформы, меняем направление
          if (
            enemy.x <= platform.x ||
            enemy.x + enemy.width >= platform.x + platform.width
          ) {
            enemy.direction *= -1;
          }
        }
      });

      // Если враг не на платформе, падает
      if (!onPlatform) {
        enemy.y += 5;

        // Проверяем, не упал ли враг за пределы экрана
        if (enemy.y > canvasHeight) {
          // Возвращаем врага на случайную платформу
          const randomPlatform =
            platforms[Math.floor(Math.random() * platforms.length)];
          enemy.y = randomPlatform.y - enemy.height;
          enemy.x =
            randomPlatform.x +
            Math.random() * (randomPlatform.width - enemy.width);
        }
      }
    });
  }

  // Игровой цикл
  let gameLoopId;
  function gameLoop() {
    if (!gameRunning) return;

    // Очистка canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Обновление игрока
    if (keys.left) {
      player.x -= player.speed;
      player.direction = -1;
      player.frameCount++;
    }
    if (keys.right) {
      player.x += player.speed;
      player.direction = 1;
      player.frameCount++;
    }

    // Анимация (смена кадров)
    if (player.frameCount > 10) {
      player.frame = (player.frame + 1) % 4;
      player.frameCount = 0;
    }

    // Прыжок
    if (keys.up && !player.isJumping) {
      player.velocityY = -player.jumpForce;
      player.isJumping = true;
    }

    // Гравитация
    player.velocityY += 0.5;
    player.y += player.velocityY;

    // Проверка столкновений
    const onGround = checkPlatformCollision();
    checkCoinCollision();
    checkEnemyCollision();
    moveEnemies();

    // Границы экрана
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvasWidth)
      player.x = canvasWidth - player.width;

    if (player.y > canvasHeight) {
      // Игрок упал за пределы экрана
      lives--;
      updateLives();
      player.x = 50;
      player.y = 0;
      player.velocityY = 0;

      if (lives <= 0) {
        gameOver = true;
        gameMessage.textContent = "Игра окончена!";
      } else {
        gameMessage.textContent = "Ой! Упал!";
        setTimeout(() => {
          gameMessage.textContent = "";
        }, 1500);
      }
    }

    // Отрисовка
    drawPlatforms();
    drawCoins();
    drawEnemies();
    drawPlayer();

    // Проверка завершения игры
    if (gameOver) {
      gameRunning = false;
      cancelAnimationFrame(gameLoopId);
      gameLoopId = null;
      return;
    }

    // Продолжаем игровой цикл
    gameLoopId = requestAnimationFrame(gameLoop);
  }

  // Обработчики событий клавиатуры
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") keys.left = true;
    if (e.key === "ArrowRight" || e.key === "d") keys.right = true;
    if (e.key === "ArrowUp" || e.key === "w" || e.key === " ") keys.up = true;
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") keys.left = false;
    if (e.key === "ArrowRight" || e.key === "d") keys.right = false;
    if (e.key === "ArrowUp" || e.key === "w" || e.key === " ") keys.up = false;
  });

  // Обработчики для мобильных кнопок
  leftBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    keys.left = true;
  });

  leftBtn.addEventListener("touchend", (e) => {
    e.preventDefault();
    keys.left = false;
  });

  rightBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    keys.right = true;
  });

  rightBtn.addEventListener("touchend", (e) => {
    e.preventDefault();
    keys.right = false;
  });

  jumpBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    keys.up = true;
  });

  jumpBtn.addEventListener("touchend", (e) => {
    e.preventDefault();
    keys.up = false;
  });

  // Также добавляем обработчики для кликов (на случай, если touch не сработает)
  leftBtn.addEventListener("mousedown", () => {
    keys.left = true;
  });
  leftBtn.addEventListener("mouseup", () => {
    keys.left = false;
  });
  leftBtn.addEventListener("mouseleave", () => {
    keys.left = false;
  });

  rightBtn.addEventListener("mousedown", () => {
    keys.right = true;
  });
  rightBtn.addEventListener("mouseup", () => {
    keys.right = false;
  });
  rightBtn.addEventListener("mouseleave", () => {
    keys.right = false;
  });

  jumpBtn.addEventListener("mousedown", () => {
    keys.up = true;
  });
  jumpBtn.addEventListener("mouseup", () => {
    keys.up = false;
  });
  jumpBtn.addEventListener("mouseleave", () => {
    keys.up = false;
  });

  // Кнопка начала игры
  startBtn.addEventListener("click", initGame);

  // Обработчик изменения размера окна
  window.addEventListener("resize", resizeCanvas);

  // Инициализация
  resizeCanvas();

  // Загрузка шрифта (если нужно)
  const font = new FontFace(
    "Press Start 2P",
    "url(https://fonts.gstatic.com/s/pressstart2p/v14/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2)"
  );
  font
    .load()
    .then(() => {
      document.fonts.add(font);
    })
    .catch((err) => {
      console.log("Font loading error:", err);
    });
});
