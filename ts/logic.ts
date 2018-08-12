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
        draw(canvasRenderingContext: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
            if (this.imageReady) {
                canvasRenderingContext.drawImage(
                    this.image,
                    this.x - offsetX,
                    canvasRenderingContext.canvas.height - this.y - this.hitboxHeight + offsetY
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
        lastUpdateTimestamp: number;
        constructor(imageSource: string, playerData: MultiPlayerData) {
            super(imageSource, 0, 0);
            this.id = playerData.id;
            this.lastUpdateTimestamp = playerData.lastUpdateTimestamp;
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
    var DebugKeyCode = 119; // F8

    export class Game {
        private gameSprites: Array<Sprite> = new Array<Sprite>();
        private player: Player;
        private scrollX = 0;
        private scrollY = 0;
        private lastUpdate: number;
        public isPaused = false;
        public multi = new Multiplayer();
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;
        private pauseIndicator: HTMLElement;
        private debugInfoEnabled = false;
        constructor(player: Player) {
            this.canvas = <HTMLCanvasElement>document.getElementById("game-canvas");
            this.ctx = <CanvasRenderingContext2D>this.canvas.getContext("2d");
            var self = this;
            window.addEventListener('resize', () => self.resizeCanvas(), false);
            this.resizeCanvas();
            self = this;
            window.addEventListener('keypress', e => {
                if (e.keyCode == PauseKeyCode) {
                    self.isPaused = !self.isPaused;
                    if (self.isPaused) {
                        $(self.pauseIndicator).show();
                        $(self.pauseIndicator).addClass("slide-in-blurred-left");
                        $(self.pauseIndicator).removeClass("slide-out-blurred-right");
                    } else {
                        $(self.pauseIndicator).removeClass("slide-in-blurred-left");
                        $(self.pauseIndicator).addClass("slide-out-blurred-right");
                    }
                }
            });
            self = this;
            window.addEventListener('keypress', e => {
                if (e.keyCode == DebugKeyCode) {
                    self.debugInfoEnabled = !self.debugInfoEnabled;
                }
            });

            this.pauseIndicator = <HTMLElement>document.getElementById("pause-indicator");
            $(this.pauseIndicator).hide();

            this.player = player;
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
                // Scroll screen if needed
                if (this.player.x - this.scrollX > this.ctx.canvas.width * 0.8) {
                    this.scrollX += this.player.x - this.scrollX - (this.ctx.canvas.width * 0.8);
                } else if (this.player.x - this.scrollX < this.ctx.canvas.width * 0.2) {
                    this.scrollX -= (this.scrollX + (this.ctx.canvas.width * 0.2)) - this.player.x;
                }
                if (this.player.y - this.scrollY > this.ctx.canvas.height * 0.9) {
                    this.scrollY += this.player.y - this.scrollY - (this.ctx.canvas.height * 0.9);
                } else if (this.player.y - this.scrollY < this.ctx.canvas.height * 0.1) {
                    this.scrollY -= (this.scrollY + (this.ctx.canvas.height * 0.1)) - this.player.y;
                }
                if (this.scrollX < 0) { this.scrollX = 0; }
                if (this.scrollY < 0) { this.scrollY = 0; }
            }
            // Clear canvas
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            // Draw sprites
            this.gameSprites.forEach(sprite => {
                sprite.draw(this.ctx, this.scrollX, this.scrollY);
            });
            // Draw other players
            otherPlayers.forEach(player => {
                player.draw(this.ctx, this.scrollX, this.scrollY);
            });
            // Draw our player
            this.player.draw(this.ctx, this.scrollX, this.scrollY);
            // Display debug info if enabled
            if (this.debugInfoEnabled) {
                this.ctx.fillStyle = "#FFFFFF";
                this.ctx.font = "12px Roboto";
                this.ctx.fillText("Canvas Game", this.ctx.canvas.width - 88, this.canvas.height - 24);
                this.ctx.fillText("Made by Ákos Nádudvari", this.ctx.canvas.width - 150, this.ctx.canvas.height - 12);
                this.ctx.fillText("x", 0, 24);
                this.ctx.fillText("y", 0, 36);
                this.ctx.fillText("absolute pos", 20, 12);
                this.ctx.fillText(Math.round(this.player.x).toString(), 20, 24);
                this.ctx.fillText(Math.round(this.player.y).toString(), 20, 36);
                this.ctx.fillText("scroll", 120, 12);
                this.ctx.fillText(Math.round(this.scrollX).toString(), 120, 24);
                this.ctx.fillText(Math.round(this.scrollY).toString(), 120, 36);
                this.ctx.fillText("relative pos", 220, 12);
                this.ctx.fillText(Math.round(this.player.x - this.scrollX).toString(), 220, 24);
                this.ctx.fillText(Math.round(this.player.y - this.scrollY).toString(), 220, 36);
                this.ctx.fillText("screen", 320, 12);
                this.ctx.fillText(Math.round(this.ctx.canvas.width).toString(), 320, 24);
                this.ctx.fillText(Math.round(this.ctx.canvas.height).toString(), 320, 36);
            }
            if (this.isPaused) {
                this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                // this.ctx.fillStyle = "#FFFFFF"
                // this.ctx.font = "30px Roboto";
                // this.ctx.fillText("Paused", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
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