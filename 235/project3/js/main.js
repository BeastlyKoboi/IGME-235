"use strict";
const app = new PIXI.Application({
    width: 1024,
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
        "media/Background.png",
        "media/heart.png"
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
let gameOverLabel;
let youWinLabel;
let backgroundSprite;

let cards = [];
let cardsGrid = [];
let gridColumns = 4;
let gridRows = 4;
let cardsLeft = 0;
let cardsSelected = [];
let cardsFlipping = false;
let cardDefaultFront = app.loader.resources["media/Card.png"];

const maxHearts = 3;
const maxDodge = 100;
let score = 0;
let currHearts = maxHearts;
let currDodge = maxDodge;
let heartTexture = app.loader.resources["media/heart.png"];
let heartSprites = [];
let currDodgeLabel;


let totalEnemyHearts = 6;
let levelEnemyHearts = 3;
let enemyHearts = totalEnemyHearts;
let enemyHeartSprites = [];
let enemyCooldown = 5;
let enemyCountdown = enemyCooldown;
let enemyCountdownLabel;

let levelNum = 1;
let paused = true;

function setup() {
    stage = app.stage;

    backgroundSprite = PIXI.Sprite.from(app.loader.resources["media/Background.png"].texture);
    stage.addChild(backgroundSprite);

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
    let labelStyleOne = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
        fontFamily: "PirataOne",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    let labelStyleTwo = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "PirataOne",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    let labelStyleThree = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 48,
        fontFamily: "Arial",
        stroke: 0xFF0000,
        strokeThickness: 3
    });

    // 1 - set up 'startScene'
    // 1A - make top start label 
    makeLabel(startScene, "A Fine Match", labelStyleOne, sceneWidth / 2, 120);

    // 1C - make start game button
    makeButton(startScene, startGame, "Play", buttonStyle, sceneWidth / 2, sceneHeight - 100);

    // Make UI for gameplay
    // Make UI Hearts for gameplay
    for (let i = 0; i < maxHearts; i++) {
        let heart = new PIXI.Sprite.from(app.loader.resources["media/heart.png"].texture);
        heart.scale.set(2);
        heart.x = 20 + heart.width * i;
        heart.y = 20;
        gameScene.addChild(heart);
        heartSprites.push(heart);
    }

    for (let i = 0; i < totalEnemyHearts; i++) {
        let heart = new PIXI.Sprite.from(app.loader.resources["media/heart.png"].texture);
        heart.scale.set(2);
        heart.x = sceneWidth - 20 - heart.width * (i + 1);
        if (i > 2)
            heart.x += heart.width * 3;

        heart.y = 20;
        if (i > 2)
            heart.y += heart.height;

        gameScene.addChild(heart);
        enemyHeartSprites.push(heart);
    }

    // Make label for dodge 
    currDodgeLabel = makeLabel(gameScene, currDodge + '%', labelStyleThree, sceneWidth / 8, sceneHeight / 2);

    // Make label for enemy countdown
    enemyCountdownLabel = makeLabel(gameScene, enemyCountdown + ' Secs', labelStyleThree, 8 * sceneWidth / 10, sceneHeight / 2);


    // 3 - set up `gameOverScene`
    // 3A - make game over text
    gameOverLabel = makeLabel(gameOverScene, "Game Over!", labelStyleOne, sceneWidth / 2, sceneHeight / 4);
    youWinLabel = makeLabel(gameOverScene, "You Win!", labelStyleOne, sceneWidth / 2, sceneHeight / 4);

    // Make play again button
    makeButton(gameOverScene, startGame, "Play Again?", buttonStyle, sceneWidth / 2, sceneHeight - 100);
}


function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    // .. more to come

    levelNum = 1;
    score = 0;


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
        if (cardsSelected.length == 2) {
            let card1Done = cardsSelected[0].flip(dt);
            let card2Done = cardsSelected[1].flip(dt);

            cardsSelected[0].pairTimePaused = cardsSelected[1].timePaused;
            cardsSelected[1].pairTimePaused = cardsSelected[0].timePaused;

            if (!card1Done && !card2Done) {

                if (cardsSelected[0].matched) {
                    cardsSelected[0].effect();
                    gameScene.removeChild(cardsSelected[0]);
                    gameScene.removeChild(cardsSelected[1]);
                    cardsGrid[cardsSelected[0].gridRow][cardsSelected[0].gridCol] = null;
                    cardsGrid[cardsSelected[1].gridRow][cardsSelected[1].gridCol] = null;
                    cardsLeft -= 2;

                    console.log(gameScene);
                    debugger;
                }

                cardsFlipping = false;
                cardsSelected = [];
            }
        }
        else {
            // possibly causes error where card stays on screen 
            cardsSelected[0].flip(dt);
        }
    }


    enemyCountdown -= dt;
    enemyCountdownLabel.text = Math.ceil(enemyCountdown) + ' Secs';

    if (enemyCountdown < 0) {
        enemyCountdown = enemyCooldown;
        enemyCountdownLabel.text = enemyCountdown;
        if (Math.random() * 100 > currDodge) {
            currHearts--;
            heartSprites[currHearts].visible = false;

        }
        else {
            currDodge *= .9;
            currDodgeLabel.text = Math.ceil(currDodge) + '%';
        }

    }

    // #7 - Is game over?
    if (currHearts <= 0) {

        end(false);
    }
    else if (cardsLeft == 0) {
        end(true);
    }

}

