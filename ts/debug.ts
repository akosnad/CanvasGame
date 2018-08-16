namespace CanvasGame {
    export class Debug {
        public static debugInfoEnabled = false;
        static displayDebugInfo(game: Game, delta: number) {
            if (this.debugInfoEnabled) {
                Debug.drawDebugText(game.ctx, game.player, game.scrollX, game.scrollY, delta * 1000);
                for (let sprite of game.sprites) {
                    Debug.drawSpriteHitbox(game.ctx, sprite, "rgba(0, 255, 0, 0.25)", game.scrollX, game.scrollY);
                }
                for (let player of otherPlayers) {
                    Debug.drawSpriteHitbox(game.ctx, player, "rgba(0, 0, 255, 0.25)", game.scrollX, game.scrollY);
                }
                Debug.drawSpriteHitbox(game.ctx, game.player, "rgba(255, 0, 0, 0.25)", game.scrollX, game.scrollY);
                Debug.drawPointer(game.ctx, game.mouseX, game.mouseY);
            }
        }
        private static drawDebugText(ctx: CanvasRenderingContext2D, player: Player, scrollX: number, scrollY: number, timeDelta: number) {
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "12px Roboto";
            ctx.fillText("Canvas Game", ctx.canvas.width - 88, ctx.canvas.height - 24);
            ctx.fillText("Made by Ákos Nádudvari", ctx.canvas.width - 150, ctx.canvas.height - 12);

            ctx.fillText("x", 0, 24);
            ctx.fillText("y", 0, 36);

            ctx.fillText("absolute pos", 20, 12);
            ctx.fillText(player.x.toString(), 20, 24);
            ctx.fillText(player.y.toString(), 20, 36);
            ctx.fillText("scroll", 220, 12);
            ctx.fillText(scrollX.toString(), 220, 24);
            ctx.fillText(scrollY.toString(), 220, 36);
            ctx.fillText("relative pos", 420, 12);
            ctx.fillText((player.x - scrollX).toString(), 420, 24);
            ctx.fillText((player.y - scrollY).toString(), 420, 36);
            ctx.fillText("velocity", 620, 12);
            ctx.fillText(player.xVelocity.toString(), 620, 24);
            ctx.fillText(player.yVelocity.toString(), 620, 36);
            ctx.fillText("screen", 820, 12);
            ctx.fillText(ctx.canvas.width.toString(), 820, 24);
            ctx.fillText(ctx.canvas.height.toString(), 820, 36);
            ctx.fillText("frametime", 920, 12);
            ctx.fillText(timeDelta.toString(), 920, 24);

            ctx.fillStyle = "rgb(255, 0, 0)";
            ctx.fillRect(0, 52, 12, 12);
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "12px Roboto";
            ctx.fillText(": Player sprite's hitbox", 16, 62);

            ctx.fillStyle = "rgb(0, 255, 0)";
            ctx.fillRect(0, 76, 12, 12);
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "12px Roboto";
            ctx.fillText(": Game sprites' hitbox", 16, 86);

            ctx.fillStyle = "rgb(0, 0, 255)";
            ctx.fillRect(0, 100, 12, 12);
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "12px Roboto";
            ctx.fillText(": Other players' hitbox", 16, 110);

            ctx.fillText("level", 220, 62);
            ctx.fillText(game.level.sourceFile, 220, 74);

            ctx.fillText("level id", 420, 62);
            ctx.fillText(game.level.id.toString(), 420, 74);
        }
        private static drawSpriteHitbox(ctx: CanvasRenderingContext2D, sprite: Sprite, color: string, offsetX: number, offsetY: number) {
            ctx.fillStyle = color;
            ctx.fillRect(
                sprite.x - offsetX,
                ctx.canvas.height - sprite.y - sprite.hitboxHeight + offsetY,
                sprite.hitboxWidth,
                sprite.hitboxHeight);
        }
        private static drawPointer(ctx: CanvasRenderingContext2D, x:number, y:number) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(x - 2, y - 2, 4, 4);
        }
    }
}