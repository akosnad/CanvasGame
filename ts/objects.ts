class Sprite {
    x = 0;
    y = 0;
    hitboxWidth = 0;
    hitboxHeight = 0;
    image = document.createElement("img");
    imageReady = false;

    constructor(imageSource: string) {
        this.image.src = imageSource;
        var self = this;
        this.image.onload = (e) => {
            self.imageLoaded(e)
        };
    }
    imageLoaded(e: Event) {
        this.imageReady = true;
        this.hitboxHeight = this.image.height;
        this.hitboxWidth = this.image.width;
    }
}

class LivingSprite extends Sprite {
    xVelocity = 0;
    yVelocity = 0;
    xVelocityMax = 255;
    xVelocityIncrease = 30;
    xVelocityDecrease = 15;
    gravity = 15;
    jumpStrenght = 500;
}

enum GameKeys {
    left = 37,
    right = 39,
    up = 38,
    down = 40
}