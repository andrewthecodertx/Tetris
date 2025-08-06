import cubesource from '../assets/images/cube.png'

type Piece = {
  position: { x: number; y: number }
  matrix: number[][] | null
}

const cube = new Image()
cube.src = cubesource

const canvas = document.getElementById("gamearena") as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
ctx.scale(30, 30)

const bpcanvas = document.getElementById("bullpen") as HTMLCanvasElement
const bpctx = bpcanvas.getContext("2d") as CanvasRenderingContext2D
bpctx.scale(20, 20)

const gamepiece: Piece = { position: { x: 0, y: 0 }, matrix: null }
const bullpenpiece: Piece = { position: { x: 0, y: 0 }, matrix: null }
const canvasSpace = (height: number, width: number): number[][] =>
  Array.from({ length: height }, (): number[] =>
    new Array(width).fill(0))
const gamearena: number[][] = canvasSpace(20, 10)
const bullpen: number[][] = canvasSpace(4, 2)
const colors: (string | null)[] = [
  null,
  "0,   255,  255", // I cyan
  "0,   0,    255", // J purple
  "255, 165,  0",   // L orange
  "255, 255,  0",   // O yellow
  "0,   128,  0",   // S green
  "128, 0,    128", // T purple
  "255, 0,    0",   // Z red
]

const pieceStats: Record<string, number> = {
  I: 0,
  J: 0,
  L: 0,
  O: 0,
  S: 0,
  T: 0,
  Z: 0,
}

let standby: string = assignPiece()
let cancelId = 0
let dropCounter = 0
let dropSpeed = 1000
let time = 0
let score = 0
let level = 1
let lines = 0

requestAnimationFrame(run)

document.addEventListener("keydown", kbcontrols)

function kbcontrols(event: KeyboardEvent): void {
  if (event.code === "Space") {
    document.removeEventListener("keydown", kbcontrols)
    document.addEventListener("keydown", playercontrols)

    initiateNewGamePiece(standby)
    loadBullpen()

    requestAnimationFrame(run)
  }
}

function playercontrols(event: KeyboardEvent): void {
  switch (event.code) {
    case "ArrowLeft":
    case "KeyH":
      shiftShape(-1)
      break
    case "ArrowRight":
    case "KeyL":
      shiftShape(1)
      break
    case "ArrowDown":
    case "KeyJ":
      dropShape()
      break
    case "KeyD":
      rotateShape(1)
      break
    case "KeyA":
      rotateShape(-1)
      break
  }
}

function assignPiece(): string {
  let pieces = "TJLOSZI"
  return pieces.charAt(Math.floor(Math.random() * pieces.length))
}

function clearRow(): void {
  let rows = 1;
  loop: for (let y = gamearena.length - 1; y > 0; --y) {
    for (let x = 0; x < gamearena[y].length; ++x) {
      if (gamearena[y][x] === 0) continue loop
    }
    let row = gamearena.splice(y, 1)[0].fill(0);
    gamearena.unshift(row)
    ++y
    updateScore(rows)
  }
  displayScore()
}

function updateScore(rows: number): void {
  score += rows * 10
  lines += rows
  if (score > 49 * level) {
    level++
    dropSpeed = Math.max(dropSpeed - 200, 200)
  }
}

function collision(): boolean {
  if (!gamepiece.matrix) return false
  for (let y = 0; y < gamepiece.matrix.length; ++y) {
    for (let x = 0; x < gamepiece.matrix[y].length; ++x) {
      if (
        gamepiece.matrix[y][x] !== 0 &&
        (gamearena[y + gamepiece.position.y] &&
          gamearena[y + gamepiece.position.y][x + gamepiece.position.x]) !== 0
      ) {
        return true
      }
    }
  }
  return false
}

function displayScore(): void {
  let scoreElement = document.getElementById("score")
  let levelElement = document.getElementById("level")
  let linesElement = document.getElementById("lines")

  if (scoreElement && levelElement && linesElement) {
    scoreElement.innerText = score.toString()
    levelElement.innerText = level.toString()
    linesElement.innerText = lines.toString()
  }
}

function updateStatistics(): void {
  let statsElement = document.getElementById("stats")
  if (!statsElement) return

  statsElement.innerHTML = `
    <ul>
      ${Object.entries(pieceStats)
      .map(([shape, count]: [string, number]): string =>
        `<li>${shape}: ${count}</li>`)
      .join('')}
    </ul>
  `
}

