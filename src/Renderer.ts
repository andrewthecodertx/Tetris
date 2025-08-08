import type { GameState, Piece, Position } from './GameState.ts';
import cubeUrl from '/images/cube.png';
import iUrl from "/images/I.png";
import jUrl from "/images/J.png";
import lUrl from "/images/L.png";
import oUrl from "/images/O.png";
import sUrl from "/images/S.png";
import tUrl from "/images/T.png";
import zUrl from "/images/Z.png";

const colors: (string | null)[] = [
    null,
    "0,   255, 255", // I cyan
    "0,   0,   255", // J blue
    "255, 165, 0",   // L orange
    "255, 255, 0",   // O yellow
    "0,   128, 0",   // S green
    "128, 0,   128", // T purple
    "255, 0,   0",   // Z red
];

const pieceImages: Record<string, string> = {
    I: iUrl,
    J: jUrl,
    L: lUrl,
    O: oUrl,
    S: sUrl,
    T: tUrl,
    Z: zUrl,
};

export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private bpctx: CanvasRenderingContext2D;
    private cube: HTMLImageElement;

    constructor(canvas: HTMLCanvasElement, bpcanvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.ctx.scale(30, 30);

        this.bpctx = bpcanvas.getContext("2d") as CanvasRenderingContext2D;
        this.bpctx.scale(20, 20);

        this.cube = new Image();
        this.cube.src = cubeUrl;
    }

    private renderElement(
        element: number[][] | null,
        offset: Position,
        context: CanvasRenderingContext2D
    ): void {
        if (!element) return;

        element.forEach((row: number[], ypos: number): void =>
            row.forEach((color: number, xpos: number): void => {
                if (color !== 0) {
                    context.drawImage(this.cube, xpos + offset.x, ypos + offset.y, 1, 1);
                    context.fillStyle = `rgba(${colors[color]}, 0.4)`;
                    context.fillRect(xpos + offset.x, ypos + offset.y, 1, 1);
                }
            })
        );
    }

    public redrawCanvases(gameState: GameState): void {
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, 10, 20);

        this.renderElement(gameState.getGameArena(), { x: 0, y: 0 }, this.ctx);
        const piece = gameState.getGamePiece();
        if (piece) {
            this.renderElement(piece.matrix, piece.position, this.ctx);
        }
    }

    public loadBullpen(gameState: GameState): void {
        this.bpctx.clearRect(0, 0, this.bpctx.canvas.width, this.bpctx.canvas.height);
        this.bpctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        this.bpctx.fillRect(0, 0, this.bpctx.canvas.width, this.bpctx.canvas.height);

        this.renderElement(gameState.getBullpen(), { x: 0, y: 1 }, this.bpctx);
        const bullpenPiece = gameState.getBullpenPiece();
        if (bullpenPiece) {
            this.renderElement(bullpenPiece.matrix, { x: 0, y: 0 }, this.bpctx);
        }
    }

    public displayScore(gameState: GameState): void {
        const stats = gameState.getStats();
        const scoreElement = document.getElementById("score");
        const levelElement = document.getElementById("level");
        const linesElement = document.getElementById("lines");

        if (scoreElement && levelElement && linesElement) {
            scoreElement.innerText = stats.score.toString();
            levelElement.innerText = stats.level.toString();
            linesElement.innerText = stats.lines.toString();
        }
    }

    public updateStatistics(gameState: GameState): void {
        const statsElement = document.getElementById("stats");
        if (!statsElement) return;

        const { pieceStats } = gameState.getStats();
        statsElement.innerHTML = `
            <ul>
                ${Object.entries(pieceStats)
                .map(([shape, count]) => `<li><img src="${pieceImages[shape]}" alt="${shape}" width="20" height="20"> <span>${count}</span></li>`)
                .join('')}
            </ul>
        `;
    }

    public drawGameOver(): void {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, 10, 20);
        this.ctx.font = "1px 'Press Start 2P'";
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', 5, 10);
    }
}
