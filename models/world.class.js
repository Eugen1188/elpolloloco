class World {
  character = new Character();
  level = level1;
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  statusBarHealth = new StatusBarHealth();
  statusBarBottle = new StatusBarBottle();
  statusBarCoin = new StatusBarCoin();
  startScreen = new Startscreen();
  throwableObject = [];
  coin_sound = new Audio("audio/coin.mp3");
  bottle_sound = new Audio("audio/bottle.mp3");
  bottle_break_sound = new Audio("audio/bottle_break.mp3");
  endboss = this.level.enemies[this.level.enemies.length - 1];
  canThrow = true;

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.setWorld();
    this.startGameLoop();
    this.checkForGameOver();
  }

startGameLoop() {
    let lastTime = 0;
    let frameCounter = 0;

    const loop = (timestamp) => {
        const isMobile = window.innerWidth <= 720 || window.innerHeight <= 480;
        const targetFPS = isMobile ? 30 : 60;
        const frameInterval = 1000 / targetFPS;

        if (timestamp - lastTime >= frameInterval) {
            lastTime = timestamp;
            frameCounter++;

            this.updateGame(frameCounter);
            this.draw();
        }

        requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
}

  updateGame(frameCounter) {
    const isMobile = window.innerWidth <= 720;

    this.character.updateGravity();
    this.character.movement();

    this.level.enemies.forEach((enemy) => {
      if (enemy.updateGravity) {
        enemy.updateGravity();
      }
    });

    this.throwableObject.forEach((bottle) => {
      if (bottle.updateGravity) {
        bottle.updateGravity();
      }
    });

    if (frameCounter % 2 === 0) {
      this.character.animations();
    }

    if (frameCounter % 12 === 0) {
      this.character.idle();

      this.level.enemies.forEach((enemy) => {
        if (enemy.updateAnimation) {
          enemy.updateAnimation();
        }
      });
    }

    if (frameCounter % 3 === 0) {
      this.throwableObject.forEach((bottle) => {
        if (bottle.updateThrowable) {
          bottle.updateThrowable();
        }
      });
    }

    const checkFrequency = isMobile ? 3 : 1;

    if (frameCounter % checkFrequency === 0) {
      this.checkPeppeHitsEnemy();
      this.checkCollisionsCoins();
      this.checkCollisionBottles();
      this.checkBossFight();
      this.checkThrowObjects();
    }

    const enemyHitFrequency = isMobile ? 20 : 12;

    if (frameCounter % enemyHitFrequency === 0) {
      this.checkEnemyHitsPeppe();
    }
  }

  checkForGameOver() {
    let checkGameOverId = setInterval(() => {
      if (this.character.isDead()) {
        clearInterval(checkGameOverId);
        setTimeout(() => {
          this.showYouLostScreen();
          this.clearAllIntervals();
          this.refreshPageWithTimer();
          gameMusic.pause();
        }, 1500);
      } else if (this.endboss.isDead()) {
        clearInterval(checkGameOverId);
        setTimeout(() => {
          this.showGameOverScreen();
          this.clearAllIntervals();
          this.refreshPageWithTimer();
          gameMusic.pause();
        }, 1500);
      }
    }, 1000);
  }

  refreshPageWithTimer() {
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }

  showYouLostScreen() {
    let lost = document.getElementById("gameOverScreenLost");
    lost.style.display = "flex";
    lost.style.zIndex = "999";
  }

  showGameOverScreen() {
    let win = document.getElementById("gameOverScreenWin");
    win.style.display = "flex";
    win.style.zIndex = "999";
  }

  checkPlayMusic() {
    if (this.playMusic) {
      this.gameMusic.play();
    }
  }

  setWorld() {
    this.character.world = this;
  }

  checkBossFight() {
    if (this.character.x > 2000) {
      this.endboss.firstContact = true;
    }
  }

  run() {
    let frameCounter = 0;
    let animationCounter = 0;
    let idleTimerCounter = 0;
    let idleAnimationCounter = 0;
    let enemyAnimationCounter = 0;
    let throwableAnimationCounter = 0;
    let isMobile = window.innerWidth <= 720;

    const gameLoop = () => {
      frameCounter++;
      animationCounter++;
      idleTimerCounter++;
      idleAnimationCounter++;
      enemyAnimationCounter++;
      throwableAnimationCounter++;

      // Apply gravity to all objects (every frame at 60fps)
      this.character.updateGravity();
      this.level.enemies.forEach((enemy) => {
        if (enemy.updateGravity) {
          enemy.updateGravity();
        }
      });
      this.throwableObject.forEach((to) => {
        if (to.updateGravity) {
          to.updateGravity();
        }
      });

      // Character movement (60fps equivalent)
      this.character.movement();

      // Character animation (every 40ms ~ 25fps)
      if (animationCounter % 2 === 0) {
        this.character.animations();
      }

      // Idle timer (every 500ms)
      if (idleTimerCounter % 30 === 0) {
        this.character.increaseIdleTimer();
      }

      // Idle animation (every 200ms)
      if (idleAnimationCounter % 12 === 0) {
        this.character.idle();
      }

      // Enemy animations (every 200ms)
      if (enemyAnimationCounter % 12 === 0) {
        this.level.enemies.forEach((enemy) => {
          if (enemy.updateAnimation) {
            enemy.updateAnimation();
          }
        });
      }

      // Throwable object animation (every 50ms ~ 20fps)
      if (throwableAnimationCounter % 3 === 0) {
        this.throwableObject.forEach((to) => {
          if (to.updateThrowable) {
            to.updateThrowable();
          }
        });
      }

      // Cloud movement (every frame)
      this.level.clouds.forEach((cloud) => {
        if (cloud.updateAnimation) {
          cloud.updateAnimation();
        }
      });

      // Main game logic every 60fps
      this.checkPeppeHitsEnemy();
      this.checkCollisionsCoins();
      this.checkCollisionBottles();
      this.checkPlayMusic();
      this.checkBossFight();

      // On mobile: reduce collision checks for performance
      let checkFrequency = isMobile ? 20 : 12;
      if (frameCounter % checkFrequency === 0) {
        this.checkEnemyHitsPeppe();
      }

      this.checkThrowObjects();

      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);
  }

  checkEnemyHitsPeppe() {
    this.level.enemies.forEach((enemy) => {
      if (this.hitboxColliding(enemy)) {
        this.PeppeGetHit();
      }
    });
  }

  PeppeGetHit() {
    this.character.hit(20);
    this.character.idleTimer = 0;
    this.statusBarHealth.setPercentageHealth(this.character.energy);
  }

  hitboxColliding(enemy) {
    return (
      this.character.isColliding(enemy) &&
      !enemy.isDead() &&
      this.character.speedY >= 0
    );
  }

  checkThrowObjects() {
    if (this.keyboard.D && this.character.bottles > 0 && this.canThrow) {
      this.throwBottle();
      this.character.idleTimer = 0;
      this.canThrow = false;

      setTimeout(() => {
        this.canThrow = true;
      }, 500);
    }

    this.throwableObject = this.throwableObject.filter(
      (bottle) => bottle.y <= 500,
    );

    this.throwableObject.forEach((bottle) => {
      this.level.enemies.forEach((enemy) => {
        if (this.bottleCollidingWithEnemy(bottle, enemy)) {
          this.hitEnemyWithBottle(enemy, bottle);
        }
      });
    });

    this.statusBarBottle.setPercentageBottle(this.character.bottles);
  }

  bottleCollidingWithEnemy(to, enemy) {
    return to.isColliding(enemy) && !enemy.isDead();
  }

  hitEnemyWithBottle(enemy, bottle) {
    enemy.hit(1);
    this.throwableObject = this.throwableObject.filter(
      (currentBottle) => currentBottle !== bottle,
    );
    this.bottle_break_sound.play();
  }

  throwBottle() {
    let bottle = new ThrowableObjects(
      this.character.x + 40,
      this.character.y + 100,
    );
    this.throwableObject.push(bottle);
    this.character.bottles--;
  }

  clearAllIntervals() {
    for (let i = 1; i < 9999; i++) window.clearInterval(i);
  }

  checkPeppeHitsEnemy() {
    this.level.enemies.forEach((enemy) => {
      if (this.jumpOnEnemy(enemy)) {
        this.character.jump();
        enemy.energy--;
      }
    });
  }

  jumpOnEnemy(enemy) {
    return (
      this.character.isColliding(enemy) &&
      !enemy.isDead() &&
      this.character.speedY < 0 &&
      enemy instanceof Chicken
    );
  }

  checkCollisionsCoins() {
    this.level.coins.forEach((coin) => {
      if (this.character.isColliding(coin)) {
        this.collectCoin(coin);
        if (!this.maxCoins())
          this.statusBarCoin.setPercentageCoin(this.character.coins);
      }
    });
  }

  maxCoins() {
    return this.character.coins > 100;
  }

  collectCoin(coin) {
    this.coin_sound.play();
    let coinNum = this.level.coins.indexOf(coin);
    this.level.coins.splice(coinNum, 1);
    this.character.coins += 20;
  }

  checkCollisionBottles() {
    this.level.bottles.forEach((bottle) => {
      if (this.character.isColliding(bottle)) {
        this.collectBottle(bottle);
      }
    });
  }

  collectBottle(bottle) {
    this.bottle_sound.play();
    let bottleNum = this.level.bottles.indexOf(bottle);
    this.level.bottles.splice(bottleNum, 1);
    if (this.freeBottleSpace()) {
      this.character.bottles++;
      this.updateStatusBarBottle();
    }
  }

  freeBottleSpace() {
    return this.character.bottles < 6;
  }

  updateStatusBarBottle() {
    this.statusBarBottle.setPercentageBottle(this.character.bottles);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.level.backgroundObjects);
    this.addObjectsToMap(this.level.clouds);
    this.addObjectsToMap(this.throwableObject);
    this.addObjectsToMap(this.level.coins);
    this.addObjectsToMap(this.level.bottles);
    this.addObjectsToMap(this.level.enemies);
    this.ctx.translate(-this.camera_x, 0);

    this.addTopMap(this.statusBarHealth);
    this.addTopMap(this.statusBarBottle);
    this.addTopMap(this.statusBarCoin);

    this.ctx.translate(this.camera_x, 0);
    this.addTopMap(this.character);
    this.ctx.translate(-this.camera_x, 0);
  }

  startRenderLoop() {
    const gameRender = () => {
      this.draw();
      requestAnimationFrame(gameRender);
    };
    requestAnimationFrame(gameRender);
  }

  addObjectsToMap(objects) {
    objects.forEach((o) => {
      this.addTopMap(o);
    });
  }

  addTopMap(mo) {
    if (mo.otherDirection) {
      this.flipImage(mo);
    }

    mo.draw(this.ctx);
    //    mo.drawFrame(this.ctx);

    if (mo.otherDirection) {
      this.flipImageBack(mo);
    }
  }

  flipImage(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  }

  flipImageBack(mo) {
    mo.x = mo.x * -1;
    this.ctx.restore();
  }
}
