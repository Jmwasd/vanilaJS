import BLOCKS from './bocks.js';

//DOM

const playground = document.querySelector('.playground > ul');
const gameText = document.querySelector('.game-text');
const scoreDisplay = document.querySelector('.score');
const levelDisplay = document.querySelector('.level');
const restartButton = document.querySelector('.game-text > button');
const nextBlocks = document.querySelector('.next-block > ul');

// Setting

const GAME_ROWS = 20;
const GAME_COLS = 10;
const NEXT_BLOCK_ROWS = 4;
const NEXT_BLOCK_COLS = 5;

//variables

let score = 0;
let duration = 1000;
let downInterval;
let tempMovingItem;
let nextBlockTrriger = 0;
let level = 1;

const movingItem = {
    type: '',
    direction: 0,
    top: 0,
    left: 0,
};

const nextBlockItem = {
    type: '',
    direction: 0,
    top: 1,
    left: 1,
};

init();

//functions
function getRandomBlock() {
    const blockKeyArray = Object.keys(BLOCKS);
    const firstRandomIndex = parseInt(Math.random() * blockKeyArray.length);
    const secondRandomIndex = parseInt(Math.random() * blockKeyArray.length);
    if (nextBlockTrriger === 0) {
        return [blockKeyArray[firstRandomIndex], blockKeyArray[secondRandomIndex]];
    } else {
        return [nextBlockItem.type, blockKeyArray[firstRandomIndex]];
    }
}

function init() {
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

function renderNextBlock() {
    const { type, direction, top, left } = nextBlockItem;
    const movingBlocks = document.querySelectorAll('.next');
    movingBlocks.forEach((movings) => {
        const length = movings.classList.length;
        for (let i = 0; i < length; i++) {
            movings.classList.remove(movings.classList[i], 'next');
        }
    });
    BLOCKS[type][direction].some((block) => {
        const x = block[0] + left;
        const y = block[1] + top;
        const target = nextBlocks.childNodes[y] ? nextBlocks.childNodes[y].childNodes[0].childNodes[x] : null;
        target.classList.add(type, 'next');
    });
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
    if (level * 8 < score && level <= 14) {
        duration -= 70;
        level++;
        levelDisplay.innerHTML = level;
    }
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock('top', 1);
    }, duration);

    const itemTypes = getRandomBlock();

    nextBlockItem.type = itemTypes[1];
    movingItem.type = itemTypes[0];
    movingItem.top = 0;
    movingItem.left = 4;
    movingItem.direction = 0;
    tempMovingItem = { ...movingItem };

    if (nextBlockTrriger !== 1) {
        nextBlockTrriger++;
    }

    renderNextBlock();
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
    nextBlocks.innerHTML = '';
    gameText.style.display = 'none';
    score = 0;
    level = 1;
    scoreDisplay.innerText = 0;
    levelDisplay.innerText = 1;
    init();
});