function createCardPair(cardFront = cardDefaultFront, effectNum = 1) {
    let sameCards = 2;
    let cardPair = [];

    for (let i = 0; i < sameCards; i++) {
        let card = new Card(cardFront);
        card.interactive = true;
        card.buttonMode = true;
        card.on("click", flipCard);
        cards.push(card);
        cardPair.push(card);
        gameScene.addChild(card);
        cardsLeft++;
    }

    switch (effectNum) {
        case 1:
        case 2:
            cardPair[0].effect = addHeart;
            cardPair[1].effect = addHeart;
            break;
        case 3:
        case 4:
            cardPair[0].effect = attackEnemy;
            cardPair[1].effect = attackEnemy;
            break;
        case 5:
        case 6:
            cardPair[0].effect = addDodge;
            cardPair[1].effect = addDodge;
            break;
        case 7:
        case 8:
            cardPair[0].effect = addCountdownTime;
            cardPair[1].effect = addCountdownTime;
            break;
    }
}

function flipCard(e) {

    if (cardsSelected.length == 2) {
        return;
    }
    if (cardsSelected.length == 1 && e.target != cardsSelected[0]) {
        cardsSelected.push(e.target);
        if (cardsSelected[0].frontTexture == cardsSelected[1].frontTexture) {
            cardsSelected[0].matched = true;
            cardsSelected[1].matched = true;
        }
        return;
    }
    if (cardsSelected.length == 0) {
        cardsSelected.push(e.target);
        cardsFlipping = true;
        return;
    }

}

function loadLevel() {
    let cardsPairs = gridColumns * gridRows / 2;

    for (let i = 0; i < cardsPairs; i++) {
        let cardtexture = app.loader.resources["media/Card" + (i + 1) + ".png"];
        createCardPair(cardtexture, i + 1);
    }

    cardsLeft = gridColumns * gridRows;
    let cardX = 80;
    let cardY = 112;
    let gap = 20;
    let offsetX = cardX / 2 * Card.defaultScale + (sceneWidth - gridColumns * (cardX + gap)) / 2;
    let offsetY = cardY / 2 * Card.defaultScale + gap;

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

    // Set active hearts for next level
    enemyCountdown = enemyCooldown;
    enemyCountdownLabel.text = enemyCountdown;
    levelEnemyHearts = 2 + levelNum;

    currDodge = maxDodge;
    currDodgeLabel.text = Math.ceil(currDodge) + '%';

    currHearts = maxHearts;

    for (let i = 0; i < maxHearts; i++) {
        heartSprites[i].visible = true;
    }

    for (let i = 0; i < levelEnemyHearts; i++) {
        enemyHeartSprites[i].visible = true;
    }
    for (let i = levelEnemyHearts; i < enemyHeartSprites.length; i++) {
        enemyHeartSprites[i].visible = false;
    }


    paused = false;
}

function end(hasWon = false) {
    paused = true;
    // clear out level
    // circles.forEach(c => gameScene.removeChild(c));
    // circles = [];

    // bullets.forEach(b => gameScene.removeChild(b));
    // bullets = [];

    // explosions.forEach(e => gameScene.removeChild(e));
    // explosions = [];

    cards = [];

    debugger;   
    // Clear grid 
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridColumns; col++) {
            if (cardsGrid[row] && cardsGrid[row][col]) {
                gameScene.removeChild(cardsGrid[row][col]);
            }
        }

    }

    cardsGrid = [];

    gameOverScene.visible = true;
    gameScene.visible = false;

    if (hasWon) {
        gameOverLabel.visible = false;
        youWinLabel.visible = true;
    }
    else {
        gameOverLabel.visible = true;
        youWinLabel.visible = false;
    }

}

/**
 * 
 * Methods to do a card's effects
 * 
 */
function addHeart() {
    if (currHearts < maxHearts) {
        heartSprites[currHearts].visible = true;
        currHearts++;
    }
}
function attackEnemy() {
    levelEnemyHearts--;
    enemyHeartSprites[levelEnemyHearts].visible = false;
}
function addDodge() {
    if (currDodge < maxDodge - 15) {
        currDodge += 15;
    }
    else {
        currDodge = 100;
    }
    currDodgeLabel.text = currDodge;
}
function addCountdownTime() {
    enemyCountdown += 5;
    enemyCountdownLabel.text = enemyCountdown;
}


/**
 * 
 *  Helper Methods beyond here!
 * 
 * 
 */
function makeButton(scene = startScene, funct = function () { }, text = "Button", style, x = 0, y = 0) {
    let button = new PIXI.Text(text);
    button.style = style;
    button.x = x - button.width / 2;
    button.y = y - button.height / 2;
    button.interactive = true;
    button.buttonMode = true;
    button.on("pointerup", funct);  // startGame is a function reference
    button.on("pointerover", e => e.target.alpha = 0.7); // concise arrow function with no brackets
    button.on("pointerout", e => e.currentTarget.alpha = 1.0); // ditto
    scene.addChild(button);

    return button;
}

function makeLabel(scene = startScene, text = "Label", style, x = 0, y = 0) {
    let label = new PIXI.Text(text);
    label.style = style;
    label.x = x - label.width / 2;
    label.y = y - label.height / 2;
    scene.addChild(label);

    return label;
}


