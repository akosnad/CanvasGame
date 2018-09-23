namespace CanvasGame {
    export class Debug {
        public static debugInfoEnabled = false;
        private static em = 12;
        private static colW = 1;
        static calcEm(w: number, h: number) {
            this.em = w / 2 / 80
            this.colW = w / 10;
        }
        static displayDebugInfo(game: Game, delta: number) {
            if (this.debugInfoEnabled) {
                Debug.drawDebugText(game, delta * 1000);
                for (let structure of game.structures) {
                    Debug.drawStructureHitbox(game.ctx, structure, "rgba(255, 255, 0, 0.25)", game.scrollX, game.scrollY);
                }
                for (let sprite of game.sprites) {
                    Debug.drawSpriteHitbox(game.ctx, sprite, "rgba(0, 255, 0, 0.25)", game.scrollX, game.scrollY);
                }
                for (let player of otherPlayers) {
                    if (player.levelId == game.level.id) {
                        Debug.drawSpriteHitbox(game.ctx, player, "rgba(0, 0, 255, 0.25)", game.scrollX, game.scrollY);
                        Debug.drawPlayerName(game.ctx, player.x, player.y, player.image.height, player.name);
                    }
                }
                Debug.drawSpriteHitbox(game.ctx, game.player, "rgba(255, 0, 0, 0.25)", game.scrollX, game.scrollY);
                Debug.drawPointer(game.ctx, game.mouseX, game.mouseY);
            }
        }
        private static drawDebugText(game: Game, timeDelta: number) {
            let font = `${this.em}px Roboto`;

            game.ctx.fillStyle = "#FFFFFF";
            game.ctx.font = font;
            game.ctx.fillText("Canvas Game", this.colW * 9, game.ctx.canvas.height - (2 * this.em));
            game.ctx.fillText("Made by Ákos Nádudvari", this.colW * 9, game.ctx.canvas.height - this.em);

            game.ctx.fillText("x", 0, this.em * 2);
            game.ctx.fillText("y", 0, this.em * 3);

            game.ctx.fillText("absolute pos", this.em, this.em);
            game.ctx.fillText(game.player.x.toString(), this.em, this.em * 2);
            game.ctx.fillText(game.player.y.toString(), this.em, this.em * 3);
            game.ctx.fillText("scroll", this.colW, this.em);
            game.ctx.fillText(game.scrollX.toString(), this.colW, this.em * 2);
            game.ctx.fillText(game.scrollY.toString(), this.colW, this.em * 3);
            game.ctx.fillText("relative pos", this.colW * 2, this.em);
            game.ctx.fillText((game.player.x - game.scrollX).toString(), this.colW * 2, this.em * 2);
            game.ctx.fillText((game.player.y - game.scrollY).toString(), this.colW * 2, this.em * 3);
            game.ctx.fillText("velocity", this.colW * 3, this.em);
            game.ctx.fillText(game.player.xVelocity.toString(), this.colW * 3, this.em * 2);
            game.ctx.fillText(game.player.yVelocity.toString(), this.colW * 3, this.em * 3);
            game.ctx.fillText("screen", this.colW * 4, this.em);
            game.ctx.fillText(game.ctx.canvas.width.toString(), this.colW * 4, this.em * 2);
            game.ctx.fillText(game.ctx.canvas.height.toString(), this.colW * 4, this.em * 3);
            game.ctx.fillText("frametime", this.colW * 5, this.em);
            game.ctx.fillText(timeDelta.toString(), this.colW * 5, this.em * 2);

            game.ctx.fillStyle = "rgb(255, 0, 0)";
            game.ctx.fillRect(0, this.em * 5, this.em, this.em);
            game.ctx.fillStyle = "#FFFFFF";
            game.ctx.font = font;
            game.ctx.fillText(": Player sprite's hitbox", this.em + this.em * 0.33, this.em * 6);

            game.ctx.fillStyle = "rgb(0, 255, 0)";
            game.ctx.fillRect(0, this.em * 6, this.em, this.em);
            game.ctx.fillStyle = "#FFFFFF";
            game.ctx.font = font;
            game.ctx.fillText(": Game sprites' hitbox", this.em + this.em * 0.33, this.em * 7);

            game.ctx.fillStyle = "rgb(0, 0, 255)";
            game.ctx.fillRect(0, this.em * 7, this.em, this.em);
            game.ctx.fillStyle = "#FFFFFF";
            game.ctx.font = font;
            game.ctx.fillText(": Other players' hitbox", this.em + this.em * 0.33, this.em * 8);

            game.ctx.fillStyle = "rgb(255, 255, 0)";
            game.ctx.fillRect(0, this.em * 8, this.em, this.em);
            game.ctx.fillStyle = "#FFFFFF";
            game.ctx.font = font;
            game.ctx.fillText(": Structures' hitbox", this.em + this.em * 0.33, this.em * 9);

            game.ctx.fillText("level", this.colW, this.em * 5);
            game.ctx.fillText(game.level.name, this.colW, this.em * 6);

            game.ctx.fillText("level source", this.colW * 2, this.em * 5);
            game.ctx.fillText(game.level.sourceFile, this.colW * 2, this.em * 6);

            game.ctx.fillText("level id", this.colW * 3, this.em * 5);
            game.ctx.fillText(game.level.id.toString(), this.colW * 3, this.em * 6);

            game.ctx.fillText("sprites", this.colW, this.em * 8);
            game.ctx.fillText(game.sprites.length.toString(), this.colW, this.em * 9);

            game.ctx.fillText("structures", this.colW * 2, this.em * 8);
            game.ctx.fillText(game.structures.length.toString(), this.colW * 2, this.em * 9);

            game.ctx.fillText("other players", this.colW * 3, this.em * 8);
            game.ctx.fillText(otherPlayers.length.toString(), this.colW * 3, this.em * 9);
        }
        private static drawStructureHitbox(ctx: CanvasRenderingContext2D, structure: Structure, color: string, offsetX: number, offsetY: number) {
            ctx.fillStyle = color;
            ctx.fillRect(
                structure.x - offsetX,
                ctx.canvas.height - structure.y - structure.h + offsetY,
                structure.w,
                structure.h);
        }
        private static drawSpriteHitbox(ctx: CanvasRenderingContext2D, sprite: Sprite, color: string, offsetX: number, offsetY: number) {
            ctx.fillStyle = color;
            ctx.fillRect(
                sprite.x - offsetX,
                ctx.canvas.height - sprite.y - sprite.image.height + offsetY,
                sprite.image.width,
                sprite.image.height);
        }
        private static drawPointer(ctx: CanvasRenderingContext2D, x: number, y: number) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(x - 2, y - 2, 4, 4);
        }
        private static drawPlayerName(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, name: string) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(name, x, ctx.canvas.height - y - h)
        }
        public static log(message?: any, ...optionalParams: any[]) {
            if (Debug.debugInfoEnabled) {
                console.debug(message, optionalParams);
            }
        }
    }
}