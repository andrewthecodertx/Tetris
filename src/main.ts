import { Game } from './Game.ts';
import '/public/styles/styles.css';

const canvas = document.getElementById("gamearena") as HTMLCanvasElement;
const bpcanvas = document.getElementById("bullpen") as HTMLCanvasElement;

new Game(canvas, bpcanvas);
