namespace CanvasGame {
    export class LevelLoader {
        static load(sourceFileURL: string) {
            Debug.log("loading level: ", sourceFileURL);
            let levelData: Level = new Level();
            $.ajax({
                async: false,
                type: 'GET',
                url: sourceFileURL,
                success: (data) => {
                    levelData = <Level>data;
                },
                error: (e) => {

                }
            });
            levelData.sourceFile = sourceFileURL;
            Debug.log("Level Loaded: ", levelData);
            return levelData;
        }
        static getList() {
            let levels = new LevelList();
            $.ajax({
                async: false,
                type: 'GET',
                url: "/levels.json",
                success: (data) => {
                    levels = <LevelList>data;
                }
            });
            Debug.log("Got level list: ", levels);
            return levels;
        }
    }

    export class Level {
        sprites = new Array<LevelSprite>();
        id = 0;
        playerXInitial = 0;
        playerYInitial = 0;
        playerImageSource = "";
        sourceFile = "";
        name = "";
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

    interface LevelDescription {
        name: string;
        path: string;
    }
    export class LevelList {
        levels = new Array<LevelDescription>();
    }
}