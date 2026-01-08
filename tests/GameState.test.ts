import { GameState } from '../src/GameState';
import { Piece } from '../src/Piece';

describe('GameState', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  it('should initialize with default values', () => {
    const stats = gameState.getStats();
    expect(stats.score).toBe(0);
    expect(stats.level).toBe(1);
    expect(stats.lines).toBe(0);
    expect(stats.dropSpeed).toBe(1000);
    expect(gameState.getGameArena().length).toBe(20);
    expect(gameState.getGameArena()[0].length).toBe(10);
  });

  it('should clear a full row', () => {
    const arena = gameState.getGameArena();
    // Fill the last row completely
    for (let i = 0; i < arena[0].length; i++) {
      arena[arena.length - 1][i] = 1;
    }
    const clearedRows = gameState.clearRows();
    expect(clearedRows).toBe(1);
    // Check if the last row is now all zeros
    expect(arena[arena.length - 1].every(cell => cell === 0)).toBe(true);
    // Check if a new row has been added at the top
    expect(arena[0].every(cell => cell === 0)).toBe(true);
  });

  it('should not clear an incomplete row', () => {
    const arena = gameState.getGameArena();
    // Fill the last row partially
    arena[arena.length - 1][0] = 1;
    arena[arena.length - 1][5] = 1;
    const clearedRows = gameState.clearRows();
    expect(clearedRows).toBe(0);
    expect(arena[arena.length - 1].some(cell => cell !== 0)).toBe(true);
  });

  it('should update the score, lines, and level correctly', () => {
    gameState.updateScore(1);
    let stats = gameState.getStats();
    expect(stats.score).toBe(10);
    expect(stats.lines).toBe(1);
    expect(stats.level).toBe(1);

    gameState.updateScore(3);
    stats = gameState.getStats();
    expect(stats.score).toBe(40);
    expect(stats.lines).toBe(4);
    expect(stats.level).toBe(1);

    // 40 + 10 = 50, which is > 49 * 1, so level up
    gameState.updateScore(1);
    stats = gameState.getStats();
    expect(stats.score).toBe(50);
    expect(stats.lines).toBe(5);
    expect(stats.level).toBe(2);
    expect(stats.dropSpeed).toBe(800);
  });

  it('should fuse a piece into the arena', () => {
    const piece = new Piece('T', { x: 3, y: 17 });
    gameState.setGamePiece(piece);
    gameState.fuseGamePiece();

    const arena = gameState.getGameArena();
    // From the T shape: [0,6,0], [6,6,6], [0,0,0]
    // at position x:3, y:17
    expect(arena[17][4]).toBe(6); // top part of T
    expect(arena[18][3]).toBe(6); // bottom-left
    expect(arena[18][4]).toBe(6); // bottom-middle
    expect(arena[18][5]).toBe(6); // bottom-right
  });
});
