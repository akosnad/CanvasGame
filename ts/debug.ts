namespace CanvasGame {
    export class Debug {
        public static debugInfoEnabled = false;
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
            game.ctx.fillStyle = "#FFFFFF";
            game.ctx.font = "12px Roboto";
            game.ctx.fillText("Canvas Game", game.ctx.canvas.width - 88, game.ctx.canvas.height - 24);
            game.ctx.fillText("Made by Ákos Nádudvari", game.ctx.canvas.width - 150, game.ctx.canvas.height - 12);

            game.ctx.fillText("x", 0, 24);
            game.ctx.fillText("y", 0, 36);

            game.ctx.fillText("absolute pos", 20, 12);
            game.ctx.fillText(game.player.x.toString(), 20, 24);
            game.ctx.fillText(game.player.y.toString(), 20, 36);
            game.ctx.fillText("scroll", 220, 12);
            game.ctx.fillText(game.scrollX.toString(), 220, 24);
            game.ctx.fillText(game.scrollY.toString(), 220, 36);
            game.ctx.fillText("relative pos", 420, 12);
            game.ctx.fillText((game.player.x - scrollX).toString(), 420, 24);
            game.ctx.fillText((game.player.y - scrollY).toString(), 420, 36);
            game.ctx.fillText("velocity", 620, 12);
            game.ctx.fillText(game.player.xVelocity.toString(), 620, 24);
            game.ctx.fillText(game.player.yVelocity.toString(), 620, 36);
            game.ctx.fillText("screen", 820, 12);
            game.ctx.fillText(game.ctx.canvas.width.toString(), 820, 24);
            game.ctx.fillText(game.ctx.canvas.height.toString(), 820, 36);
            game.ctx.fillText("frametime", 920, 12);
            game.ctx.fillText(timeDelta.toString(), 920, 24);

            game.ctx.fillStyle = "rgb(255, 0, 0)";
            game.ctx.fillRect(0, 52, 12, 12);
            game.ctx.fillStyle = "#FFFFFF";
            game.ctx.font = "12px Roboto";
            game.ctx.fillText(": Player sprite's hitbox", 16, 62);

            game.ctx.fillStyle = "rgb(0, 255, 0)";
            game.ctx.fillRect(0, 76, 12, 12);
            game.ctx.fillStyle = "#FFFFFF";
            game.ctx.font = "12px Roboto";
            game.ctx.fillText(": Game sprites' hitbox", 16, 86);

            game.ctx.fillStyle = "rgb(0, 0, 255)";
            game.ctx.fillRect(0, 100, 12, 12);
            game.ctx.fillStyle = "#FFFFFF";
            game.ctx.font = "12px Roboto";
            game.ctx.fillText(": Other players' hitbox", 16, 110);

            game.ctx.fillStyle = "rgb(255, 255, 0)";
            game.ctx.fillRect(0, 124, 12, 12);
            game.ctx.fillStyle = "#FFFFFF";
            game.ctx.font = "12px Roboto";
            game.ctx.fillText(": Structures' hitbox", 16, 134);

            game.ctx.fillText("level", 220, 62);
            game.ctx.fillText(game.level.name, 220, 74);

            game.ctx.fillText("level source", 420, 62);
            game.ctx.fillText(game.level.sourceFile, 420, 74);

            game.ctx.fillText("level id", 620, 62);
            game.ctx.fillText(game.level.id.toString(), 620, 74);

            game.ctx.fillText("sprites", 220, 122);
            game.ctx.fillText(game.sprites.length.toString(), 220, 134);

            game.ctx.fillText("structures", 420, 122);
            game.ctx.fillText(game.structures.length.toString(), 420, 134);

            game.ctx.fillText("other players", 620, 122);
            game.ctx.fillText(otherPlayers.length.toString(), 620, 134);
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