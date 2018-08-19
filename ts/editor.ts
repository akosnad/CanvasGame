namespace CanvasGame {
    export class LevelEditor {
        editorModeEnabled = false;
        selectedObject: Sprite | Structure | Player | undefined | null;
        game: Game;
        // Level Editor menu
        private LEM: HTMLElement;
        private LEMGeneral: HTMLElement;
        private LEMGeneralLevelId: HTMLElement;
        private LEMGeneralLevelName: HTMLElement;
        private LEMGeneralBgUrl: HTMLElement;

        private LEMSprite: HTMLElement;
        private LEMSpriteImgUrl: HTMLElement;
        private LEMSpriteInitialPosX: HTMLElement;
        private LEMSpriteInitialPosY: HTMLElement;
        private LEMSpriteSolid: HTMLElement;

        private LEMStructure: HTMLElement;
        private LEMStructureImgURL: HTMLElement;
        private LEMStructureSolid: HTMLElement;
        private LEMStructurePosX: HTMLElement;
        private LEMStructurePosY: HTMLElement;
        private LEMStructureWidth: HTMLElement;
        private LEMStructureHeight: HTMLElement;

        private LEMPlayer: HTMLElement;
        private LEMPlayerImgURL: HTMLElement;
        private LEMPlayerInitialPosX: HTMLElement;
        private LEMPlayerInitialPosY: HTMLElement;

        constructor(game: Game) {
            this.game = game;
            this.LEM = <HTMLElement>document.getElementById("level-editor-menu");
            this.LEMGeneral = <HTMLElement>document.getElementById("level-editor-general");
            this.LEMGeneralLevelId = <HTMLElement>document.getElementById("level-id-input");
            this.LEMGeneralLevelName = <HTMLElement>document.getElementById("level-name-input");
            this.LEMGeneralBgUrl = <HTMLElement>document.getElementById("level-bg-input");

            this.LEMSprite = <HTMLElement>document.getElementById("level-editor-sprite");
            this.LEMSpriteImgUrl = <HTMLElement>document.getElementById("sprite-img-input");
            this.LEMSpriteInitialPosX = <HTMLElement>document.getElementById("sprite-initial-x-input");
            this.LEMSpriteInitialPosY = <HTMLElement>document.getElementById("sprite-initial-y-input");
            this.LEMSpriteSolid = <HTMLElement>document.getElementById("sprite-solid-input");

            this.LEMStructure = <HTMLElement>document.getElementById("level-editor-structure");
            this.LEMStructureImgURL = <HTMLElement>document.getElementById("structure-img-input");
            this.LEMStructureSolid = <HTMLElement>document.getElementById("structure-solid-input");
            this.LEMStructurePosX = <HTMLElement>document.getElementById("structure-pos-x-input");
            this.LEMStructurePosY = <HTMLElement>document.getElementById("structure-pos-y-input");
            this.LEMStructureWidth = <HTMLElement>document.getElementById("structure-wh-w-input");
            this.LEMStructureHeight = <HTMLElement>document.getElementById("structure-wh-h-input");

            this.LEMPlayer = <HTMLElement>document.getElementById("level-editor-player");
            this.LEMPlayerImgURL = <HTMLElement>document.getElementById("player-img-input");
            this.LEMPlayerInitialPosX = <HTMLElement>document.getElementById("player-initial-x-input");
            this.LEMPlayerInitialPosY = <HTMLElement>document.getElementById("player-initial-y-input");

            this.switchEditorMenu();

            var self = this;
            this.game.ctx.canvas.addEventListener("click", (e) => {
                self.selectObject(e.x, e.y);
            });
        }
        enableEditorMode() {
            this.editorModeEnabled = true;
            $(this.LEM).show();
        }
        disableEditorMode() {
            this.editorModeEnabled = false;
            $(this.LEM).hide();
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
        private updateEditorMenuPlayer() {
            if(this.selectedObject instanceof Player) {
            $(this.LEMPlayerImgURL).val(this.selectedObject.imageSource);
            $(this.LEMPlayerInitialPosX).val(this.selectedObject.xInitial);
            $(this.LEMPlayerInitialPosY).val(this.selectedObject.yInitial);
            }
        }
        private updateEditorMenuSprite() {
            if (this.selectedObject instanceof Sprite) {
                $(this.LEMSpriteImgUrl).val(this.selectedObject.imageSource);
                $(this.LEMSpriteInitialPosX).val(this.selectedObject.xInitial);
                $(this.LEMSpriteInitialPosY).val(this.selectedObject.yInitial);
                $(this.LEMSpriteSolid).prop('checked', this.selectedObject.solid);
            }
        }
        private updateEditorMenuStructure() {
            if(this.selectedObject instanceof Structure) {
                $(this.LEMStructureImgURL).val(this.selectedObject.imageSource);
                $(this.LEMStructureSolid).prop('checked', this.selectedObject.solid);
                $(this.LEMStructurePosX).val(this.selectedObject.x);
                $(this.LEMStructurePosY).val(this.selectedObject.y);
                $(this.LEMStructureWidth).val(this.selectedObject.w);
                $(this.LEMStructureHeight).val(this.selectedObject.h);
            }
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