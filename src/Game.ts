import { GameState } from './GameState';
import { Renderer } from './Renderer';
import { InputHandler } from './InputHandler';
import { Piece } from './Piece';

export class Game {
    private gameState: GameState;
    private renderer: Renderer;
    private inputHandler: InputHandler;
    private cancelId: number;
    private dropCounter: number;
    private time: number;
    private standby: string;

    constructor(canvas: HTMLCanvasElement, bpcanvas: HTMLCanvasElement) {
        this.gameState = new GameState();
        this.renderer = new Renderer(canvas, bpcanvas);
        this.inputHandler = new InputHandler(
            this.shiftShape.bind(this),
            this.dropShape.bind(this),
            this.rotateShape.bind(this),
            this.startGame.bind(this)
        );
        this.cancelId = 0;
        this.dropCounter = 0;
        this.time = 0;
        this.standby = this.gameState.assignPiece();

        this.renderer.redrawCanvases(this.gameState);
        this.renderer.updateStatistics(this.gameState);
    }

    private collision(): boolean {
        const piece = this.gameState.getGamePiece();
        const arena = this.gameState.getGameArena();

        if (!piece) return false;

        for (let y = 0; y < piece.matrix.length; ++y) {
            for (let x = 0; x < piece.matrix[y].length; ++x) {
                if (
                    piece.matrix[y][x] !== 0 &&
                    (arena[y + piece.position.y] &&
                        arena[y + piece.position.y][x + piece.position.x]) !== 0
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    private rotate(shape: number[][], direction: number): number[][] {
        let rotatedshape = shape.map(row => [...row]);

        for (let y = 0; y < rotatedshape.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [rotatedshape[x][y], rotatedshape[y][x]] =
                    [rotatedshape[y][x], rotatedshape[x][y]];
            }
        }

        if (direction > 0) {
            rotatedshape.forEach(row => row.reverse());
        } else {
            rotatedshape.reverse();
        }

        return rotatedshape;
    }

    private rotateShape(direction: number): void {
        const piece = this.gameState.getGamePiece();
        if (!piece) return;

        const rotatedMatrix = this.rotate(piece.matrix, direction);
        let offset = 1;
        const originalMatrix = piece.matrix;

        piece.matrix = rotatedMatrix;
        this.gameState.setGamePiece(piece);

        while (this.collision()) {
            this.gameState.moveGamePiece({ x: offset, y: 0 });
            offset = -(offset + (offset > 0 ? 1 : -1));

            if (Math.abs(offset) > piece.matrix[0].length) {
                piece.matrix = originalMatrix;
                this.gameState.setGamePiece(piece);
                return;
            }
        }
    }

    private shiftShape(offset: number): void {
        this.gameState.moveGamePiece({ x: offset, y: 0 });
        if (this.collision()) {
            this.gameState.moveGamePiece({ x: -offset, y: 0 });
        }
    }

    private dropShape(): void {
        this.gameState.moveGamePiece({ x: 0, y: 1 });

        if (this.collision()) {
            this.gameState.moveGamePiece({ x: 0, y: -1 });
            this.gameState.fuseGamePiece();
            this.initiateNewGamePiece(this.gameState.getStandbyPiece());
            this.loadBullpen();
            const clearedRows = this.gameState.clearRows();
            if (clearedRows > 0) {
                this.gameState.updateScore(clearedRows);
                this.renderer.displayScore(this.gameState);
            }
        }

        this.dropCounter = 0;
    }

    private initiateNewGamePiece(shape: string): void {
        this.gameState.updatePieceStats(shape);
        this.renderer.updateStatistics(this.gameState);
        const newPiece = new Piece(shape, {
            x: Math.floor((this.gameState.getGameArena()[0].length - new Piece(shape, { x: 0, y: 0 }).matrix[0].length) / 2),
            y: 0
        });

        this.gameState.setGamePiece(newPiece);

        if (this.collision()) {
            this.gameOver();
        }
    }

    private loadBullpen(): void {
        this.gameState.nextStandbyPiece();
        const newPiece = new Piece(this.gameState.getStandbyPiece(), { x: 0, y: 0 });
        this.gameState.setBullpenPiece(newPiece);
        this.renderer.loadBullpen(this.gameState);
    }

    private run(t = 0): void {
        const delta = t - this.time;
        this.dropCounter += delta;

        if (this.dropCounter > this.gameState.getDropSpeed()) {
            this.dropShape();
        }

        this.time = t;
        this.renderer.redrawCanvases(this.gameState);
        this.cancelId = requestAnimationFrame(this.run.bind(this));
    }

    private gameOver(): void {
        cancelAnimationFrame(this.cancelId);
        this.renderer.drawGameOver();
        this.inputHandler.disableGameControls();
    }

    public startGame(): void {
        this.gameState.reset();
        this.standby = this.gameState.assignPiece();
        this.renderer.displayScore(this.gameState);
        this.renderer.updateStatistics(this.gameState);
        this.initiateNewGamePiece(this.standby);
        this.loadBullpen();
        this.run();
    }
}