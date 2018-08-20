namespace CanvasGame {
    export class LevelEditor {
        editorModeEnabled = false;
        selectedObject: Sprite | Structure | Player | undefined | null;
        game: Game;

        // Level Editor menu elements
        private LEM = <HTMLElement>document.getElementById("level-editor-menu");

        private LEMExport = <HTMLElement>document.getElementById("editor-export");

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
        private LEMPlayerImgURL = <HTMLElement>document.getElementById("player-img-input");
        private LEMPlayerInitialPosX = <HTMLElement>document.getElementById("player-initial-x-input");
        private LEMPlayerInitialPosY = <HTMLElement>document.getElementById("player-initial-y-input");

        constructor(game: Game) {
            this.game = game;

            this.switchEditorMenu();

            var self = this;
            this.game.ctx.canvas.addEventListener("click", (e) => {
                self.selectObject(e.x, e.y);
            });

            this.LEMExport.addEventListener("click", (e) => { self.exportLevel(); });

            this.LEMGeneralApply.addEventListener("click", (e) => { self.applyEditorMenuGeneral(); });
            this.LEMGeneralReset.addEventListener("click", (e) => { self.updateEditorMenuGeneral(); });
            this.LEMPlayerApply.addEventListener("click", (e) => { self.applyEditorMenuPlayer(); });
            this.LEMPlayerReset.addEventListener("click", (e) => { self.updateEditorMenuPlayer(); });
            this.LEMSpriteApply.addEventListener("click", (e) => { self.applyEditorMenuSprite(); });
            this.LEMSpriteReset.addEventListener("click", (e) => { self.updateEditorMenuSprite(); });
            this.LEMStructureApply.addEventListener("click", (e) => { self.applyEditorMenuStructure(); });
            this.LEMStructureReset.addEventListener("click", (e) => { self.updateEditorMenuStructure(); });
        }
        enableEditorMode() {
            this.editorModeEnabled = true;
            $(this.LEM).show();
            this.game.reset();
        }
        disableEditorMode() {
            this.editorModeEnabled = false;
            $(this.LEM).hide();
            this.game.reset();
        }
        private exportLevel() {
            let level = new Level();
            level = this.game.level;
            level.sprites = new Array<LevelSprite>();
            level.structures = new Array<LevelStructure>();
            for(let sprite of this.game.sprites) {
                level.sprites.push(new LevelSprite(sprite));
            }
            for(let structure of this.game.structures) {
                level.structures.push(new LevelStructure(structure));
            }
            LevelLoader.export(level);
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
        }
        private updateEditorMenuPlayer() {
            if (this.selectedObject instanceof Player) {
                $(this.LEMPlayerImgURL).val(this.selectedObject.imageSource);
                $(this.LEMPlayerInitialPosX).val(this.selectedObject.xInitial);
                $(this.LEMPlayerInitialPosY).val(this.selectedObject.yInitial);
            }
        }
        private applyEditorMenuPlayer() {
            if (this.selectedObject instanceof Player) {
                this.selectedObject.imageSource = <string>$(this.LEMPlayerImgURL).val();
                this.game.level.playerImageSource = <string>$(this.LEMPlayerImgURL).val();
                this.selectedObject.xInitial = parseInt(<string>$(this.LEMPlayerInitialPosX).val());
                this.game.level.playerXInitial = parseInt(<string>$(this.LEMPlayerInitialPosX).val());
                this.selectedObject.yInitial = parseInt(<string>$(this.LEMPlayerInitialPosY).val());
                this.game.level.playerYInitial = parseInt(<string>$(this.LEMPlayerInitialPosY).val());
                this.game.player = this.selectedObject;
            }
            this.game.reset();
        }
        private updateEditorMenuSprite() {
            if (this.selectedObject instanceof Sprite) {
                $(this.LEMSpriteImgUrl).val(this.selectedObject.imageSource);
                $(this.LEMSpriteInitialPosX).val(this.selectedObject.xInitial);
                $(this.LEMSpriteInitialPosY).val(this.selectedObject.yInitial);
                $(this.LEMSpriteSolid).prop('checked', this.selectedObject.solid);
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
        }
        loop() {
            this.scrollScreen();
            if (typeof this.selectedObject != "undefined" && this.selectedObject != null) {
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
        selectObject(xRelative: number, yRelative: number) {
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
    }
}