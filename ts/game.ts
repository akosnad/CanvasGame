namespace CanvasGame {
    let PauseKeyCode = "Escape";
    let DebugKeyCode = "F8";

    export var otherPlayers = new Array<OtherPlayer>();

    export enum MovingDirections {
        left = 37,
        right = 39,
        up = 38,
        down = 40,
        modifier = 16, // Shift
        secondaryModifier = 17 // Ctrl
    }

    class OnScreenControls {
        pause = <HTMLElement>document.getElementById("control-pause");
        resume = <HTMLElement>document.getElementById("control-resume");
        container = <HTMLElement>document.getElementById("controls");
        left = <HTMLElement>document.getElementById("control-left");
        right = <HTMLElement>document.getElementById("control-right");
        up = <HTMLElement>document.getElementById("control-up");
        down = <HTMLElement>document.getElementById("control-down");
        modifier = <HTMLElement>document.getElementById("control-modifier");
        // modifierSecondary = <HTMLElement>document.getElementById("control-modifier-secondary");
        enabled = false;
        constructor(game: Game) {
            this.pause.addEventListener("click", () => { game.togglePause(); });
            this.pause.style.cursor = "pointer";
            this.resume.addEventListener("click", () => { game.togglePause(); });
            this.resume.style.cursor = "pointer";

            this.left.addEventListener("mousedown", () => { game.player.movingDirections[MovingDirections.left] = 1; });
            this.left.addEventListener("touchstart", () => { game.player.movingDirections[MovingDirections.left] = 1; });
            this.right.addEventListener("mousedown", () => { game.player.movingDirections[MovingDirections.right] = 1; });
            this.right.addEventListener("touchstart", () => { game.player.movingDirections[MovingDirections.right] = 1; });
            this.up.addEventListener("mousedown", () => { game.player.movingDirections[MovingDirections.up] = 1; });
            this.up.addEventListener("touchstart", () => { game.player.movingDirections[MovingDirections.up] = 1; });
            this.down.addEventListener("mousedown", () => { game.player.movingDirections[MovingDirections.down] = 1; });
            this.down.addEventListener("touchstart", () => { game.player.movingDirections[MovingDirections.down] = 1; });
            this.modifier.addEventListener("mousedown", () => { game.player.movingDirections[MovingDirections.modifier] = 1; });
            this.modifier.addEventListener("touchstart", () => { game.player.movingDirections[MovingDirections.modifier] = 1; });
            // this.modifierSecondary.addEventListener("mousedown", () => { game.player.movingDirections[MovingDirections.secondaryModifier] = 1; });
            // this.modifierSecondary.addEventListener("touchstart", () => { game.player.movingDirections[MovingDirections.secondaryModifier] = 1; });

            this.left.addEventListener("mouseup", () => { delete game.player.movingDirections[MovingDirections.left]; });
            this.left.addEventListener("touchend", () => { delete game.player.movingDirections[MovingDirections.left]; });
            this.right.addEventListener("mouseup", () => { delete game.player.movingDirections[MovingDirections.right]; });
            this.right.addEventListener("touchend", () => { delete game.player.movingDirections[MovingDirections.right]; });
            this.up.addEventListener("mouseup", () => { delete game.player.movingDirections[MovingDirections.up]; });
            this.up.addEventListener("touchend", () => { delete game.player.movingDirections[MovingDirections.up]; });
            this.down.addEventListener("mouseup", () => { delete game.player.movingDirections[MovingDirections.down]; });
            this.down.addEventListener("touchend", () => { delete game.player.movingDirections[MovingDirections.down]; });
            this.modifier.addEventListener("mouseup", () => { delete game.player.movingDirections[MovingDirections.modifier]; });
            this.modifier.addEventListener("touchend", () => { delete game.player.movingDirections[MovingDirections.modifier]; });
            // this.modifierSecondary.addEventListener("mouseup", () => { delete game.player.movingDirections[MovingDirections.secondaryModifier]; });
            // this.modifierSecondary.addEventListener("touchend", () => { delete game.player.movingDirections[MovingDirections.secondaryModifier]; });
        }
        enable() {
            $(this.container).show();
            $(this.pause).show();
        }
        disable() {
            $(this.container).hide();
            $(this.pause).hide();
        }
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
        onScreenControls = new OnScreenControls(this);
        multi = new Multiplayer(this);
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
            this.levelEditorToggle = <HTMLElement>document.getElementById("level-editor-toggle");
            var self = this;
            window.addEventListener('resize', () => self.resizeCanvas(), false);
            this.resizeCanvas();
            self = this;
            window.addEventListener('keyup', e => {
                if (e.code == PauseKeyCode) {
                    self.togglePause();
                }
            });
            self = this;
            window.addEventListener('keyup', e => {
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
            this.levelEditorToggle.addEventListener("click", (e) => {
                if (self.levelEditor.editorModeEnabled) {
                    self.levelEditor.disableEditorMode();
                } else {
                    self.levelEditor.enableEditorMode();
                }
                self.updateWindowTitle();
            });

            this.background = new Background(level.backgroundImageSource);
            this.player = new Player(this.levelEditor.getPlayerImgSrc(), level.playerXInitial, level.playerYInitial, eval(level.playerLogicFunction));
            this.loadLevel(level);
            this.lastUpdate = Date.now();
        }
        togglePause() {
            this.isPaused = !this.isPaused;
            this.updateWindowTitle();
            if (this.isPaused) {
                $(this.pauseIndicator).show();
                $(this.pauseIndicator).addClass("slide-in-blurred-left");
                $(this.pauseIndicator).removeClass("slide-out-blurred-right");
            }
            else {
                $(this.pauseIndicator).removeClass("slide-in-blurred-left");
                $(this.pauseIndicator).addClass("slide-out-blurred-right");
                var self = this;
                setTimeout(() => { $(self.pauseIndicator).hide(); }, 500)
            }
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
            this.levelEditor.selectObjectByPos(-1, -1);
            this.background = new Background(level.backgroundImageSource);
            this.structures = new Array<Structure>();
            this.sprites = new Array<Sprite>();
            for (let levelSprite of level.sprites) {
                let sprite = new Sprite(levelSprite.imageSource, levelSprite.xInitial, levelSprite.yInitial);
                sprite.solid = levelSprite.solid;
                this.sprites.push(sprite);
            }
            for (let levelLivingSprite of level.livingSprites) {
                let logicFunction = eval(levelLivingSprite.logicFunction);
                if (typeof logicFunction != "function") {
                    CanvasGame.Debug.log("Couldn't load sprite logic function, got: ", levelLivingSprite.logicFunction);
                    logicFunction = (otherSprites: Array<Sprite>, structures: Array<Structure>, player: Player) => { };
                }
                let livingSprite = new LivingSprite(levelLivingSprite.imageSource, levelLivingSprite.xInitial, levelLivingSprite.yInitial, logicFunction);
                livingSprite.solid = levelLivingSprite.solid;
                livingSprite.xVelocityIncrease = levelLivingSprite.xVelocityIncrease;
                livingSprite.xVelocityDecrease = levelLivingSprite.xVelocityDecrease;
                livingSprite.xVelocityMax = levelLivingSprite.xVelocityMax;
                livingSprite.gravity = levelLivingSprite.gravity;
                livingSprite.jumpStrenght = levelLivingSprite.jumpStrenght;
                this.sprites.push(livingSprite);
            }
            for (let levelStructure of level.structures) {
                let structure = new Structure(levelStructure.imageSource, levelStructure.x, levelStructure.y, levelStructure.w, levelStructure.h);
                structure.solid = levelStructure.solid;
                this.structures.push(structure);
            }
            let playerLogicFunction = eval(level.playerLogicFunction);
            if (typeof playerLogicFunction != "function") {
                CanvasGame.Debug.log("Couldn't load player logic function, got: ", level.playerLogicFunction);
                playerLogicFunction = (otherSprites: Array<Sprite>, structures: Array<Structure>) => { };
            }
            this.player = new Player(this.levelEditor.getPlayerImgSrc(), level.playerXInitial, level.playerYInitial, playerLogicFunction);
            this.levelEditor.loadCharacter();
            this.reset();
            this.levelEditor.updateList();
        }
        changeLevel(levelPathURL: string) {
            Debug.log("Chaging level: ", levelPathURL);
            this.loadLevel(LevelLoader.load(levelPathURL));
        }
        resizeCanvas() {
            this.ctx = <CanvasRenderingContext2D>this.canvas.getContext("2d");
            this.ctx.canvas.width = window.innerWidth;
            this.ctx.canvas.height = window.innerHeight;
            Debug.calcEm(this.ctx.canvas.width, this.ctx.canvas.height);
            if (window.innerHeight < 768 || window.innerWidth < 1024) {
                this.onScreenControls.enable();
                $(this.levelEditorToggle).hide();
            } else {
                this.onScreenControls.disable();
                $(this.levelEditorToggle).show();
            }
        }
        reset() {
            this.background = new Background(this.level.backgroundImageSource);
            for (let sprite of this.sprites) {
                sprite.reset();
            }
            for (let structure of this.structures) {
                structure.reset();
            }
            this.player.reset();
            this.scrollScreen();
        }
        start() {
            this.gameLoop();
            this.multi.start();
        }
        gameLoop() {
            let now = Date.now();
            let delta = now - this.lastUpdate;
            delta = delta / 1000;
            if (!this.isPaused && !this.levelEditor.editorModeEnabled) {
                this.tickObjects(delta);
                this.scrollScreen();
            }
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

            this.background.draw(this.ctx, this.scrollX, this.scrollY);
            this.drawStructures();
            this.drawSprites();

            if (this.levelEditor.editorModeEnabled) {
                this.levelEditor.loop();
            } else {
                Debug.displayDebugInfo(this, delta);
                this.multi.sendPlayerPositionData(this.player, this.level, this.isPaused);
            }


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
            if (!this.levelEditor.editorModeEnabled) {
                for (let player of otherPlayers) {
                    if (player.levelId == this.level.id) {
                        player.draw(this.ctx, this.scrollX, this.scrollY);
                        if (MovingDirections.modifier in this.player.movingDirections) {
                            this.drawPlayerName(player);
                        }
                    }
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
        private drawPlayerName(player: OtherPlayer) {
            this.ctx.font = `${Debug.em}px Roboto`;
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
            this.ctx.fillText(player.name,
                player.x - this.scrollX,
                this.ctx.canvas.height - player.y - player.image.height,
                player.image.width * 3);
        }

        scrollScreen() {
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
            this.levelEditor.updateScroll();
        }

        private tickObjects(delta: number) {
            var self = this;
            for (let sprite of this.sprites) {
                sprite.tick(delta, self.sprites, self.structures, this.player);
            }
            this.player.tick(delta, this.sprites, self.structures, this.player);
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