namespace CanvasGame {
    export class Sprite {
        xInitial = 0;
        yInitial = 0;
        x: number;
        y: number;
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
                self.imageReady = true;
            };
        }
        reset() {
            this.x = this.xInitial;
            this.y = this.yInitial;
        }
        setImage(imageSource: string) {
            this.imageSource = imageSource;
            this.imageReady = false;
            this.image = document.createElement("img");
            this.image.src = this.imageSource;
            var self = this;
            this.image.onload = (e) => {
                self.imageReady = true;
            };
        }
        tick(timeDelta: number, otherSprites: Array<Sprite>, structures: Array<Structure>, player: Player) { }
        draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
            if (this.imageReady) {
                ctx.drawImage(
                    this.image,
                    this.x - offsetX,
                    ctx.canvas.height - this.y - this.image.height + offsetY
                );
            }
        }
    }

    export class LivingSprite extends Sprite {
        movingDirections: MovingDirections[] = new Array<MovingDirections>();
        xVelocity = 0;
        yVelocity = 0;
        xVelocityMax = 255;
        xVelocityMaxWalk = 120;
        xVelocityIncrease = 30;
        xVelocityDecrease = 15;
        gravity = 15;
        jumpStrenght = 500;
        solid = false;
        isStanding = false;
        public logic(otherSprites: Array<Sprite>, structures: Array<Structure>, player: Player) { } // Custom AI behavoiur
        constructor(imageSource: string, xInitial: number, yInitial: number, logic: (otherSprites: Array<Sprite>, structures: Array<Structure>, player: Player) => any) {
            super(imageSource, xInitial, yInitial);
            this.logic = logic;
        }
        tick(timeDelta: number, otherSprites: Array<Sprite>, structures: Array<Structure>, player: Player) {
            this.logic(otherSprites, structures, player);

            this.handleMovement();
            this.handleVelocity(timeDelta);
            this.handleCollisions(structures, otherSprites, player);

            if (this.x < 0) {
                this.x = 0;
                this.xVelocity = 0;
            }
            if (this.y < 0) {
                this.y = 0;
                this.yVelocity = 0;
            }

        }
        private handleVelocity(timeDelta: number) {
            if (this.xVelocity > this.xVelocityMax) {
                this.xVelocity = this.xVelocityMax;
            }
            if (this.xVelocity > this.xVelocityMaxWalk && MovingDirections.modifier in this.movingDirections) {
                this.xVelocity = this.xVelocityMaxWalk;
            }
            if (this.xVelocity < -this.xVelocityMax) {
                this.xVelocity = -this.xVelocityMax;
            }
            if (this.xVelocity < -this.xVelocityMaxWalk && MovingDirections.modifier in this.movingDirections) {
                this.xVelocity = -this.xVelocityMaxWalk;
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
            if (MovingDirections.right in this.movingDirections) {
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

        private handleCollisions(structures: Structure[], otherSprites: Sprite[], player: Player) {
            this.isStanding = false;
            this.handleStructureCollisions(structures);
            this.handleSpriteCollisions(otherSprites);
            this.handlePlayerCollision(player);
        }

        private handleStructureCollisions(structures: Array<Structure>) {
            let solidStructures = Array<Structure>();
            for (let structure of structures) {
                if (structure.solid) {
                    solidStructures.push(structure);
                }
            }
            for (let structure of solidStructures) {
                if (this.collides(structure, structure.w, structure.h)) {
                    if (this.collisionFromTop(structure, structure.h)) {
                        this.y = structure.y + structure.h;
                        this.yVelocity = 0;
                        this.isStanding = true;
                    }
                    else if (this.collisionFromLeft(structure)) {
                        this.x = structure.x - this.image.width;
                        this.xVelocity = 0;
                    }
                    else if (this.collisionFromRight(structure, structure.w)) {
                        this.x = structure.x + structure.w;
                        this.xVelocity = 0;
                    }
                    else if (this.collisionFromBottom(structure)) {
                        this.y = structure.y - this.image.height;
                        this.yVelocity = 0;
                    }
                }
            }
        }

        private handleSpriteCollisions(otherSprites: Sprite[]) {
            let solidSprites = Array<Sprite>();
            for (let sprite of otherSprites) {
                if (sprite.solid) {
                    solidSprites.push(sprite);
                }
            }
            for (let sprite of solidSprites) {
                if (this.collides(sprite, sprite.image.width, sprite.image.height)) {
                    if (this.collisionFromTop(sprite, sprite.image.height)) {
                        this.y = sprite.y + sprite.image.height;
                        this.yVelocity = 0;
                        this.isStanding = true;
                    }
                    else if (this.collisionFromLeft(sprite)) {
                        this.x = sprite.x - this.image.width;
                        this.xVelocity = 0;
                    }
                    else if (this.collisionFromRight(sprite, sprite.image.width)) {
                        this.x = sprite.x + sprite.image.width;
                        this.xVelocity = 0;
                    }
                    else if (this.collisionFromBottom(sprite)) {
                        this.y = sprite.y - this.image.height;
                        this.yVelocity = 0;
                    }
                }
            }
        }

        private handlePlayerCollision(player: Player) {
            if (!(this instanceof Player)) {
                if (this.collides(player, player.image.width, player.image.height)) {
                    if (this.collisionFromTop(player, player.image.height)) {
                        this.y = player.y + player.image.height;
                        this.yVelocity = 0;
                        this.isStanding = true;
                    }
                    else if (this.collisionFromLeft(player)) {
                        this.x = player.x - this.image.width;
                        this.xVelocity = 0;
                    }
                    else if (this.collisionFromRight(player, player.image.width)) {
                        this.x = player.x + player.image.width;
                        this.xVelocity = 0;
                    }
                    else if (this.collisionFromBottom(player)) {
                        this.y = player.y - this.image.height;
                        this.yVelocity = 0;
                    }
                }
            }
        }

        private collisionFromBottom(object: Sprite | Structure) {
            return this.yVelocity > 0 && this.y + this.image.height <= object.y + 10;
        }

        private collisionFromTop(object: Sprite | Structure, h: number) {
            return this.yVelocity < 0 && this.y >= object.y + h - 10;
        }

        private collisionFromRight(object: Sprite | Structure, w: number) {
            return this.xVelocity < 0 && this.x >= object.x + w - 10;
        }

        private collisionFromLeft(object: Sprite | Structure) {
            return this.xVelocity > 0 && this.x + this.image.width <= object.x + 10;
        }

        private collides(sprite: Sprite | Structure, w: number, h: number) {
            return sprite.x < this.x + this.image.width &&
                sprite.x + w > this.x &&
                sprite.y < this.y + this.image.height &&
                h + sprite.y > this.y;
        }

        reset() {
            this.x = this.xInitial;
            this.y = this.yInitial;
            this.xVelocity = 0;
            this.yVelocity = 0;
        }
    }

    export class Player extends LivingSprite {
        name = "";
        constructor(imageSource: string, xInitial: number, yInitial: number, logic: (otherSprites: Array<Sprite>, structures: Array<Structure>) => any) {
            super(imageSource, xInitial, yInitial, logic);
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
        playerId = 0;
        levelId = 0;
        lastUpdateTimestamp = Date.now();
        solid = false;
        isPaused = false;
        name = "";
        constructor() {
            super("", 0, 0);
        }
        draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
            if (this.imageReady) {
                if (this.isPaused) {
                    ctx.globalAlpha = 0.4;
                }
                ctx.drawImage(
                    this.image,
                    this.x - offsetX,
                    ctx.canvas.height - this.y - this.image.height + offsetY
                );
                ctx.globalAlpha = 1;
            }
        }
    }

    export class Background {
        image = document.createElement("img");
        imageReady = false;
        imageSource: string;
        constructor(imageSource: string) {
            this.imageSource = imageSource;
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

    export class Structure {
        x: number;
        y: number;
        w: number;
        h: number;
        solid = true;
        patternWidth = 0;
        patternHeight = 0;
        private image = document.createElement('img');
        imageSource: string;
        private imageReady = false;
        pattern: CanvasPattern | undefined;
        private matrixProvider = <any>document.getElementById("matrix-provider");
        private matrix = <SVGMatrix>this.matrixProvider.createSVGMatrix();

        constructor(imageSource: string, x: number, y: number, w: number, h: number) {
            this.imageSource = imageSource;
            this.image.src = imageSource;
            var self = this;
            this.image.onload = (e) => {
                self.imageLoaded(e)
            };
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
        }
        imageLoaded(e: Event) {
            this.imageReady = true;
            let c = <CanvasRenderingContext2D>document.createElement("canvas").getContext('2d');
            this.pattern = <CanvasPattern>c.createPattern(this.image, "repeat");
            this.patternWidth = this.image.width;
            this.patternHeight = this.image.height;
        }
        reset() {
            this.imageReady = false;
            this.image = document.createElement("img");
            this.image.src = this.imageSource;
            var self = this;
            this.image.onload = (e) => {
                self.imageLoaded(e)
            };
        }
        draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
            if (this.imageReady && typeof this.pattern != "undefined") {
                (<CanvasPattern>this.pattern).setTransform(this.matrix.translate(
                    this.x - offsetX,
                    ctx.canvas.height - this.y + offsetY
                ));
                ctx.fillStyle = <CanvasPattern>this.pattern;
                ctx.fillRect(
                    this.x - offsetX,
                    ctx.canvas.height - this.y - this.h + offsetY,
                    this.w,
                    this.h,
                );
            }
        }
    }
}