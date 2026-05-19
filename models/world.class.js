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
        this.ctx.imageSmoothingEnabled = false;
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.setWorld();
        this.startGameLoop();
        this.checkForGameOver();
    }

    startGameLoop() {
        let lastTime = performance.now();
        let accumulator = 0;
        let frameCounter = 0;
        const fixedStep = 1000 / 60;

        const loop = (timestamp) => {
            let deltaTime = timestamp - lastTime;
            lastTime = timestamp;

            if (deltaTime > 100) {
                deltaTime = 100;
            }

            accumulator += deltaTime;

            let updates = 0;

            while (accumulator >= fixedStep && updates < 3) {
                frameCounter++;
                this.updateGame(frameCounter);
                accumulator -= fixedStep;
                updates++;
            }

            if (updates === 3) {
                accumulator = 0;
            }

            this.draw();
            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

    updateGame(frameCounter) {
        const isMobile = window.innerWidth <= 720 || window.innerHeight <= 480;

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

        this.level.clouds.forEach((cloud) => {
            if (cloud.updateAnimation) {
                cloud.updateAnimation();
            }
        });

        if (frameCounter % 2 === 0) {
            this.character.animations();
        }

        if (frameCounter % 30 === 0) {
            this.character.increaseIdleTimer();
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

        const collisionFrequency = isMobile ? 3 : 1;

        if (frameCounter % collisionFrequency === 0) {
            this.checkPeppeHitsEnemy();
            this.checkCollisionsCoins();
            this.checkCollisionBottles();
            this.checkBossFight();
            this.checkThrowObjects();
        }

        const enemyHitFrequency = isMobile ? 12 : 8;

        if (frameCounter % enemyHitFrequency === 0) {
            this.checkEnemyHitsPeppe();
        }
    }

    setWorld() {
        this.character.world = this;
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

    checkBossFight() {
        if (this.character.x > 2000) {
            this.endboss.firstContact = true;
        }
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

        this.throwableObject = this.throwableObject.filter((bottle) => bottle.y <= 500);

        this.throwableObject.forEach((bottle) => {
            this.level.enemies.forEach((enemy) => {
                if (
                    this.throwableObject.includes(bottle) &&
                    this.bottleCollidingWithEnemy(bottle, enemy)
                ) {
                    this.hitEnemyWithBottle(enemy, bottle);
                }
            });
        });

        this.statusBarBottle.setPercentageBottle(this.character.bottles);
    }

    bottleCollidingWithEnemy(bottle, enemy) {
        return bottle.isColliding(enemy) && !enemy.isDead();
    }

    hitEnemyWithBottle(enemy, bottle) {
        enemy.hit(1);
        this.throwableObject = this.throwableObject.filter(
            (currentBottle) => currentBottle !== bottle
        );
        this.bottle_break_sound.play();
    }

    throwBottle() {
        let bottle = new ThrowableObjects(
            this.character.x + 40,
            this.character.y + 100
        );

        this.throwableObject.push(bottle);
        this.character.bottles--;
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

                if (!this.maxCoins()) {
                    this.statusBarCoin.setPercentageCoin(this.character.coins);
                }
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

    addObjectsToMap(objects) {
        objects.forEach((object) => {
            this.addTopMap(object);
        });
    }

    addTopMap(movableObject) {
        if (movableObject.otherDirection) {
            this.flipImage(movableObject);
        }

        movableObject.draw(this.ctx);

        if (movableObject.otherDirection) {
            this.flipImageBack(movableObject);
        }
    }

    flipImage(movableObject) {
        this.ctx.save();
        this.ctx.translate(movableObject.width, 0);
        this.ctx.scale(-1, 1);
        movableObject.x = movableObject.x * -1;
    }

    flipImageBack(movableObject) {
        movableObject.x = movableObject.x * -1;
        this.ctx.restore();
    }

    clearAllIntervals() {
        for (let i = 1; i < 9999; i++) {
            window.clearInterval(i);
        }
    }
}