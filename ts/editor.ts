namespace CanvasGame {
    export class LevelEditor {
        static editorModeEnabled = false;
        static loop(ctx: CanvasRenderingContext2D, timeDelta: number, mouseX: number, mouseY: number) {
            if (LevelEditor.editorModeEnabled) {
                ctx.fillStyle = "#000000";
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
                ctx.font = "24px Roboto";
                ctx.fillText("Editor mode is work in progress!!!", 0, 24);
            }
        }
    }
}