function dropShape(): void {
  gamepiece.position.y++;
  if (collision()) {
    gamepiece.position.y--
    fuse()
    initiateNewGamePiece(standby)
    loadBullpen()
    clearRow()
    updateStatistics()
  }
  dropCounter = 0
}

function fuse(): void {
  gamepiece.matrix?.forEach((row: number[], y: number): void =>
    row.forEach((value: number, x: number): void => {
      if (value !== 0) {
        gamearena[y + gamepiece.position.y][x + gamepiece.position.x] = value
      }
    })
  )
}

function gameOver(): void {
  document.removeEventListener("keydown", playercontrols)
  cancelAnimationFrame(cancelId)
  document.addEventListener("keydown", kbcontrols)
  //TODO: create web service track high scores
}

function gamePiece(shape: string): number[][] | null {
  switch (shape) {
    case "I":
      return [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ]
    case "J":
      return [
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0],
      ]
    case "L":
      return [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0],
      ]
    case "O":
      return [
        [4, 4],
        [4, 4],
      ]
    case "S":
      return [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0],
      ]
    case "T":
      return [
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0],
      ]
    case "Z":
      return [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0],
      ]
    default:
      return null;
  }
}

function initiateNewGamePiece(shape: string): void {
  let matrix = gamePiece(shape)
  if (!matrix) throw new Error('invalid shape provided')

  pieceStats[shape] = (pieceStats[shape] || 0) + 1
  gamepiece.matrix = matrix
  gamepiece.position = {
    x: Math.floor((gamearena[0].length - matrix[0].length) / 2),
    y: 0
  }

  if (collision()) {
    gameOver()
  }
}

function loadBullpen(): void {
  standby = assignPiece()
  bpctx.clearRect(0, 0, bpcanvas.width, bpcanvas.height)
  bpctx.fillStyle = "rgba(255, 255, 255, 0.5)"
  bpctx.fillRect(0, 0, bpcanvas.width, bpcanvas.height)

  let matrix = gamePiece(standby)
  if (!matrix) throw new Error('invalid shape provided')

  bullpenpiece.matrix = matrix
  renderElement(bullpen, { x: 0, y: 1 }, bpctx)
  renderElement(bullpenpiece.matrix, { x: 0, y: 0 }, bpctx)
}

function redrawCanvases(): void {
  ctx.fillStyle = "rgba(0, 0, 0, 1)"
  ctx.fillRect(0, 0, 10, 20)

  renderElement(gamearena, { x: 0, y: 0 }, ctx)
  if (gamepiece.matrix) {
    renderElement(gamepiece.matrix, gamepiece.position, ctx)
  }
}

function renderElement(
  element: number[][] | null,
  offset: { x: number; y: number },
  context: CanvasRenderingContext2D
): void {
  if (!element) return

  element.forEach((row: number[], ypos: number): void =>
    row.forEach((color: number, xpos: number): void => {
      if (color !== 0) {
        context.drawImage(cube, xpos + offset.x, ypos + offset.y, 1, 1)
        context.fillStyle = `rgba(${colors[color]}, 0.4)`
        context.fillRect(xpos + offset.x, ypos + offset.y, 1, 1)
      }
    })
  )
}

function rotate(shape: number[][], direction: number): number[][] {
  let rotatedshape = shape.map(row => [...row])

  for (let y = 0; y < rotatedshape.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [rotatedshape[x][y], rotatedshape[y][x]] =
        [rotatedshape[y][x], rotatedshape[x][y]]
    }
  }

  if (direction > 0) {
    rotatedshape.forEach(row => row.reverse())
  } else {
    rotatedshape.reverse()
  }

  return rotatedshape
}

function rotateShape(direction: number): void {
  let rotatedmatrix = rotate(gamepiece.matrix!, direction)
  let offset = 1;

  let matrix = gamepiece.matrix
  gamepiece.matrix = rotatedmatrix

  while (collision()) {
    gamepiece.position.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));

    if (Math.abs(offset) > gamepiece.matrix![0].length) {
      gamepiece.matrix = matrix
      return;
    }
  }
}

function run(t = 0): void {
  let delta = t - time
  dropCounter += delta

  if (dropCounter > dropSpeed) {
    dropShape()
  }

  time = t
  redrawCanvases()
  cancelId = requestAnimationFrame(run)
}

function shiftShape(offset: number): void {
  gamepiece.position.x += offset
  if (collision()) {
    gamepiece.position.x -= offset
  }
}
