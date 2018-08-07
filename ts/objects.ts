namespace CanvasGame {
    export class Sprite {
        xInitial = 0;
        yInitial = 0;
        x: number;
        y: number;
        hitboxWidth = 0;
        hitboxHeight = 0;
        image = document.createElement("img");
        imageReady = false;

        constructor(imageSource: string, xInitial: number, yInitial: number) {
            this.xInitial = xInitial;
            this.yInitial = yInitial;
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
        tick(delta: number) { }
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

    export class LivingSprite extends Sprite {
        xVelocity = 0;
        yVelocity = 0;
        xVelocityMax = 255;
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

    export class Player extends LivingSprite {
        keysDown: boolean[] = new Array<boolean>();
        constructor(imageSource: string) {
            super(imageSource, 0, 0);
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
        }
    }

    enum GameKeys {
        left = 37,
        right = 39,
        up = 38,
        down = 40
    }

    export class Game {
        private gameSprites: Array<Sprite> = new Array<Sprite>();
        private player: Player;
        private lastUpdate: number;
        private canvas: any;
        private ctx: any;
        constructor(player: Player) {
            this.canvas = document.createElement("canvas");
            var self = this;
            $(() => {
                document.body.appendChild(self.canvas);
            });
            this.ctx = this.canvas.getContext("2d");
            self = this;
            window.addEventListener('resize', () => {
                self.resizeCanvas()
            }, false);
            this.resizeCanvas();

            this.player = player;
            this.reset();
            this.lastUpdate = Date.now();
        }
        resizeCanvas() {
            this.ctx = this.canvas.getContext("2d");
            this.ctx.canvas.width = window.innerWidth;
            this.ctx.canvas.height = window.innerHeight;
        }
        reset() {
            this.gameSprites.forEach(sprite => {
                sprite.reset();
            });
            this.player.reset();
        }
        gameLoop() {
            var now = Date.now();
            var delta = now - this.lastUpdate;
            delta = delta / 1000;

            this.gameSprites.forEach(sprite => {
                sprite.tick(delta);
            });
            this.player.tick(delta);

            // Clear canvas
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

            this.gameSprites.forEach(sprite => {
                sprite.draw(this.ctx);
            });
            this.player.draw(this.ctx);

            this.lastUpdate = now;
            window.requestAnimationFrame(() => { this.gameLoop(); });
        }

        addSprite(sprite: Sprite) {
            this.gameSprites.push(sprite);
        }
        addSprites(sprites: Array<Sprite>) {
            sprites.forEach(sprite => {
                this.addSprite(sprite);
            });
        }
    }
}