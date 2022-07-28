import BLOCKS from './bocks.js';

//DOM

const playground = document.querySelector('.playground > ul');

// Setting

const GAME_ROWS = 20;
const GAME_COLS = 10;

//variables

const score = 0;
let duration = 5000;
let downInterval;
let tempMovingItem;

const movingItem = {
    type: 'bar',
    direction: 0,
    top: 0,
    left: 0,
};

init();

//functions
function init() {
    tempMovingItem = { ...movingItem };
    for (let i = 0; i < GAME_ROWS; i++) {
        prependNewLine();
    }
    renderBlocks();
}

function prependNewLine() {
    const li = document.createElement('li');
    const ul = document.createElement('ul');
    for (let j = 0; j < GAME_COLS; j++) {
        const metrix = document.createElement('li');
        ul.prepend(metrix);
    }
    li.prepend(ul);
    playground.appendChild(li);
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
            setTimeout(() => {
                renderBlocks();
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
    generateNewBlock();
}

function generateNewBlock() {
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
    const direction = tempMovingItem.direction;
    direction === 3 ? (tempMovingItem.direction = 0) : (tempMovingItem.direction += 1);
    renderBlocks();
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
        default:
            break;
    }
});
