"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var cube_png_1 = require("../assets/images/cube.png");
var cube = new Image();
cube.src = cube_png_1.default;
var canvas = document.getElementById("gamearena");
var ctx = canvas.getContext("2d");
ctx.scale(30, 30);
var bpcanvas = document.getElementById("bullpen");
var bpctx = bpcanvas.getContext("2d");
bpctx.scale(20, 20);
var gamepiece = { position: { x: 0, y: 0 }, matrix: null };
var bullpenpiece = { position: { x: 0, y: 0 }, matrix: null };
var canvasSpace = function (height, width) {
    return Array.from({ length: height }, function () { return new Array(width).fill(0); });
};
var gamearena = canvasSpace(20, 10);
var bullpen = canvasSpace(4, 2);
var colors = [
    null,
    "0,   255,  255", // I cyan
    "0,   0,    255", // J purple
    "255, 165,  0", // L orange
    "255, 255,  0", // O yellow
    "0,   128,  0", // S green
    "128, 0,    128", // T purple
    "255, 0,    0", // Z red
];
var pieceStats = {
    I: 0,
    J: 0,
    L: 0,
    O: 0,
    S: 0,
    T: 0,
    Z: 0,
};
var standby = assignPiece();
var cancelId = 0;
var dropCounter = 0;
var dropSpeed = 1000;
var time = 0;
var score = 0;
var level = 1;
var lines = 0;
requestAnimationFrame(run);
document.addEventListener("keydown", kbcontrols);
function kbcontrols(event) {
    if (event.code === "Space") {
        document.removeEventListener("keydown", kbcontrols);
        document.addEventListener("keydown", playercontrols);
        initiateNewGamePiece(standby);
        loadBullpen();
        requestAnimationFrame(run);
    }
}
function playercontrols(event) {
    switch (event.code) {
        case "ArrowLeft":
        case "KeyH":
            shiftShape(-1);
            break;
        case "ArrowRight":
        case "KeyL":
            shiftShape(1);
            break;
        case "ArrowDown":
        case "KeyJ":
            dropShape();
            break;
        case "KeyD":
            rotateShape(1);
            break;
        case "KeyA":
            rotateShape(-1);
            break;
    }
}
function assignPiece() {
    var pieces = "TJLOSZI";
    return pieces.charAt(Math.floor(Math.random() * pieces.length));
}
function clearRow() {
    var rows = 1;
    loop: for (var y = gamearena.length - 1; y > 0; --y) {
        for (var x = 0; x < gamearena[y].length; ++x) {
            if (gamearena[y][x] === 0)
                continue loop;
        }
        var row = gamearena.splice(y, 1)[0].fill(0);
        gamearena.unshift(row);
        ++y;
        updateScore(rows);
    }
    displayScore();
}
function updateScore(rows) {
    score += rows * 10;
    lines += rows;
    if (score > 49 * level) {
        level++;
        dropSpeed = Math.max(dropSpeed - 200, 200);
    }
}
function collision() {
    if (!gamepiece.matrix)
        return false;
    for (var y = 0; y < gamepiece.matrix.length; ++y) {
        for (var x = 0; x < gamepiece.matrix[y].length; ++x) {
            if (gamepiece.matrix[y][x] !== 0 &&
                (gamearena[y + gamepiece.position.y] &&
                    gamearena[y + gamepiece.position.y][x + gamepiece.position.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}
function displayScore() {
    var scoreElement = document.getElementById("score");
    var levelElement = document.getElementById("level");
    var linesElement = document.getElementById("lines");
    if (scoreElement && levelElement && linesElement) {
        scoreElement.innerText = score.toString();
        levelElement.innerText = level.toString();
        linesElement.innerText = lines.toString();
    }
}
function updateStatistics() {
    var statsElement = document.getElementById("stats");
    if (!statsElement)
        return;
    statsElement.innerHTML = "\n    <ul>\n      ".concat(Object.entries(pieceStats)
        .map(function (_a) {
        var shape = _a[0], count = _a[1];
        return "<li>".concat(shape, ": ").concat(count, "</li>");
    })
        .join(''), "\n    </ul>\n  ");
}
function dropShape() {
    gamepiece.position.y++;
    if (collision()) {
        gamepiece.position.y--;
        fuse();
        initiateNewGamePiece(standby);
        loadBullpen();
        clearRow();
        updateStatistics();
    }
    dropCounter = 0;
}
function fuse() {
    var _a;
    (_a = gamepiece.matrix) === null || _a === void 0 ? void 0 : _a.forEach(function (row, y) {
        return row.forEach(function (value, x) {
            if (value !== 0) {
                gamearena[y + gamepiece.position.y][x + gamepiece.position.x] = value;
            }
        });
    });
}
function gameOver() {
    document.removeEventListener("keydown", playercontrols);
    cancelAnimationFrame(cancelId);
    document.addEventListener("keydown", kbcontrols);
    //TODO: create web service track high scores
}
function gamePiece(shape) {
    switch (shape) {
        case "I":
            return [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
        case "J":
            return [
                [2, 0, 0],
                [2, 2, 2],
                [0, 0, 0],
            ];
        case "L":
            return [
                [0, 0, 3],
                [3, 3, 3],
                [0, 0, 0],
            ];
        case "O":
            return [
                [4, 4],
                [4, 4],
            ];
        case "S":
            return [
                [0, 5, 5],
                [5, 5, 0],
                [0, 0, 0],
            ];
        case "T":
            return [
                [0, 6, 0],
                [6, 6, 6],
                [0, 0, 0],
            ];
        case "Z":
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
        default:
            return null;
    }
}
function initiateNewGamePiece(shape) {
    var matrix = gamePiece(shape);
    if (!matrix)
        throw new Error('invalid shape provided');
    pieceStats[shape] = (pieceStats[shape] || 0) + 1;
    gamepiece.matrix = matrix;
    gamepiece.position = {
        x: Math.floor((gamearena[0].length - matrix[0].length) / 2),
        y: 0
    };
    if (collision()) {
        gameOver();
    }
}
function loadBullpen() {
    standby = assignPiece();
    bpctx.clearRect(0, 0, bpcanvas.width, bpcanvas.height);
    bpctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    bpctx.fillRect(0, 0, bpcanvas.width, bpcanvas.height);
    var matrix = gamePiece(standby);
    if (!matrix)
        throw new Error('invalid shape provided');
    bullpenpiece.matrix = matrix;
    renderElement(bullpen, { x: 0, y: 1 }, bpctx);
    renderElement(bullpenpiece.matrix, { x: 0, y: 0 }, bpctx);
}
function redrawCanvases() {
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(0, 0, 10, 20);
    renderElement(gamearena, { x: 0, y: 0 }, ctx);
    if (gamepiece.matrix) {
        renderElement(gamepiece.matrix, gamepiece.position, ctx);
    }
}
function renderElement(element, offset, context) {
    if (!element)
        return;
    element.forEach(function (row, ypos) {
        return row.forEach(function (color, xpos) {
            if (color !== 0) {
                context.drawImage(cube, xpos + offset.x, ypos + offset.y, 1, 1);
                context.fillStyle = "rgba(".concat(colors[color], ", 0.4)");
                context.fillRect(xpos + offset.x, ypos + offset.y, 1, 1);
            }
        });
    });
}
function rotate(shape, direction) {
    var _a;
    var rotatedshape = shape.map(function (row) { return __spreadArray([], row, true); });
    for (var y = 0; y < rotatedshape.length; ++y) {
        for (var x = 0; x < y; ++x) {
            _a = [rotatedshape[y][x], rotatedshape[x][y]], rotatedshape[x][y] = _a[0], rotatedshape[y][x] = _a[1];
        }
    }
    if (direction > 0) {
        rotatedshape.forEach(function (row) { return row.reverse(); });
    }
    else {
        rotatedshape.reverse();
    }
    return rotatedshape;
}
function rotateShape(direction) {
    var rotatedmatrix = rotate(gamepiece.matrix, direction);
    var offset = 1;
    var matrix = gamepiece.matrix;
    gamepiece.matrix = rotatedmatrix;
    while (collision()) {
        gamepiece.position.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (Math.abs(offset) > gamepiece.matrix[0].length) {
            gamepiece.matrix = matrix;
            return;
        }
    }
}
function run(t) {
    if (t === void 0) { t = 0; }
    var delta = t - time;
    dropCounter += delta;
    if (dropCounter > dropSpeed) {
        dropShape();
    }
    time = t;
    redrawCanvases();
    cancelId = requestAnimationFrame(run);
}
function shiftShape(offset) {
    gamepiece.position.x += offset;
    if (collision()) {
        gamepiece.position.x -= offset;
    }
}
