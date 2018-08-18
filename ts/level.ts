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
        structures = new Array<LevelStructure>();
        id = 0;
        playerXInitial = 0;
        playerYInitial = 0;
        playerImageSource = "";
        backgroundImageSource = "";
        sourceFile = "";
        name = "";
    }

    class LevelSprite {
        xInitial: number;
        yInitial: number;
        solid: boolean;
        imageSource: string;
        constructor(sprite: Sprite) {
            this.xInitial = sprite.xInitial;
            this.yInitial = sprite.yInitial;
            this.solid = sprite.solid;
            this.imageSource = sprite.imageSource;
        }
    }

    class LevelStructure {
        x: number;
        y: number;
        w: number;
        h: number;
        solid: boolean;
        imageSource: string;
        constructor(structure: Structure) {
            this.x = structure.x;
            this.y = structure.y;
            this.w = structure.w;
            this.h = structure.h;
            this.solid = structure.solid;
            this.imageSource = structure.imageSource;
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