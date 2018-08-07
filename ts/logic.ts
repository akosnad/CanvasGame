/// <reference path="multi.ts" />

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
        movingDirections: MovingDirections[] = new Array<MovingDirections>();
        xVelocity = 0;
        yVelocity = 0;
        xVelocityMax = 255;
        xVelocityIncrease = 30;
        xVelocityDecrease = 15;
        gravity = 15;
        jumpStrenght = 500;
        tick(delta: number) {
            // Limit velocity positive x
            if (this.xVelocity > this.xVelocityMax) { this.xVelocity = this.xVelocityMax; }
            // Limit velocity negative x
            if (this.xVelocity < -this.xVelocityMax) { this.xVelocity = -this.xVelocityMax; }

            // Only accept input if on ground
            if (this.y <= 0) {
                // Jump
                if (MovingDirections.up in this.movingDirections) { this.yVelocity += this.jumpStrenght; }
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
        id: number;
        constructor(imageSource: string, playerData: MultiPlayerData) {
            super(imageSource, 0, 0);
            this.id = playerData.id;
        }
    }

    export var otherPlayers = new Array<OtherPlayer>();

    export enum MovingDirections {
        left = 37,
        right = 39,
        up = 38,
        down = 40,
    }
    
    var PauseKeyCode = 27; // Esc

    export class Game {
        private gameSprites: Array<Sprite> = new Array<Sprite>();
        private player: Player;
        private lastUpdate: number;
        public isPaused = false;
        public multi = new Multiplayer();
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;
        constructor(player: Player) {
            this.canvas = document.createElement("canvas");
            var self = this;
            $(() => {
                document.body.appendChild(self.canvas);
            });
            this.ctx = <CanvasRenderingContext2D>this.canvas.getContext("2d");
            self = this;
            window.addEventListener('resize', () => {
                self.resizeCanvas()
            }, false);
            this.resizeCanvas();
            self = this;
            window.addEventListener('keypress', (e) => {
                if(e.keyCode == PauseKeyCode) {self.isPaused = !self.isPaused;}
            });


            this.player = player;
            this.reset();
            this.lastUpdate = Date.now();
        }
        resizeCanvas() {
            this.ctx = <CanvasRenderingContext2D>this.canvas.getContext("2d");
            this.ctx.canvas.width = window.innerWidth;
            this.ctx.canvas.height = window.innerHeight;
        }
        reset() {
            this.gameSprites.forEach(sprite => {
                sprite.reset();
            });
            this.player.reset();
        }
        start() {
            this.multi.start();
            this.gameLoop();
        }
        gameLoop() {
            var now = Date.now();
            var delta = now - this.lastUpdate;
            delta = delta / 1000;
            if (!this.isPaused) {
                // Tick sprites
                this.gameSprites.forEach(sprite => {
                    sprite.tick(delta);
                });
                this.player.tick(delta);
            }
            // Clear canvas
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            // Draw sprites
            this.gameSprites.forEach(sprite => {
                sprite.draw(this.ctx);
            });
            // Draw other players
            otherPlayers.forEach(player => {
                player.draw(this.ctx);
            });
            // Draw our player
            this.player.draw(this.ctx);
            if (this.isPaused) {
                this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                this.ctx.fillStyle = "#FFFFFF"
                this.ctx.font = "30px Arial";
                this.ctx.fillText("Paused", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
            }
            this.multi.sendPlayerData(this.player);
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