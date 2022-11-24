class Card extends PIXI.Sprite {
    static speed = 10;
    static defaultScale = 1;
    static timeBuffer = .5;

    constructor(frontTexture) {
        super(app.loader.resources["media/Cardback.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(Card.defaultScale);
        this.x = 0;
        this.y = 0;
        this.frontTexture = frontTexture;
        this.textureSwitched = false;
        this.timePaused = 0;
        this.matched = false;
        this.gridCol = 0;
        this.gridRow = 0;
    }

    flip(dt = 1 / 60) {
        let newXScale;
        let newYScale;

        // Flips Cardback to Card, and pauses until time buffer is reached
        if (this.timePaused < Card.timeBuffer) {
            // 1st Cardback Texture width scales down until 0
            if (!this.textureSwitched) {
                newXScale = (this.scale.x / Card.defaultScale) - Card.speed * dt;

                if (newXScale <= 0) {
                    this.textureSwitched = true;
                    this.texture = this.frontTexture.texture;
                }

                this.scale.set(newXScale * Card.defaultScale, Card.defaultScale);
                return true;
            }
            // 2nd Card Texture width scales up until 1
            else {
                newXScale = (this.scale.x / Card.defaultScale) + Card.speed * dt;

                if (newXScale > 1) {
                    newXScale = 1;
                }
                if (newXScale == 1) {
                    this.timePaused += dt;
                }

                this.scale.set(newXScale * Card.defaultScale, Card.defaultScale);
                return true;
            }
        }
        // Time buffer has been reached and card was matched, so remove card and
        else if (this.matched) {
            newXScale = (this.scale.x / Card.defaultScale) - Card.speed * dt;
            newYScale = (this.scale.y / Card.defaultScale) - Card.speed * dt;

            if (newXScale <= 0) {
                this.scale.set(0, 0);
                return false;
            }

            this.scale.set(newXScale * Card.defaultScale, newYScale * Card.defaultScale);
            return true;
        }
        // Time buffer has been reached and card was not matched, so flip Card to Cardback
        else {
            // 3rd Card Texture width scales back down until 0
            if (this.textureSwitched) {
                newXScale = (this.scale.x / Card.defaultScale) - Card.speed * dt;

                if (newXScale <= 0) {
                    this.textureSwitched = false;
                    this.texture = app.loader.resources["media/Cardback.png"].texture;
                    this.scale.set(newXScale * Card.defaultScale, Card.defaultScale);
                }

                this.scale.set(newXScale * Card.defaultScale, Card.defaultScale);
                return true;
            }
            // 4th Cardback Texture width scales back up until 1
            else {
                newXScale = (this.scale.x / Card.defaultScale) + Card.speed * dt;

                if (newXScale > 1) {
                    newXScale = 1;
                    this.scale.set(Card.defaultScale, Card.defaultScale);
                    this.timePaused = 0;
                    return false;
                }

                this.scale.set(newXScale * Card.defaultScale, Card.defaultScale);
                return true;
            }
        }
    }
}
