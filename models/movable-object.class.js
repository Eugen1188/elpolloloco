class MovableObject extends DrawableObjects {
    speed = 5;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    lastHit = 0;
    energy = 100;
    energyEnemies = 1;

    jump_sound = new Audio('audio/jump.mp3');

    applyGravity() {
        // Gravity wird vom World-Loop aufgerufen.
    }

    updateGravity() {
        if (this.isAboveGround() || this.speedY > 0) {
            this.y -= this.speedY;
            this.speedY -= this.acceleration;
        } else if (!this.isAboveGround()) {
            this.speedY = 0;
        }
    }

    isAboveGround() {
        if (this instanceof ThrowableObjects) {
            return true;
        }

        return this.y < 180;
    }

    isColliding(mo) {
        return (
            this.x + this.width - this.offset.right > mo.x + mo.offset.left &&
            this.y + this.height - this.offset.bottom > mo.y + mo.offset.top &&
            this.x + this.offset.left < mo.x + mo.width - mo.offset.right &&
            this.y + this.offset.top < mo.y + mo.height - mo.offset.bottom
        );
    }

    hit(damage) {
        this.energy -= damage;

        if (this.energy < 0) {
            this.energy = 0;
        } else {
            this.lastHit = new Date().getTime();
        }
    }

    isHurt() {
        let timepassed = new Date().getTime() - this.lastHit;
        timepassed = timepassed / 1000;

        return timepassed < 0.7;
    }

    isDead() {
        return this.energy == 0;
    }

    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    moveRight() {
        this.x += this.speed;
    }

    moveLeft() {
        this.x -= this.speed;
    }

    jump() {
        this.speedY = 25;

        if (!this.isMobileDevice()) {
            this.jump_sound.currentTime = 0;
            this.jump_sound.play().catch(() => {});
        }
    }

    isMobileDevice() {
        return window.innerWidth <= 900 || window.innerHeight <= 520;
    }
}