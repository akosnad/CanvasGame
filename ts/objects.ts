class Sprite {
    xInitial = 0;
    yInitial = 0;
    x: number;
    y: number;
    hitboxWidth = 0;
    hitboxHeight = 0;
    image = document.createElement("img");
    imageReady = false;

    constructor(imageSource: string) {
        this.x = this.xInitial;
        this.y = this.yInitial;
        this.image.src = imageSource;
        var self = this;
        this.image.onload = (e) => {
            self.imageLoaded(e)
        };
    }
    imageLoaded(e: Event) {
        this.imageReady = true;
        this.hitboxHeight = this.image.height;
        this.hitboxWidth = this.image.width;
    }
    reset() {
        this.x = this.xInitial;
        this.y = this.yInitial;
    }
    draw(canvasRenderingContext: CanvasRenderingContext2D) {
        if (this.imageReady) {
            canvasRenderingContext.drawImage(
                this.image,
                this.x,
                canvasRenderingContext.canvas.height - this.y - this.hitboxHeight
            );
        }
    }
}

class LivingSprite extends Sprite {
    xVelocity = 0;
    yVelocity = 0;
    xVelocityMax = 250;
    xVelocityIncrease = 30;
    xVelocityDecrease = 15;
    gravity = 15;
    jumpStrenght = 500;
    reset() {
        this.x = this.xInitial;
        this.y = this.yInitial;
        this.xVelocity = 0;
        this.yVelocity = 0;
    }
}

class PlayerSprite extends LivingSprite {
    keysDown: boolean[] = new Array<boolean>();
    constructor(imageSource: string) {
        super(imageSource);
        var self = this;
        window.addEventListener('keydown', (e) => {
            self.keysDown[e.keyCode] = true;
        });
        window.addEventListener('keyup', (e) => {
            delete self.keysDown[e.keyCode];
        });
    }
    tick(delta: number) {
        // Limit velocity positive x
        if (this.xVelocity > this.xVelocityMax) { this.xVelocity = this.xVelocityMax; }
        // Limit velocity negative x
        if (this.xVelocity < -this.xVelocityMax) { this.xVelocity = -this.xVelocityMax; }

        // Only accept input if on ground
        if (this.y <= 0) {
            // Jump
            if (GameKeys.up in this.keysDown) { this.yVelocity += this.jumpStrenght; }
        }
        if (GameKeys.left in this.keysDown) {
            this.xVelocity -= this.xVelocityIncrease;
        }
        else if (GameKeys.right in this.keysDown) {
            this.xVelocity += this.xVelocityIncrease;
        }
        // Not pressing anything
        else {
            // If going positive x, decrease velocity gradually
            if (this.xVelocity >= 0) {
                this.xVelocity -= this.xVelocityDecrease;
            }
            // If going negative x, increase velocity gradually
            if (this.xVelocity < 0) {
                this.xVelocity += this.xVelocityDecrease;
            }
        }

        this.x += this.xVelocity * delta // Apply x velocity
        this.yVelocity -= this.gravity; // Apply gravity
        this.y += this.yVelocity * delta // Apply y velocity

        // If this hits left wall, stop
        if (this.x < 0) {
            this.x = 0;
            this.xVelocity = 0;
        }
        // If this hits ground, stop
        if (this.y < 0) {
            this.y = 0;
            this.yVelocity = 0;
        }
        // If this hits ceiling, stop
        if (this.y > ctx.canvas.height) {
            this.y = ctx.canvas.height;
            this.yVelocity = 0;
        }
    }
}

enum GameKeys {
    left = 37,
    right = 39,
    up = 38,
    down = 40
}