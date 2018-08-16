namespace CanvasGame {
    export class LevelLoader {
        static load(sourceFileURL: string) {
            let levelData: Level = new Level();
            $.ajax({
                async: false,
                type: 'GET',
                url: sourceFileURL,
                success: function(data) {
                    levelData = <Level> data;
                }
            });
            levelData.sourceFile = sourceFileURL;
            return levelData;
        }
    }

    export class Level {
        sprites = new Array<LevelSprite>();
        id = 0;
        playerXInitial = 0;
        playerYInitial = 0;
        playerImageSource = "";
        sourceFile = "";
    }

    class LevelSprite {
        xInitial: number;
        yInitial: number;
        hitboxWidth: number;
        hitboxHeight: number;
        solid: boolean;
        imageSource: string;
        constructor(sprite: Sprite) {
            this.xInitial = sprite.xInitial;
            this.yInitial = sprite.yInitial;
            this.solid = sprite.solid;
            this.imageSource = sprite.imageSource;
            this.hitboxWidth = sprite.hitboxWidth;
            this.hitboxHeight = sprite.hitboxHeight;
        }
    }
}