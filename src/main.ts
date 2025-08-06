import cubesource from '../assets/images/cube.png'
import { GameState } from './GameState.ts'
import type { Piece, Position } from './GameState.ts'

const cube = new Image()
cube.src = cubesource

const colors: (string | null)[] = [
  null,
  "0,   255, 255", // I cyan
  "0,   0,   255", // J blue
  "255, 165, 0",   // L orange
  "255, 255, 0",   // O yellow
  "0,   128, 0",   // S green
  "128, 0,   128", // T purple
  "255, 0,   0",   // Z red
]

// Canvas setup
const canvas = document.getElementById("gamearena") as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
ctx.scale(30, 30)

const bpcanvas = document.getElementById("bullpen") as HTMLCanvasElement
const bpctx = bpcanvas.getContext("2d") as CanvasRenderingContext2D
bpctx.scale(20, 20)

// Game state initialization
const gameState = new GameState()
let cancelId = 0
let dropCounter = 0
let time = 0
let standby = gameState.assignPiece()

function gamePiece(shape: string): number[][] | null {
  switch (shape) {
    case "I": return [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    case "J": return [
      [2, 0, 0],
      [2, 2, 2],
      [0, 0, 0],
    ]
    case "L": return [
      [0, 0, 3],
      [3, 3, 3],
      [0, 0, 0],
    ]
    case "O": return [
      [4, 4],
      [4, 4],
    ]
    case "S": return [
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0],
    ]
    case "T": return [
      [0, 6, 0],
      [6, 6, 6],
      [0, 0, 0],
    ]
    case "Z": return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ]
    default: return null
  }
}

function collision(): boolean {
  const piece = gameState.getGamePiece()
  const arena = gameState.getGameArena()

  if (!piece.matrix) return false

  for (let y = 0; y < piece.matrix.length; ++y) {
    for (let x = 0; x < piece.matrix[y].length; ++x) {
      if (
        piece.matrix[y][x] !== 0 &&
        (arena[y + piece.position.y] &&
          arena[y + piece.position.y][x + piece.position.x]) !== 0
      ) {
        return true
      }
    }
  }
  return false
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
  const piece = gameState.getGamePiece()
  if (!piece.matrix) return

  const rotatedmatrix = rotate(piece.matrix, direction)
  let offset = 1
  const originalMatrix = piece.matrix

  gameState.setGamePiece({ ...piece, matrix: rotatedmatrix })

  while (collision()) {
    gameState.moveGamePiece({ x: offset, y: 0 })
    offset = -(offset + (offset > 0 ? 1 : -1))

    if (Math.abs(offset) > piece.matrix[0].length) {
      gameState.setGamePiece({ ...piece, matrix: originalMatrix })
      return
    }
  }
}

function shiftShape(offset: number): void {
  gameState.moveGamePiece({ x: offset, y: 0 })
  if (collision()) {
    gameState.moveGamePiece({ x: -offset, y: 0 })
  }
}

function dropShape(): void {
  gameState.moveGamePiece({ x: 0, y: 1 })

  if (collision()) {
    gameState.moveGamePiece({ x: 0, y: -1 })
    gameState.fuseGamePiece()
    initiateNewGamePiece(gameState.getStandbyPiece())
    loadBullpen()
    const clearedRows = gameState.clearRows()
    if (clearedRows > 0) {
      gameState.updateScore(clearedRows)
      displayScore()
    }
    updateStatistics()
  }

  dropCounter = 0
}

function initiateNewGamePiece(shape: string): void {
  const matrix = gamePiece(shape)
  if (!matrix) throw new Error('invalid shape provided')

  gameState.updatePieceStats(shape)
  const newPiece: Piece = {
    matrix,
    position: {
      x: Math.floor((gameState.getGameArena()[0].length - matrix[0].length) / 2),
      y: 0
    }
  }

  gameState.setGamePiece(newPiece)

  if (collision()) {
    gameOver()
  }
}

function loadBullpen(): void {
  gameState.nextStandbyPiece()
  bpctx.clearRect(0, 0, bpcanvas.width, bpcanvas.height)
  bpctx.fillStyle = "rgba(255, 255, 255, 0.5)"
  bpctx.fillRect(0, 0, bpcanvas.width, bpcanvas.height)

  const matrix = gamePiece(gameState.getStandbyPiece())
  if (!matrix) throw new Error('invalid shape provided')

  gameState.setBullpenPiece({ matrix, position: { x: 0, y: 0 } })
  renderElement(gameState.getBullpen(), { x: 0, y: 1 }, bpctx)
  renderElement(gameState.getBullpenPiece().matrix, { x: 0, y: 0 }, bpctx)
}

function displayScore(): void {
  const stats = gameState.getStats()
  const scoreElement = document.getElementById("score")
  const levelElement = document.getElementById("level")
  const linesElement = document.getElementById("lines")

  if (scoreElement && levelElement && linesElement) {
    scoreElement.innerText = stats.score.toString()
    levelElement.innerText = stats.level.toString()
    linesElement.innerText = stats.lines.toString()
  }
}

function updateStatistics(): void {
  const statsElement = document.getElementById("stats")
  if (!statsElement) return

  const { pieceStats } = gameState.getStats()
  const pieceImages: Record<string, string> = {
    I: "/assets/images/I.png",
    J: "/assets/images/J.png",
    L: "/assets/images/L.png",
    O: "/assets/images/O.png",
    S: "/assets/images/S.png",
    T: "/assets/images/T.png",
    Z: "/assets/images/Z.png",
  };
  statsElement.innerHTML = `
    <ul>
      ${Object.entries(pieceStats)
      .map(([shape, count]) => `<li><img src="${pieceImages[shape]}" alt="${shape}" width="20" height="20"> ${count}</li>`)
      .join('')}
    </ul>
  `
}

function renderElement(
  element: number[][] | null,
  offset: Position,
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

function redrawCanvases(): void {
  ctx.fillStyle = "rgba(0, 0, 0, 1)"
  ctx.fillRect(0, 0, 10, 20)

  renderElement(gameState.getGameArena(), { x: 0, y: 0 }, ctx)
  const piece = gameState.getGamePiece()
  if (piece.matrix) {
    renderElement(piece.matrix, piece.position, ctx)
  }
}

function run(t = 0): void {
  const delta = t - time
  dropCounter += delta

  if (dropCounter > gameState.getDropSpeed()) {
    dropShape()
  }

  time = t
  redrawCanvases()
  cancelId = requestAnimationFrame(run)
}

function gameOver(): void {
  document.removeEventListener("keydown", playercontrols)
  cancelAnimationFrame(cancelId)
  document.addEventListener("keydown", kbcontrols)
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

function kbcontrols(event: KeyboardEvent): void {
  if (event.code === "Space") {
    document.removeEventListener("keydown", kbcontrols)
    document.addEventListener("keydown", playercontrols)

    initiateNewGamePiece(standby)
    loadBullpen()

    requestAnimationFrame(run)
  }
}

// Initial setup
requestAnimationFrame(run)
document.addEventListener("keydown", kbcontrols)
