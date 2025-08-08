import { Piece } from './Piece';

export type Position = {
  x: number
  y: number
}

export type GameStats = {
  score: number
  level: number
  lines: number
  dropSpeed: number
  pieceStats: Record<string, number>
}

export class GameState {
  private gamearena: number[][]
  private bullpen: number[][]
  private gamepiece: Piece | null
  private bullpenpiece: Piece | null
  private standbyPiece: string
  private stats: GameStats

  constructor() {
    this.gamearena = this.createCanvas(20, 10)
    this.bullpen = this.createCanvas(4, 2)
    this.gamepiece = null
    this.bullpenpiece = null
    this.standbyPiece = ''
    this.stats = {
      score: 0,
      level: 1,
      lines: 0,
      dropSpeed: 1000,
      pieceStats: {
        I: 0,
        J: 0,
        L: 0,
        O: 0,
        S: 0,
        T: 0,
        Z: 0,
      }
    };
  }

  private createCanvas(height: number, width: number): number[][] {
    return Array.from({ length: height }, () => new Array(width).fill(0))
  }

  public getGameArena(): number[][] {
    return this.gamearena
  }

  public getBullpen(): number[][] {
    return this.bullpen
  }

  public getGamePiece(): Piece | null {
    return this.gamepiece
  }

  public getBullpenPiece(): Piece | null {
    return this.bullpenpiece
  }

  public getStats(): GameStats {
    return { ...this.stats }
  }

  public getStandbyPiece(): string {
    return this.standbyPiece
  }

  public updateScore(rows: number): void {
    this.stats.score += rows * 10
    this.stats.lines += rows
    if (this.stats.score > 49 * this.stats.level) {
      this.stats.level++
      this.stats.dropSpeed = Math.max(this.stats.dropSpeed - 200, 200)
    }
  }

  public updatePieceStats(piece: string): void {
    this.stats.pieceStats[piece] = (this.stats.pieceStats[piece] || 0) + 1
  }

  public setGamePiece(piece: Piece | null): void {
    this.gamepiece = piece
  }

  public setBullpenPiece(piece: Piece | null): void {
    this.bullpenpiece = piece
  }

  public setGamePiecePosition(position: Position): void {
    if (this.gamepiece) {
      this.gamepiece.position = { ...position }
    }
  }

  public moveGamePiece(offset: Position): void {
    if (this.gamepiece) {
      this.gamepiece.position.x += offset.x
      this.gamepiece.position.y += offset.y
    }
  }

  public fuseGamePiece(): void {
    if (this.gamepiece && this.gamepiece.position) {
      this.gamepiece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0 && this.gamepiece && this.gamepiece.position) {
            this.gamearena[y + this.gamepiece.position.y][x + this.gamepiece.position.x] = value
          }
        })
      })
    }
  }

  public clearRows(): number {
    let rowsCleared = 0

    loop: for (let y = this.gamearena.length - 1; y > 0; --y) {
      for (let x = 0; x < this.gamearena[y].length; ++x) {
        if (this.gamearena[y][x] === 0) continue loop
      }

      const row = this.gamearena.splice(y, 1)[0].fill(0)
      this.gamearena.unshift(row)
      ++y;
      rowsCleared++
    }

    return rowsCleared
  }

  public assignPiece(): string {
    const pieces = "TJLOSZI"
    return pieces.charAt(Math.floor(Math.random() * pieces.length))
  }

  public nextStandbyPiece(): void {
    this.standbyPiece = this.assignPiece()
  }

  public getDropSpeed(): number {
    return this.stats.dropSpeed
  }

  public reset(): void {
    this.gamearena = this.createCanvas(20, 10);
    this.gamepiece = null;
    this.bullpenpiece = null;
    this.stats = {
      score: 0,
      level: 1,
      lines: 0,
      dropSpeed: 1000,
      pieceStats: {
        I: 0,
        J: 0,
        L: 0,
        O: 0,
        S: 0,
        T: 0,
        Z: 0,
      }
    };
  }
}
