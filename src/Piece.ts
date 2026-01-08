import type { Position } from './GameState';

export class Piece {
    public position: Position;
    public matrix: number[][];

    constructor(shape: string, position: Position) {
        this.matrix = this.createPiece(shape);
        this.position = position;
    }

    private createPiece(shape: string): number[][] {
        switch (shape) {
            case "I": return [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            case "J": return [
                [2, 0, 0],
                [2, 2, 2],
                [0, 0, 0],
            ];
            case "L": return [
                [0, 0, 3],
                [3, 3, 3],
                [0, 0, 0],
            ];
            case "O": return [
                [4, 4],
                [4, 4],
            ];
            case "S": return [
                [0, 5, 5],
                [5, 5, 0],
                [0, 0, 0],
            ];
            case "T": return [
                [0, 6, 0],
                [6, 6, 6],
                [0, 0, 0],
            ];
            case "Z": return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
            default:
                throw new Error('Invalid piece shape');
        }
    }
}
