namespace CanvasGame {
    export class LevelEditor {
        editorModeEnabled = false;
        selectedObject: Sprite | Structure | Player | undefined | null;
        game: Game;

        private CharacterEditorMenu = <HTMLElement>document.getElementById("editor-character");
        private CharacterEditorDropdown = <HTMLElement>document.getElementById("editor-character-dropdown");
        private CharacterEditorDropdownIcon = <HTMLElement>document.getElementById("editor-character-dropdown-icon");

        private CharacterEditorApply = <HTMLElement>document.getElementById("editor-character-set");
        private CharacterEditorReset = <HTMLElement>document.getElementById("editor-character-reset");
        private CharacterEditorName = <HTMLElement>document.getElementById("player-name-input");
        private CharacterEditorImgUrl = <HTMLElement>document.getElementById("player-img-input");

        // Level Editor menu elements
        private LEM = <HTMLElement>document.getElementById("level-editor-menu");

        private LEMNewLevel = <HTMLElement>document.getElementById("editor-new-level");
        private LEMNewSprite = <HTMLElement>document.getElementById("editor-new-sprite");
        private LEMNewStructure = <HTMLElement>document.getElementById("editor-new-structure");
        private LEMExport = <HTMLElement>document.getElementById("editor-export");

        private LEMList = <HTMLElement>document.getElementById("editor-list");
        private LEMListPlayer = <HTMLElement>document.getElementById("editor-list-player");
        private LEMListSprite = <HTMLElement>document.getElementById("editor-list-sprite");
        private LEMListStructure = <HTMLElement>document.getElementById("editor-list-structure");

        private LEMGeneral = <HTMLElement>document.getElementById("editor-general");
        private LEMGeneralApply = <HTMLElement>document.getElementById("editor-general-set");
        private LEMGeneralReset = <HTMLElement>document.getElementById("editor-general-reset");
        private LEMGeneralLevelId = <HTMLElement>document.getElementById("level-id-input");
        private LEMGeneralLevelName = <HTMLElement>document.getElementById("level-name-input");
        private LEMGeneralBgUrl = <HTMLElement>document.getElementById("level-bg-input");

        private LEMSprite = <HTMLElement>document.getElementById("editor-sprite");
        private LEMSpriteApply = <HTMLElement>document.getElementById("editor-sprite-set");
        private LEMSpriteReset = <HTMLElement>document.getElementById("editor-sprite-reset");
        private LEMSpriteImgUrl = <HTMLElement>document.getElementById("sprite-img-input");
        private LEMSpriteInitialPosX = <HTMLElement>document.getElementById("sprite-initial-x-input");
        private LEMSpriteInitialPosY = <HTMLElement>document.getElementById("sprite-initial-y-input");
        private LEMSpriteSolid = <HTMLElement>document.getElementById("sprite-solid-input");

        private LEMStructure = <HTMLElement>document.getElementById("editor-structure");
        private LEMStructureApply = <HTMLElement>document.getElementById("editor-structure-set");
        private LEMStructureReset = <HTMLElement>document.getElementById("editor-structure-reset");
        private LEMStructureImgURL = <HTMLElement>document.getElementById("structure-img-input");
        private LEMStructureSolid = <HTMLElement>document.getElementById("structure-solid-input");
        private LEMStructurePosX = <HTMLElement>document.getElementById("structure-pos-x-input");
        private LEMStructurePosY = <HTMLElement>document.getElementById("structure-pos-y-input");
        private LEMStructureWidth = <HTMLElement>document.getElementById("structure-wh-w-input");
        private LEMStructureHeight = <HTMLElement>document.getElementById("structure-wh-h-input");

        private LEMPlayer = <HTMLElement>document.getElementById("editor-player");
        private LEMPlayerApply = <HTMLElement>document.getElementById("editor-player-set");
        private LEMPlayerReset = <HTMLElement>document.getElementById("editor-player-reset");
        private LEMPlayerInitialPosX = <HTMLElement>document.getElementById("player-initial-x-input");
        private LEMPlayerInitialPosY = <HTMLElement>document.getElementById("player-initial-y-input");

