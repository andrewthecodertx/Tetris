import { Piece } from '../src/Piece';

describe('Piece', () => {
  it('should create an I piece with the correct matrix', () => {
    const piece = new Piece('I', { x: 0, y: 0 });
    const expectedMatrix = [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    expect(piece.matrix).toEqual(expectedMatrix);
  });

  it('should create a J piece with the correct matrix', () => {
    const piece = new Piece('J', { x: 0, y: 0 });
    const expectedMatrix = [
      [2, 0, 0],
      [2, 2, 2],
      [0, 0, 0],
    ];
    expect(piece.matrix).toEqual(expectedMatrix);
  });

  it('should create an L piece with the correct matrix', () => {
    const piece = new Piece('L', { x: 0, y: 0 });
    const expectedMatrix = [
      [0, 0, 3],
      [3, 3, 3],
      [0, 0, 0],
    ];
    expect(piece.matrix).toEqual(expectedMatrix);
  });

  it('should create an O piece with the correct matrix', () => {
    const piece = new Piece('O', { x: 0, y: 0 });
    const expectedMatrix = [
      [4, 4],
      [4, 4],
    ];
    expect(piece.matrix).toEqual(expectedMatrix);
  });

  it('should create an S piece with the correct matrix', () => {
    const piece = new Piece('S', { x: 0, y: 0 });
    const expectedMatrix = [
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0],
    ];
    expect(piece.matrix).toEqual(expectedMatrix);
  });

  it('should create a T piece with the correct matrix', () => {
    const piece = new Piece('T', { x: 0, y: 0 });
    const expectedMatrix = [
      [0, 6, 0],
      [6, 6, 6],
      [0, 0, 0],
    ];
    expect(piece.matrix).toEqual(expectedMatrix);
  });

  it('should create a Z piece with the correct matrix', () => {
    const piece = new Piece('Z', { x: 0, y: 0 });
    const expectedMatrix = [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ];
    expect(piece.matrix).toEqual(expectedMatrix);
  });

  it('should throw an error for an invalid piece shape', () => {
    expect(() => new Piece('X', { x: 0, y: 0 })).toThrow('Invalid piece shape');
  });
});
