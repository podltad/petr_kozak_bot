const boardSize = 10;
const board = document.getElementById('game-board');
const commandsInput = document.getElementById('commands');
const executeButton = document.getElementById('execute');
const themeToggle = document.getElementById('theme-toggle');
const shoutElement = document.getElementById('shout');
const inventory = [];
const inventoryList = document.getElementById('inventory-list');

const cells = [];
for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.x = x;
        cell.dataset.y = y;
        board.appendChild(cell);
        cells.push(cell);
    }
}

let PetaPosition = { x: 0, y: 0 };
let PetaDirection = 0;

function renderPeta() {
    cells.forEach(cell => {
        cell.querySelectorAll('.Peta').forEach(p => p.remove());
    });
    const PetaCell = cells.find(cell => 
        parseInt(cell.dataset.x) === PetaPosition.x &&
        parseInt(cell.dataset.y) === PetaPosition.y);
    if (PetaCell) {
        const PetaElement = document.createElement('div');
        PetaElement.classList.add('Peta');
        PetaElement.dataset.direction = PetaDirection;
        PetaCell.appendChild(PetaElement);
    }
}

function resetBoard() {
    cells.forEach(cell => {
        cell.querySelectorAll('.Peta, .item').forEach(c => c.remove());
    });
    PetaPosition = { x: 0, y: 0 };
    PetaDirection = 0;
    renderPeta();
}

function showShout(message = "Sakra už potřebuju kafe!") {
    shoutElement.textContent = message;
    shoutElement.style.display = 'block';
    setTimeout(() => {
        shoutElement.style.display = 'none';
    }, 3000);
}

function movePeta(steps = 1, callback) {
    let stepCount = 0;
    const interval = setInterval(() => {
        if (stepCount >= steps) {
            clearInterval(interval);
            if (callback) callback();
            return;
        }

        let hitWall = false;
        switch (PetaDirection) {
            case 0:
                if (PetaPosition.x < boardSize - 1) PetaPosition.x++;
                else hitWall = true;
                break;
            case 1:
                if (PetaPosition.y < boardSize - 1) PetaPosition.y++;
                else hitWall = true;
                break;
            case 2:
                if (PetaPosition.x > 0) PetaPosition.x--;
                else hitWall = true;
                break;
            case 3:
                if (PetaPosition.y > 0) PetaPosition.y--;
                else hitWall = true;
                break;
        }

        if (hitWall) {
            showShout("Něco tu překáží!");
            clearInterval(interval);
            if (callback) callback();
            return;
        }

        renderPeta();
        stepCount++;
    }, 300);
}

function turnLeft(times = 1, callback) {
    let turnCount = 0;
    const interval = setInterval(() => {
        if (turnCount >= times) {
            clearInterval(interval);
            if (callback) callback();
            return;
        }
        PetaDirection = (PetaDirection + 3) % 4;
        renderPeta();
        turnCount++;
    }, 300);
}

function placeItem(item, callback) {
    const currentCell = cells.find(cell => 
        parseInt(cell.dataset.x) === PetaPosition.x &&
        parseInt(cell.dataset.y) === PetaPosition.y);
    if (currentCell) {
        const itemElement = document.createElement('div');
        itemElement.classList.add('item');
        itemElement.textContent = item.toLowerCase() === 'kafe' ? '☕' : item;
        currentCell.insertBefore(itemElement, currentCell.firstChild);
    }
    setTimeout(callback, 300);
}

function jumpPeta(steps, callback) {
    let newX = PetaPosition.x;
    let newY = PetaPosition.y;
    let outOfBounds = false;

    switch (PetaDirection) {
        case 0: newX += steps; break;
        case 1: newY += steps; break;
        case 2: newX -= steps; break;
        case 3: newY -= steps; break;
    }

    if (newX < 0 || newX >= boardSize || newY < 0 || newY >= boardSize) {
        showShout("To je moc daleko!");
        outOfBounds = true;
    }

    if (!outOfBounds) {
        PetaPosition.x = newX;
        PetaPosition.y = newY;
        renderPeta();
    }

    setTimeout(callback, 300);
}

function collectItem(symbol, callback) {
    const currentCell = cells.find(cell => 
        parseInt(cell.dataset.x) === PetaPosition.x &&
        parseInt(cell.dataset.y) === PetaPosition.y);

    if (currentCell) {
        const itemElement = currentCell.querySelector('.item');
        if (itemElement) {
            inventory.push(symbol || itemElement.textContent);
            itemElement.remove();
            updateInventory();
        } else {
            showShout("Tady nic není!");
        }
    }

    setTimeout(callback, 300);
}

function updateInventory() {
    inventoryList.innerHTML = '';
    inventory.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = item;
        inventoryList.appendChild(listItem);
    });
}

function executeCommands(commands) {
    const lines = commands.split(/\n|,/).map(line => line.trim());
    let index = 0;

    function processNextCommand() {
        if (index >= lines.length) return;

        const [command, param] = lines[index].toUpperCase().split(' ');
        const paramValue = parseInt(param) || 1;
        switch (command) {
            case 'KROK':
                movePeta(paramValue, processNextCommand);
                break;
            case 'VLEVOBOK':
                turnLeft(paramValue, processNextCommand);
                break;
            case 'POLOZ':
                placeItem(param, processNextCommand);
                break;
            case 'SKOK':
                jumpPeta(paramValue, processNextCommand);
                break;
            case 'SEBRAT':
                collectItem(param, processNextCommand);
                break;
            case 'RESET':
                resetBoard();
                processNextCommand();
                break;
            default:
                processNextCommand();
                break;
        }
        index++;
    }

    processNextCommand();
}

executeButton.addEventListener('click', () => {
    executeCommands(commandsInput.value);
});

themeToggle.addEventListener('click', () => {
           const theme = document.documentElement.getAttribute('data-theme');
           document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'light' : 'dark');
           themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
       });

resetBoard();