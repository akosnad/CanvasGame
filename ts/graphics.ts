namespace CanvasGame {
    export class Sprite {
        xInitial = 0;
        yInitial = 0;
        x: number;
        y: number;
        hitboxWidth = 0;
        hitboxHeight = 0;
        solid = true;
        image = document.createElement("img");
        imageSource: string;
        imageReady = false;

        constructor(imageSource: string, xInitial: number, yInitial: number) {
            this.imageSource = imageSource;
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
            if (this.hitboxHeight == 0) { this.hitboxHeight = this.image.height; }
            if (this.hitboxWidth == 0) { this.hitboxWidth = this.image.width; }
        }
        reset() {
            this.x = this.xInitial;
            this.y = this.yInitial;
        }
        tick(timeDelta: number, otherSprites: Array<Sprite>) { }
        draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
            if (this.imageReady) {
                ctx.drawImage(
                    this.image,
                    this.x - offsetX,
                    ctx.canvas.height - this.y - this.hitboxHeight + offsetY
                );
            }
        }
    }

    export class LivingSprite extends Sprite {
        movingDirections: MovingDirections[] = new Array<MovingDirections>();
        xVelocity = 0;
        yVelocity = 0;
        xVelocityMax = 255;
        xVelocityIncrease = 30;
        xVelocityDecrease = 15;
        gravity = 15;
        jumpStrenght = 500;
        solid = false;
        isStanding = false;
        tick(timeDelta: number, otherSprites: Array<Sprite>) {
            this.handleMovement();

            this.handleVelocity(timeDelta);

            this.handleCollisions(otherSprites);
        }
        private handleVelocity(timeDelta: number) {
            if (this.xVelocity > this.xVelocityMax) {
                this.xVelocity = this.xVelocityMax;
            }
            if (this.xVelocity < -this.xVelocityMax) {
                this.xVelocity = -this.xVelocityMax;
            }
            this.x += this.xVelocity * timeDelta;
            if (!this.isStanding) {
                this.yVelocity -= this.gravity + timeDelta;
            }
            this.y += this.yVelocity * timeDelta;
        }

        private handleMovement() {
            if (this.y <= 0) {
                this.isStanding = true;
            }
            if (this.isStanding) {
                if (MovingDirections.up in this.movingDirections) {
                    this.yVelocity += this.jumpStrenght;
                }
            }
            if (MovingDirections.left in this.movingDirections) {
                this.xVelocity -= this.xVelocityIncrease;
            }
            else if (MovingDirections.right in this.movingDirections) {
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
        }

        private handleCollisions(otherSprites: Sprite[]) {
            let solidSprites = Array<Sprite>();
            for (let sprite of otherSprites) {
                if (sprite.solid) {
                    solidSprites.push(sprite);
                }
            }
            this.isStanding = false;
            for (let sprite of solidSprites) {
                if (this.collides(sprite)) {
                    if (this.collisionFromTop(sprite)) {
                        this.y = sprite.y + sprite.hitboxHeight;
                        this.yVelocity = 0;
                        this.isStanding = true;
                    }
                    else if (this.collisionFromLeft(sprite)) {
                        this.x = sprite.x - this.hitboxWidth;
                        this.xVelocity = 0;
                    }
                    else if (this.collisionFromRight(sprite)) {
                        this.x = sprite.x + sprite.hitboxWidth;
                        this.xVelocity = 0;
                    }
                    else if (this.collisionFromBottom(sprite)) {
                        this.y = sprite.y - this.hitboxHeight;
                        this.yVelocity = 0;
                    }
                }
            }

            if (this.x < 0) {
                this.x = 0;
                this.xVelocity = 0;
            }
            if (this.y < 0) {
                this.y = 0;
                this.yVelocity = 0;
            }

        }

        private collisionFromBottom(sprite: Sprite) {
            return this.yVelocity > 0 && this.y + this.hitboxHeight <= sprite.y + 10;
        }

        private collisionFromTop(sprite: Sprite) {
            return this.yVelocity < 0 && this.y >= sprite.y + sprite.hitboxHeight - 10;
        }

        private collisionFromRight(sprite: Sprite) {
            return this.xVelocity < 0 && this.x >= sprite.x + sprite.hitboxWidth - 10;
        }

        private collisionFromLeft(sprite: Sprite) {
            return this.xVelocity > 0 && this.x + this.hitboxWidth <= sprite.x + 10;
        }

        private collides(sprite: Sprite) {
            return sprite.x < this.x + this.hitboxWidth &&
                sprite.x + sprite.hitboxWidth > this.x &&
                sprite.y < this.y + this.hitboxHeight &&
                sprite.hitboxHeight + sprite.y > this.y;
        }

        reset() {
            this.x = this.xInitial;
            this.y = this.yInitial;
            this.xVelocity = 0;
            this.yVelocity = 0;
        }
    }

    export class Player extends LivingSprite {
        constructor(imageSource: string, xInitial: number, yInitial: number) {
            super(imageSource, xInitial, yInitial);
            var self = this;
            window.addEventListener('keydown', (e) => {
                self.movingDirections[e.keyCode] = 1;
            });
            window.addEventListener('keyup', (e) => {
                delete self.movingDirections[e.keyCode];
            });
        }
    }

    export class OtherPlayer extends Sprite {
        playerId: number;
        levelId: number;
        lastUpdateTimestamp: number;
        solid = false;
        isPaused = false;
        constructor(imageSource: string, playerData: MultiPlayerData) {
            super(imageSource, 0, 0);
            this.playerId = playerData.playerId;
            this.levelId = playerData.levelId;
            this.lastUpdateTimestamp = playerData.lastUpdateTimestamp;
        }
        draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
            if (this.imageReady) {
                if (this.isPaused) {
                    ctx.globalAlpha = 0.4;
                }
                ctx.drawImage(
                    this.image,
                    this.x - offsetX,
                    ctx.canvas.height - this.y - this.hitboxHeight + offsetY
                );
                ctx.globalAlpha = 1;
            }
        }
    }

    export class Background {
        image = document.createElement("img");
        imageReady = false;
        constructor(imageSource: string) {
            if (imageSource != "") {
                this.image.src = imageSource;
                var self = this;
                this.image.onload = (e) => {
                    self.imageReady = true;
                };
            }
        }
        draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
            if (this.imageReady) {
                offsetX = offsetX % this.image.width;
                let times = Math.ceil(ctx.canvas.width / this.image.width);
                for (let i = 0; i < times + 1; i++) {
                    ctx.drawImage(this.image,
                        (i * this.image.width) - offsetX,
                        ctx.canvas.height - this.image.height + offsetY
                    );
                }
            }
        }
    }

}