        constructor(game: Game) {
            this.game = game;
            var self = this;

            $(this.LEMList).hide();

            $(this.CharacterEditorMenu).hide();
            this.CharacterEditorDropdown.style.cursor = "pointer";
            this.CharacterEditorDropdown.addEventListener("click", () => { self.toggleCharacterEditorMenu(); });
            this.CharacterEditorApply.addEventListener("click", () => { self.applyCharacterEditor(); });
            this.CharacterEditorReset.addEventListener("click", () => { self.updateCharacterEditor(); });
            this.updateCharacterEditor();

            this.switchEditorMenu();

            this.game.ctx.canvas.addEventListener("click", (e) => {
                self.selectObjectByPos(e.x, e.y);
            });

            this.LEMNewLevel.addEventListener("click", () => { self.newLevel(); });
            this.LEMNewSprite.addEventListener("click", () => { self.newSprite(); });
            this.LEMNewStructure.addEventListener("click", () => { self.newStructure(); });
            this.LEMExport.addEventListener("click", () => { self.exportLevel(); });

            this.LEMGeneralApply.addEventListener("click", () => { self.applyEditorMenuGeneral(); });
            this.LEMGeneralReset.addEventListener("click", () => { self.updateEditorMenuGeneral(); });
            this.LEMPlayerApply.addEventListener("click", () => { self.applyEditorMenuPlayer(); });
            this.LEMPlayerReset.addEventListener("click", () => { self.updateEditorMenuPlayer(); });
            this.LEMSpriteApply.addEventListener("click", () => { self.applyEditorMenuSprite(); });
            this.LEMSpriteReset.addEventListener("click", () => { self.updateEditorMenuSprite(); });
            this.LEMStructureApply.addEventListener("click", () => { self.applyEditorMenuStructure(); });
            this.LEMStructureReset.addEventListener("click", () => { self.updateEditorMenuStructure(); });

            this.LEMListPlayer.addEventListener("click", () => { self.selectPlayer(); });
            this.LEMListPlayer.style.cursor = "pointer";

            this.updateList();
        }
        enableEditorMode() {
            this.editorModeEnabled = true;
            $(this.LEM).show();
            $(this.LEMList).show();
            this.game.reset();
        }
        disableEditorMode() {
            this.editorModeEnabled = false;
            $(this.LEM).hide();
            $(this.LEMList).hide();
            this.game.reset();
        }
        private toggleCharacterEditorMenu() {
            $(this.CharacterEditorMenu).toggle();
            $(this.CharacterEditorDropdownIcon).toggleClass("fa-angle-left");
            $(this.CharacterEditorDropdownIcon).toggleClass("fa-angle-down");
        }
        private newLevel() {
            let level = new Level();
            level.id = Date.now();
            this.game.loadLevel(level);
            this.selectedObject = null;
            this.switchEditorMenu();
        }
        private exportLevel() {
            let level = new Level();
            level = this.game.level;
            level.sprites = new Array<LevelSprite>();
            level.structures = new Array<LevelStructure>();
            for (let sprite of this.game.sprites) {
                level.sprites.push(new LevelSprite(sprite));
            }
            for (let structure of this.game.structures) {
                level.structures.push(new LevelStructure(structure));
            }
            LevelLoader.export(level);
        }
        private newSprite() {
            this.selectedObject = new Sprite("/img/monster.png", 0, 0);
            this.game.sprites.push(this.selectedObject);
            this.switchEditorMenu();
        }
        private newStructure() {
            this.selectedObject = new Structure("/img/stone_big.png", 0, 0, 32, 32);
            this.game.structures.push(this.selectedObject);
            this.switchEditorMenu();
        }
        updateList() {
            $(this.LEMListSprite).empty();
            $(this.LEMListStructure).empty();
            this.game.sprites.forEach((sprite, i) => {
                let element = document.createElement("li");
                element.setAttribute("class", "list-group-item wave-effect");
                element.innerText = `${i}: ${sprite.imageSource}`;
                element.style.cursor = "pointer";
                element.setAttribute("index", i.toString());

                let deleteButton = document.createElement("button");
                deleteButton.setAttribute("class", "btn btn-sm btn-danger");
                deleteButton.setAttribute("style", "font-size: 2rem;padding: 0.3rem;line-height:1.2rem");
                deleteButton.innerHTML = "&times;";
                deleteButton.setAttribute("index", i.toString());

                element.appendChild(deleteButton);

                var self = this;
                element.addEventListener("click", (e) => {
                    self.selectSprite(parseInt(<string>(<HTMLElement>e.target).getAttribute("index")));
                });
                deleteButton.addEventListener("click", (e) => {
                    self.removeSprite(parseInt(<string>(<HTMLElement>e.target).getAttribute("index")));
                    self.selectObjectByPos(-1, -1);
                });
                $(this.LEMListSprite).append(element);
            });
            this.game.structures.forEach((structure, i) => {
                let element = document.createElement("li");
                element.setAttribute("class", "list-group-item wave-effect");
                element.innerText = `${i}: ${structure.imageSource}`;
                element.style.cursor = "pointer";
                element.setAttribute("index", i.toString());

                let deleteButton = document.createElement("button");
                deleteButton.setAttribute("class", "btn btn-sm btn-danger");
                deleteButton.setAttribute("style", "font-size: 2rem;padding: 0.3rem;line-height:1.2rem");
                deleteButton.innerHTML = "&times;";
                deleteButton.setAttribute("index", i.toString());

                element.appendChild(deleteButton);

                var self = this;
                element.addEventListener("click", (e) => {
                    self.selectStructure(parseInt(<string>(<HTMLElement>e.target).getAttribute("index")));
                });
                $(this.LEMListStructure).append(element);
                deleteButton.addEventListener("click", (e) => {
                    self.removeStructure(parseInt(<string>(<HTMLElement>e.target).getAttribute("index")));
                    self.selectObjectByPos(-1, -1);
                });
                $(this.LEMListStructure).append(element);
            });
        }
        private switchEditorMenu() {
            if (typeof this.selectedObject != "undefined" && this.selectedObject != null) {
                if (this.selectedObject instanceof Player) {
                    $(this.LEMGeneral).hide();
                    $(this.LEMSprite).hide();
                    $(this.LEMStructure).hide();
                    $(this.LEMPlayer).show();

                    this.updateEditorMenuPlayer();
                } else if (this.selectedObject instanceof Sprite) {
                    $(this.LEMGeneral).hide();
                    $(this.LEMSprite).show();
                    $(this.LEMStructure).hide();
                    $(this.LEMPlayer).hide();

                    this.updateEditorMenuSprite();
                } else if (this.selectedObject instanceof Structure) {
                    $(this.LEMGeneral).hide();
                    $(this.LEMSprite).hide();
                    $(this.LEMStructure).show();
                    $(this.LEMPlayer).hide();

                    this.updateEditorMenuStructure();
                }
            } else {
                $(this.LEMGeneral).show();
                $(this.LEMSprite).hide();
                $(this.LEMStructure).hide();
                $(this.LEMPlayer).hide();

                this.updateEditorMenuGeneral();
            }
        }
        getPlayerImgSrc() {
            let result = localStorage.getItem("playerImg");
            if (typeof result == "string" && result != "") {
                return result;
            } else { return "/img/hero.png"; }
        }
        private applyCharacterEditor() {
            let playerName = $(this.CharacterEditorName).val();
            let playerImg = $(this.CharacterEditorImgUrl).val();

            if (typeof playerName == "string") {
                localStorage.setItem("playerName", playerName);
                this.game.player.name = playerName;
            }
            if (typeof playerImg == "string") {
                localStorage.setItem("playerImg", playerImg);
                this.game.player.setImage(this.getPlayerImgSrc());
            }
            this.game.multi.sendPlayerDescription();
        }
        private updateCharacterEditor() {
            let playerName = localStorage.getItem("playerName");
            let playerImg = localStorage.getItem("playerImg");

            if (playerName == null) {
                $(this.CharacterEditorName).val("");
            } else {
                $(this.CharacterEditorName).val(playerName);
            }
            if (playerImg == null) {
                $(this.CharacterEditorImgUrl).val("");
            } else {
                $(this.CharacterEditorImgUrl).val(playerImg);
            }
        }
        private updateEditorMenuGeneral() {
            $(this.LEMGeneralLevelId).val(this.game.level.id);
            $(this.LEMGeneralLevelName).val(this.game.level.name);
            $(this.LEMGeneralBgUrl).val(this.game.level.backgroundImageSource);
        }
        private applyEditorMenuGeneral() {
            this.game.level.name = <string>$(this.LEMGeneralLevelName).val();
            this.game.level.backgroundImageSource = <string>$(this.LEMGeneralBgUrl).val();
            this.game.background.imageSource = <string>$(this.LEMGeneralBgUrl).val();
            this.game.reset();
            this.game.updateWindowTitle();
            this.updateList();
        }
        private updateEditorMenuPlayer() {
            if (this.selectedObject instanceof Player) {
                $(this.LEMPlayerInitialPosX).val(this.selectedObject.xInitial);
                $(this.LEMPlayerInitialPosY).val(this.selectedObject.yInitial);
            }
        }
        private applyEditorMenuPlayer() {
            if (this.selectedObject instanceof Player) {
                this.selectedObject.xInitial = parseInt(<string>$(this.LEMPlayerInitialPosX).val());
                this.game.level.playerXInitial = parseInt(<string>$(this.LEMPlayerInitialPosX).val());
                this.selectedObject.yInitial = parseInt(<string>$(this.LEMPlayerInitialPosY).val());
                this.game.level.playerYInitial = parseInt(<string>$(this.LEMPlayerInitialPosY).val());
                this.game.player = this.selectedObject;
            }
            this.game.reset();
            this.updateList();
        }
        private updateEditorMenuSprite() {
            if (this.selectedObject instanceof Sprite) {
                $(this.LEMSpriteImgUrl).val(this.selectedObject.imageSource);
                $(this.LEMSpriteInitialPosX).val(this.selectedObject.xInitial);
                $(this.LEMSpriteInitialPosY).val(this.selectedObject.yInitial);
                $(this.LEMSpriteSolid).prop('checked', this.selectedObject.solid);
            }
        }
        private updateEditorMenuSpritePos() {
            if (this.selectedObject instanceof Sprite) {
                $(this.LEMSpriteInitialPosX).val(this.selectedObject.xInitial);
                $(this.LEMSpriteInitialPosY).val(this.selectedObject.yInitial);
            }
        }
        private applyEditorMenuSprite() {
            if (this.selectedObject instanceof Sprite) {
                this.selectedObject.imageSource = <string>$(this.LEMSpriteImgUrl).val();
                this.selectedObject.xInitial = parseInt(<string>$(this.LEMSpriteInitialPosX).val());
                this.selectedObject.yInitial = parseInt(<string>$(this.LEMSpriteInitialPosY).val());
                this.selectedObject.solid = $(this.LEMSpriteSolid).is(":checked");
            }
            this.game.reset();
            this.updateList();
        }
        private updateEditorMenuStructure() {
            if (this.selectedObject instanceof Structure) {
                $(this.LEMStructureImgURL).val(this.selectedObject.imageSource);
                $(this.LEMStructureSolid).prop('checked', this.selectedObject.solid);
                $(this.LEMStructurePosX).val(this.selectedObject.x);
                $(this.LEMStructurePosY).val(this.selectedObject.y);
                $(this.LEMStructureWidth).val(this.selectedObject.w);
                $(this.LEMStructureHeight).val(this.selectedObject.h);
            }
        }
        private updateEditorMenuStructurePos() {
            if (this.selectedObject instanceof Structure) {
                $(this.LEMStructurePosX).val(this.selectedObject.x);
                $(this.LEMStructurePosY).val(this.selectedObject.y);
            }
        }
        private applyEditorMenuStructure() {
            if (this.selectedObject instanceof Structure) {
                this.selectedObject.imageSource = <string>$(this.LEMStructureImgURL).val();
                this.selectedObject.solid = $(this.LEMStructureSolid).is(":checked");
                this.selectedObject.x = parseInt(<string>$(this.LEMStructurePosX).val());
                this.selectedObject.y = parseInt(<string>$(this.LEMStructurePosY).val());
                this.selectedObject.w = parseInt(<string>$(this.LEMStructureWidth).val());
                this.selectedObject.h = parseInt(<string>$(this.LEMStructureHeight).val());
            }
            this.game.reset();
            this.updateList();
        }
        loop() {
            if (typeof this.selectedObject != "undefined" && this.selectedObject != null) {
                this.moveObject();
                this.game.scrollScreen();
                let w = 0;
                let h = 0;
                if (this.selectedObject instanceof Sprite) {
                    w = this.selectedObject.image.width;
                    h = this.selectedObject.image.height;
                } else if (this.selectedObject instanceof Structure) {
                    w = this.selectedObject.w;
                    h = this.selectedObject.h;
                }
                this.game.ctx.fillStyle = "rgba(255, 0, 255, 0.25)";
                this.game.ctx.fillRect(
                    this.selectedObject.x - this.game.scrollX,
                    this.game.ctx.canvas.height - this.selectedObject.y - h + this.game.scrollY,
                    w, h);
            } else {
                this.scrollScreen();
            }
        }
        private scrollScreen() {
            if (this.editorModeEnabled) {
                let scrollAmount = 20;
                if (MovingDirections.down in this.game.player.movingDirections) {
                    this.game.scrollY -= scrollAmount;
                } else if (MovingDirections.up in this.game.player.movingDirections) {
                    this.game.scrollY += scrollAmount;
                } else if (MovingDirections.left in this.game.player.movingDirections) {
                    this.game.scrollX -= scrollAmount;
                } else if (MovingDirections.right in this.game.player.movingDirections) {
                    this.game.scrollX += scrollAmount;
                }

                if (this.game.scrollX < 0) {
                    this.game.scrollX = 0;
                }
                if (this.game.scrollY < 0) {
                    this.game.scrollY = 0;
                }
            }
        }
        private moveObject() {
            if (this.editorModeEnabled) {
                if (typeof this.selectedObject != "undefined" && this.selectedObject != null) {
                    let moveAmount = 10;
                    if (MovingDirections.modifier in this.game.player.movingDirections) {
                        moveAmount = 1;
                    }
                    if (this.selectedObject instanceof Structure) {
                        if (this._moveObject(moveAmount)) {
                            this.updateEditorMenuStructurePos();
                        }
                    } else if (this.selectedObject instanceof Player) {
                        if(this._moveObject(moveAmount)) {
                            this.selectedObject.xInitial = this.selectedObject.x;
                            this.selectedObject.yInitial = this.selectedObject.y;
                            this.updateEditorMenuPlayer();
                        }
                    } else if (this.selectedObject instanceof Sprite) {
                        if(this._moveObject(moveAmount)) {
                            this.selectedObject.xInitial = this.selectedObject.x;
                            this.selectedObject.yInitial = this.selectedObject.y;
                            this.updateEditorMenuSpritePos()
                        }
                    }
                }
            }
        }
        private _moveObject(moveAmount: number) {
            let changed = false;
            if (typeof this.selectedObject != "undefined" && this.selectedObject != null) {
                if (MovingDirections.down in this.game.player.movingDirections) { this.selectedObject.y -= moveAmount; changed = true; }
                if (MovingDirections.up in this.game.player.movingDirections) { this.selectedObject.y += moveAmount; changed = true; }
                if (MovingDirections.left in this.game.player.movingDirections) { this.selectedObject.x -= moveAmount; changed = true; }
                if (MovingDirections.right in this.game.player.movingDirections) { this.selectedObject.x += moveAmount; changed = true; }

                if (this.selectedObject.x < 0) { this.selectedObject.x = 0; }
                if (this.selectedObject.y < 0) { this.selectedObject.y = 0; }
            }
            return changed;
        }
        selectObjectByPos(xRelative: number, yRelative: number) {
            let previousSelectedObject = this.selectedObject;
            let x = this.game.scrollX + xRelative;
            let y = this.game.ctx.canvas.height - (this.game.scrollY + yRelative);
            for (let structure of this.game.structures) {
                if (structure.x < x && structure.x + structure.w > x &&
                    structure.y < y && structure.y + structure.h > y) {
                    this.selectedObject = structure;
                }
            }
            for (let sprite of this.game.sprites) {
                if (sprite.x < x && sprite.x + sprite.image.width > x &&
                    sprite.y < y && sprite.y + sprite.image.height > y) {
                    this.selectedObject = sprite;
                }
            }
            if (this.game.player.x < x && this.game.player.x + this.game.player.image.width > x &&
                this.game.player.y < y && this.game.player.y + this.game.player.image.height > y) {
                this.selectedObject = this.game.player;
            }

            if (this.selectedObject == previousSelectedObject) {
                this.selectedObject = null;
            }
            this.switchEditorMenu();
        }
        selectSprite(index: number) {
            let previousSelectedObject = this.selectedObject;

            this.selectedObject = this.game.sprites[index];

            if (this.selectedObject == previousSelectedObject) {
                this.selectedObject = null;
            }
            this.switchEditorMenu();
        }
        selectStructure(index: number) {
            let previousSelectedObject = this.selectedObject;

            this.selectedObject = this.game.structures[index];

            if (this.selectedObject == previousSelectedObject) {
                this.selectedObject = null;
            }
            this.switchEditorMenu();
        }
        selectPlayer() {
            let previousSelectedObject = this.selectedObject;

            this.selectedObject = this.game.player;

            if (this.selectedObject == previousSelectedObject) {
                this.selectedObject = null;
            }
            this.switchEditorMenu();
        }
        removeSprite(index: number) {
            this.game.sprites = this.game.sprites.filter((v, i) => { return i != index });
            this.updateList();
        }
        removeStructure(index: number) {
            this.game.structures = this.game.structures.filter((v, i) => { return i != index });
            this.updateList();
        }
    }
}