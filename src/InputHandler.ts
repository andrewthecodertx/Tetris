export class InputHandler {
    private keydownHandler: (event: KeyboardEvent) => void;
    private shiftLeftHandler: () => void;
    private shiftRightHandler: () => void;
    private rotateHandler: () => void;
    private dropHandler: () => void;

    constructor(
        private shiftShape: (offset: number) => void,
        private dropShape: () => void,
        private rotateShape: (direction: number) => void,
        private startGame: () => void
    ) {
        this.keydownHandler = this.kbcontrols.bind(this);
        document.addEventListener("keydown", this.keydownHandler);

        this.shiftLeftHandler = () => this.shiftShape(-1);
        this.shiftRightHandler = () => this.shiftShape(1);
        this.rotateHandler = () => this.rotateShape(1);
        this.dropHandler = () => this.dropShape();
    }

    private addTouchControls(): void {
        document.getElementById('left-btn')?.addEventListener('click', this.shiftLeftHandler);
        document.getElementById('right-btn')?.addEventListener('click', this.shiftRightHandler);
        document.getElementById('rotate-btn')?.addEventListener('click', this.rotateHandler);
        document.getElementById('down-btn')?.addEventListener('click', this.dropHandler);
    }

    private removeTouchControls(): void {
        document.getElementById('left-btn')?.removeEventListener('click', this.shiftLeftHandler);
        document.getElementById('right-btn')?.removeEventListener('click', this.shiftRightHandler);
        document.getElementById('rotate-btn')?.removeEventListener('click', this.rotateHandler);
        document.getElementById('down-btn')?.removeEventListener('click', this.dropHandler);
    }

    private playercontrols(event: KeyboardEvent): void {
        switch (event.code) {
            case "ArrowLeft":
            case "KeyH":
                this.shiftShape(-1);
                break;
            case "ArrowRight":
            case "KeyL":
                this.shiftShape(1);
                break;
            case "ArrowDown":
            case "KeyJ":
                this.dropShape();
                break;
            case "KeyD":
                this.rotateShape(1);
                break;
            case "KeyA":
                this.rotateShape(-1);
                break;
        }
    }

    private kbcontrols(event: KeyboardEvent): void {
        if (event.code === "Space") {
            this.enableGameControls();
            this.startGame();
        }
    }

    public enableGameControls(): void {
        document.removeEventListener("keydown", this.keydownHandler);
        this.keydownHandler = this.playercontrols.bind(this);
        document.addEventListener("keydown", this.keydownHandler);
        this.addTouchControls();
    }

    public disableGameControls(): void {
        document.removeEventListener("keydown", this.keydownHandler);
        this.keydownHandler = this.kbcontrols.bind(this);
        document.addEventListener("keydown", this.keydownHandler);
        this.removeTouchControls();
    }
}