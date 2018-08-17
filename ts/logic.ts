/// <reference path="multi.ts" />

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
                if(this.isPaused) {
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

    export var otherPlayers = new Array<OtherPlayer>();

    export enum MovingDirections {
        left = 37,
        right = 39,
        up = 38,
        down = 40,
    }

    let PauseKeyCode = 27; // Esc
    let DebugKeyCode = 119; // F8

    export class Game {
        level: Level = new Level();
        levelList: LevelList;
        sprites = new Array<Sprite>();
        player: Player;
        scrollX = 0;
        scrollY = 0;
        mouseX = 0;
        mouseY = 0;
        private lastUpdate: number;
        isPaused = false;
        multi = new Multiplayer();
        private canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        private pauseIndicator: HTMLElement;
        private levelSelector: HTMLElement;
        constructor(level: Level) {
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
                    Debug.debugInfoEnabled = !Debug.debugInfoEnabled;
                    e.preventDefault();
                }
            });
            self = this;
            window.addEventListener('mousemove', e => {
                self.mouseX = e.x;
                self.mouseY = e.y;
            });

            this.pauseIndicator = <HTMLElement>document.getElementById("pause-indicator");
            $(this.pauseIndicator).hide();

            this.levelSelector = <HTMLElement>document.getElementById("level-selector");
            this.levelList = LevelLoader.getList();
            for (let level of this.levelList.levels) {
                let levelButton = document.createElement("li");
                levelButton.setAttribute("class", "list-group-item wave-effect");
                levelButton.setAttribute("level-path", level.path);
                levelButton.innerText = level.name;
                var self = this;
                levelButton.addEventListener("click", (e) => {
                    self.changeLevel(<string>(<Element>e.target).getAttribute("level-path"));
                }, false);
                $(this.levelSelector).append(levelButton);
            }

            this.player = new Player(level.playerImageSource, level.playerXInitial, level.playerYInitial);
            this.loadLevel(level);
            this.lastUpdate = Date.now();
        }
        loadLevel(level: Level) {
            this.level = level;
            this.sprites = new Array<Sprite>();
            for (let levelSprite of level.sprites) {
                let sprite = new Sprite(levelSprite.imageSource, levelSprite.xInitial, levelSprite.yInitial);
                sprite.solid = levelSprite.solid;
                sprite.hitboxHeight = levelSprite.hitboxHeight;
                sprite.hitboxWidth = levelSprite.hitboxWidth;
                this.sprites.push(sprite);
            }
            this.player = new Player(level.playerImageSource, level.playerXInitial, level.playerYInitial);
            this.reset();
        }
        changeLevel(levelPathURL: string) {
            Debug.log("Chaging level: ", levelPathURL);
            this.loadLevel(LevelLoader.load(levelPathURL));
        }
        resizeCanvas() {
            this.ctx = <CanvasRenderingContext2D>this.canvas.getContext("2d");
            this.ctx.canvas.width = window.innerWidth;
            this.ctx.canvas.height = window.innerHeight;
        }
        reset() {
            for (let sprite of this.sprites) {
                sprite.reset();
            }
            this.player.reset();
        }
        start() {
            // $(this.pauseIndicator).text("Paused");
            this.multi.start();
            this.gameLoop();
        }
        gameLoop() {
            let now = Date.now();
            let delta = now - this.lastUpdate;
            delta = delta / 1000;
            if (!this.isPaused) {
                this.tickSprites(delta);
                this.scrollScreen();
            }
            this.drawSprites();

            Debug.displayDebugInfo(this, delta);
            if (this.isPaused) {
                this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            }
            this.multi.sendPlayerData(this.player, this.level, this.isPaused);
            this.lastUpdate = now;
            window.requestAnimationFrame(() => { this.gameLoop(); });
            // setTimeout(() => {
            //     this.gameLoop();
            // }, 50); // render every 50ms for testing
        }

        private drawSprites() {
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            // Draw sprites
            for (let sprite of this.sprites) {
                sprite.draw(this.ctx, this.scrollX, this.scrollY);
            }
            // Draw other players
            for (let player of otherPlayers) {
                if (player.levelId == this.level.id) {
                    player.draw(this.ctx, this.scrollX, this.scrollY);
                }
            }
            // Draw our player
            this.player.draw(this.ctx, this.scrollX, this.scrollY);
        }

        private scrollScreen() {
            if (this.player.x - this.scrollX > this.ctx.canvas.width * 0.8) {
                this.scrollX += this.player.x - this.scrollX - (this.ctx.canvas.width * 0.8);
            }
            else if (this.player.x - this.scrollX < this.ctx.canvas.width * 0.2) {
                this.scrollX -= (this.scrollX + (this.ctx.canvas.width * 0.2)) - this.player.x;
            }
            if (this.player.y - this.scrollY > this.ctx.canvas.height * 0.9) {
                this.scrollY += this.player.y - this.scrollY - (this.ctx.canvas.height * 0.9);
            }
            else if (this.player.y - this.scrollY < this.ctx.canvas.height * 0.1) {
                this.scrollY -= (this.scrollY + (this.ctx.canvas.height * 0.1)) - this.player.y;
            }
            if (this.scrollX < 0) {
                this.scrollX = 0;
            }
            if (this.scrollY < 0) {
                this.scrollY = 0;
            }
        }

        private tickSprites(delta: number) {
            var self = this;
            for (let sprite of this.sprites) {
                sprite.tick(delta, self.sprites);
            }
            this.player.tick(delta, this.sprites);
        }

        addSprite(sprite: Sprite) {
            this.level.sprites.push(sprite);
        }
        addSprites(sprites: Array<Sprite>) {
            for (let sprite of sprites) {
                this.addSprite(sprite);
            }
        }
    }
}