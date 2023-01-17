import BLOCKS from './bocks.js';

//DOM

const playground = document.querySelector('.playground > ul');
const gameText = document.querySelector('.game-text');
const scoreDisplay = document.querySelector('.score');
const restartButton = document.querySelector('.game-text > button');
const nextBlocks = document.querySelector('.next-block > ul');

// Setting

const GAME_ROWS = 20;
const GAME_COLS = 10;
const NEXT_BLOCK_ROWS = 5;
const NEXT_BLOCK_COLS = 5;

//variables

let score = 0;
let duration = 1000;
let downInterval;
let tempMovingItem;

const movingItem = {
    type: '',
    direction: 0,
    top: 0,
    left: 0,
};

init();

//functions
function getRandomBlock() {
    const blockKeyArray = Object.keys(BLOCKS);
    const randomIndex = parseInt(Math.random() * blockKeyArray.length);
    return blockKeyArray[randomIndex];
}

function init() {
    movingItem.type = getRandomBlock();
    tempMovingItem = { ...movingItem };
    for (let i = 0; i < GAME_ROWS; i++) {
        prependNewLine();
    }
    for (let i = 0; i < NEXT_BLOCK_ROWS; i++) {
        prependNextBlocks();
    }
    generateNewBlock();
}

function prependNewLine() {
    const li = document.createElement('li');
    const ul = document.createElement('ul');
    for (let j = 0; j < GAME_COLS; j++) {
        const metrix = document.createElement('li');
        ul.prepend(metrix);
    }
    li.prepend(ul);
    playground.prepend(li);
}

function prependNextBlocks() {
    const li = document.createElement('li');
    const ul = document.createElement('ul');
    for (let j = 0; j < NEXT_BLOCK_COLS; j++) {
        const metrix = document.createElement('li');
        ul.prepend(metrix);
    }
    li.prepend(ul);
    nextBlocks.prepend(li);
}

function renderBlocks(moveType = '') {
    const { type, direction, top, left } = tempMovingItem;
    const movingBlocks = document.querySelectorAll('.moving');
    movingBlocks.forEach((moving) => {
        moving.classList.remove(type, 'moving');
    });
    BLOCKS[type][direction].some((block) => {
        const x = block[0] + left;
        const y = block[1] + top;
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);
        if (isAvailable) {
            target.classList.add(type, 'moving');
        } else {
            tempMovingItem = { ...movingItem };
            if (moveType === 'retry') {
                clearInterval(downInterval);
                showGameoverText();
            }
            setTimeout(() => {
                renderBlocks('retry');
                if (moveType === 'top') {
                    seizedBlock();
                }
            }, 0);
            return true;
        }
    });
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}

function seizedBlock() {
    const movingBlocks = document.querySelectorAll('.moving');
    movingBlocks.forEach((moving) => {
        moving.classList.remove('moving');
        moving.classList.add('seized');
    });
    checkMach();
}

function checkMach() {
    const childNodes = playground.childNodes;
    childNodes.forEach((child) => {
        let matched = true;
        child.childNodes[0].childNodes.forEach((li) => {
            if (!li.classList.contains('seized')) {
                matched = false;
            }
        });
        if (matched) {
            child.remove();
            prependNewLine();
            score++;
            scoreDisplay.innerText = score;
        }
    });
    generateNewBlock();
}

function generateNewBlock() {
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        // moveBlock('top', 1);
    }, duration);

    movingItem.type = getRandomBlock();
    movingItem.top = 0;
    movingItem.left = 4;
    movingItem.direction = 0;
    tempMovingItem = { ...movingItem };
    renderBlocks();
}

function checkEmpty(target) {
    if (!target || target.classList.contains('seized')) {
        return false;
    } else {
        return true;
    }
}

function moveBlock(moveType, amount) {
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType);
}

function changeDiretion() {
    const changDirection = tempMovingItem.direction;
    changDirection === 3 ? (tempMovingItem.direction = 0) : (tempMovingItem.direction += 1);
    const { type, top, direction, left } = tempMovingItem;
    BLOCKS[type][direction].some((block) => {
        const x = block[0] + left;
        const y = block[1] + top;
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : 'conflictTop';
        if (target === 'conflictTop') {
            tempMovingItem.top += 1;
        } else if (!target) {
            if (x >= 0) {
                tempMovingItem.left -= 2;
            } else {
                tempMovingItem.left += 1;
            }
            return true;
        }
    });
    renderBlocks();
}

function dropBlock() {
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock('top', 1);
    }, 5);
}

function showGameoverText() {
    gameText.style.display = 'flex';
}

//event handling

document.addEventListener('keydown', (e) => {
    switch (e.keyCode) {
        case 39:
            moveBlock('left', 1);
            break;
        case 37:
            moveBlock('left', -1);
            break;
        case 40:
            moveBlock('top', 1);
            break;
        case 38:
            changeDiretion();
            break;
        case 32:
            dropBlock();
            break;
        default:
            break;
    }
});

restartButton.addEventListener('click', () => {
    playground.innerHTML = '';
    gameText.style.display = 'none';
    score = 0;
    scoreDisplay.innerText = 0;
    init();
});
