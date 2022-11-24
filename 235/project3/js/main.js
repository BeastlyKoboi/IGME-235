"use strict";
const app = new PIXI.Application({
    width: 800,
    height: 600
});
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// Disable interpolation when scaling, will make texture be pixelated
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

// pre-load the images
app.loader.
    add([
        "media/Cardback.png",
        "media/Card.png",
        "media/Card1.png",
        "media/Card2.png",
        "media/Card3.png",
        "media/Card4.png",
        "media/Card5.png",
        "media/Card6.png",
        "media/Card7.png",
        "media/Card8.png",
        "media/Background.png"
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();


// aliases
let stage;

// game variables
let startScene;
let gameScene;
let gameOverScene;
let gameOverScoreLabel;

let cards = [];
let cardsGrid = [];
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;

let backgroundSprite;
let cardsSelected = [];
let cardsFlipping = false;
let cardDefaultFront = app.loader.resources["media/Card.png"];

function setup() {
    stage = app.stage;
    // #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // #4 - Create labels for all 3 scenes 
    createLabelsAndButtons();

    // // #5 - Create ship
    // ship = new Ship();
    // gameScene.addChild(ship);


    // #8 - Start update loop
    app.ticker.add(gameLoop);

    // Now our `startScene` is visible
    // Clicking the button calls startGame()
}

function createLabelsAndButtons() {
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 48,
        fontFamily: "Arial"
    });

    // 1 - set up 'startScene'
    // 1A - make top start label 
    let startLabel1 = new PIXI.Text("A Fine Match!");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
        fontFamily: "PirataOne",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel1.x = sceneWidth / 2 - startLabel1.width / 2;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    // 1C - make start game button
    let startButton = new PIXI.Text("Play");
    startButton.style = buttonStyle;
    startButton.x = sceneWidth / 2 - startButton.width / 2;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);  // startGame is a function reference
    startButton.on("pointerover", e => e.target.alpha = 0.7); // concise arrow function with no brackets
    startButton.on("pointerout", e => e.currentTarget.alpha = 1.0); // ditto
    startScene.addChild(startButton);
}


function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    // .. more to come

    levelNum = 1;
    score = 0;
    life = 100;


    loadLevel();

}

function gameLoop() {
    if (paused) return; // keep this commented out for now

    // #1 - Calculate "delta time"
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;

    // #2 - Move Ship
    let mousePosition = app.renderer.plugins.interaction.mouse.global;
    // ship.position = mousePosition;

    if (cardsFlipping) {
        cardsSelected.forEach(element => {
            cardsFlipping = element.flip(dt);
        });

        if (!cardsFlipping) {
            if (cardsSelected[0].matched) {
                gameScene.removeChild(cardsSelected[0]);
                gameScene.removeChild(cardsSelected[1]);
                cardsGrid[cardsSelected[0].gridRow, cardsSelected[0].gridCol] = null;
                cardsGrid[cardsSelected[1].gridRow, cardsSelected[1].gridCol] = null;
            }
            cardsSelected = [];
        }
        
    }

    // #7 - Is game over?
    if (life <= 0) {
        // end();
        return; // return here so we skip #8 below
    }

}

function createCardPair(cardFront = cardDefaultFront) {
    let card1 = new Card(cardFront);
    card1.interactive = true;
    card1.buttonMode = true;
    card1.on("click", flipCard);
    cards.push(card1);
    gameScene.addChild(card1);

    let card2 = new Card(cardFront);
    card2.interactive = true;
    card2.buttonMode = true;
    card2.on("click", flipCard);
    cards.push(card2);
    gameScene.addChild(card2);
}

function flipCard(e) {
    if (!cardsFlipping) {

        if (cardsSelected.length == 1 && e.target != cardsSelected[0]) {
            cardsSelected.push(e.target);
            cardsFlipping = true;
            if (cardsSelected[0].frontTexture == cardsSelected[1].frontTexture) {
                cardsSelected[0].matched = true;
                cardsSelected[1].matched = true; 
            }
            
        }
        if (cardsSelected.length == 0) {
            cardsSelected.push(e.target);
        }
    }
}

function loadLevel() {

    backgroundSprite = PIXI.Sprite.from(app.loader.resources["media/Background.png"].texture);
    gameScene.addChild(backgroundSprite);

    for (let i = 0; i < 8; i++) {
        let cardtexture = app.loader.resources["media/Card" + (i + 1) + ".png"];
        createCardPair(cardtexture);
    }

    let gridColumns = 8;
    let gridRows = 2;
    let cardX = 80;
    let cardY = 112;
    let offsetX = cardX / 2  * Card.defaultScale;
    let offsetY = cardY / 2 * Card.defaultScale;
    let gap = 20;

    for (let row = 0; row < gridRows; row++) {
        let cardsInRow = [];

        for (let col = 0; col < gridColumns; col++) {
            let randCardIndex = Math.floor(cards.length * Math.random());

            // if exists
            if (cards[randCardIndex]) {
                cardsInRow.push(cards[randCardIndex]);

                cards[randCardIndex].x = offsetX + col * (cardX + gap);
                cards[randCardIndex].y = offsetY + row * (cardY + gap);

                cards[randCardIndex].gridCol = col; 
                cards[randCardIndex].gridRow = row;

                cards.splice(randCardIndex, 1);
            }
            
        }

        cardsGrid.push(cardsInRow);
    }



    paused = false;
}


