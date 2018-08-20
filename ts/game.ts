namespace CanvasGame {
    let PauseKeyCode = "Escape";
    let DebugKeyCode = "F8";

    export var otherPlayers = new Array<OtherPlayer>();

    export enum MovingDirections {
        left = 37,
        right = 39,
        up = 38,
        down = 40,
    }

    export class Game {
        level: Level = new Level();
        levelList: LevelList;
        sprites = new Array<Sprite>();
        structures = new Array<Structure>();
        player: Player;
        background: Background;
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
        private levelEditorToggle: HTMLElement;
        levelEditor: LevelEditor;
        private title = "Canvas Game";
        constructor(level: Level) {
            document.title = this.title;
            this.canvas = <HTMLCanvasElement>document.getElementById("game-canvas");
            this.ctx = <CanvasRenderingContext2D>this.canvas.getContext("2d");
            var self = this;
            window.addEventListener('resize', () => self.resizeCanvas(), false);
            this.resizeCanvas();
            self = this;
            window.addEventListener('keypress', e => {
                if (e.code == PauseKeyCode) {
                    self.isPaused = !self.isPaused;
                    self.updateWindowTitle();
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
                if (e.code == DebugKeyCode) {
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
                levelButton.style.cursor = "pointer";
                var self = this;
                levelButton.addEventListener("click", (e) => {
                    self.changeLevel(<string>(<Element>e.target).getAttribute("level-path"));
                }, false);
                $(this.levelSelector).append(levelButton);
            }

            this.levelEditor = new LevelEditor(this);

            self = this;
            this.levelEditorToggle = <HTMLElement>document.getElementById("level-editor-toggle");
            this.levelEditorToggle.addEventListener("click", (e) => {
                if (self.levelEditor.editorModeEnabled) {
                    self.levelEditor.disableEditorMode();
                } else {
                    self.levelEditor.enableEditorMode();
                }
                self.updateWindowTitle();
            });

            this.background = new Background(level.backgroundImageSource);
            this.player = new Player(level.playerImageSource, level.playerXInitial, level.playerYInitial);
            this.loadLevel(level);
            this.lastUpdate = Date.now();
        }
        updateWindowTitle() {
            if (this.levelEditor.editorModeEnabled) {
                if (!this.isPaused) {
                    document.title = `${this.title} Level Editor - ${this.level.name}`;
                } else {
                    document.title = `${this.title} Level Editor - ${this.level.name} (Paused)`;
                }
            } else {
                if (!this.isPaused) {
                    document.title = `${this.title} - ${this.level.name}`;
                } else {
                    document.title = `${this.title} - ${this.level.name} (Paused)`;
                }
            }
        }
        loadLevel(level: Level) {
            this.level = level;
            this.updateWindowTitle();
            this.levelEditor.selectObject(-1, -1);
            this.background = new Background(level.backgroundImageSource);
            this.structures = new Array<Structure>();
            this.sprites = new Array<Sprite>();
            for (let levelSprite of level.sprites) {
                let sprite = new Sprite(levelSprite.imageSource, levelSprite.xInitial, levelSprite.yInitial);
                sprite.solid = levelSprite.solid;
                this.sprites.push(sprite);
            }
            for (let levelStructure of level.structures) {
                let structure = new Structure(levelStructure.imageSource, levelStructure.x, levelStructure.y, levelStructure.w, levelStructure.h);
                structure.solid = levelStructure.solid;
                this.structures.push(structure);
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
            this.background = new Background(this.level.backgroundImageSource);
            for (let sprite of this.sprites) {
                sprite.reset();
            }
            for(let structure of this.structures) {
                structure.reset();
            }
            this.player.reset();
            this.scrollScreen();
        }
        start() {
            this.multi.start();
            this.gameLoop();
        }
        gameLoop() {
            let now = Date.now();
            let delta = now - this.lastUpdate;
            delta = delta / 1000;
            if (!this.isPaused && !this.levelEditor.editorModeEnabled) {
                this.tickSprites(delta);
                this.scrollScreen();
            }
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            
            this.background.draw(this.ctx, this.scrollX, this.scrollY);
            this.drawStructures();
            this.drawSprites();
            
            if(this.levelEditor.editorModeEnabled) {
                this.levelEditor.loop();
            } else {
                Debug.displayDebugInfo(this, delta);
            }

            this.multi.sendPlayerData(this.player, this.level, this.isPaused);

            if (this.isPaused) {
                this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            }
            this.lastUpdate = now;
            window.requestAnimationFrame(() => { this.gameLoop(); });
        }
        private drawSprites() {
            // Draw game sprites
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

        private drawStructures() {
            for (let structure of this.structures) {
                structure.draw(this.ctx, this.scrollX, this.scrollY);
            }
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
                sprite.tick(delta, self.sprites, self.structures);
            }
            this.player.tick(delta, this.sprites, self.structures);
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