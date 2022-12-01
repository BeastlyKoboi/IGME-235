class Card extends PIXI.Sprite {
    static speed = 10;
    static defaultScale = 1;
    static timeBuffer = 1;

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
        this.pairTimePaused = 0;
    }

    flip(dt = 1 / 60) {
        let newXScale;
        let newYScale;

        // Flips Cardback to Card, and pauses until time buffer is reached
        if (this.timePaused < Card.timeBuffer) {
            // 1st Cardback Texture width scales down until 0
            if (!this.textureSwitched) {
                return (this.#scaleXDown(this.frontTexture.texture, dt));
            }
            // 2nd Card Texture width scales up until 1
            else {
                let oneReached = this.#scaleXUp(dt);

                if (oneReached) {
                    this.timePaused += dt;
                }

                return true;
            }
        }
        // Time buffer has been reached and card was matched, so remove card 
        else if (this.pairTimePaused > Card.timeBuffer) {
            
            if (this.matched) {
                // When scaled to zero, returns false and signals end animation
                return (this.#scaleAllDown(dt));
            }
            // Time buffer has been reached and card was not matched, so flip Card to Cardback
            else {
                // 3rd Card Texture width scales back down until 0
                if (this.textureSwitched) {
                    return (this.#scaleXDown(app.loader.resources["media/Cardback.png"].texture, dt));
                }
                // 4th Cardback Texture width scales back up until 1
                else {
                    let oneReached = this.#scaleXUp();

                    if (oneReached) {
                        this.timePaused = 0;
                        return false; // animation has ended
                    }

                    return true; // animation has not ended
                }
            }
        }
        return true;
    }

    #scaleXDown(newTexture = app.loader.resources["media/Cardback.png"].texture, dt = 1 / 60) {
        let newXScale = (this.scale.x / Card.defaultScale) - Card.speed * dt;

        if (newXScale <= 0) {
            this.textureSwitched = !this.textureSwitched;
            this.texture = newTexture;
        }

        this.scale.set(newXScale * Card.defaultScale, Card.defaultScale);
        return true;
    }

    #scaleXUp(dt = 1 / 60) {
        let oneHasBeenReached = false;
        let newXScale = (this.scale.x / Card.defaultScale) + Card.speed * dt;

        if (newXScale > 1) {
            newXScale = 1;
            oneHasBeenReached = true;
        }

        this.scale.set(newXScale * Card.defaultScale, Card.defaultScale);
        return oneHasBeenReached;
    }

    #scaleAllDown(dt = 1 / 60) {
        let newXScale = (this.scale.x / Card.defaultScale) - Card.speed * dt;
        let newYScale = (this.scale.y / Card.defaultScale) - Card.speed * dt;

        if (newXScale <= 0) {
            this.scale.set(0, 0);
            return false;
        }

        this.scale.set(newXScale * Card.defaultScale, newYScale * Card.defaultScale);
        return true;
    }
}
