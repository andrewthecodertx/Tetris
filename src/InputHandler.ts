export class InputHandler {
    private keydownHandler: (event: KeyboardEvent) => void;

    constructor(
        private shiftShape: (offset: number) => void,
        private dropShape: () => void,
        private rotateShape: (direction: number) => void,
        private startGame: () => void
    ) {
        this.keydownHandler = this.kbcontrols.bind(this);
        document.addEventListener("keydown", this.keydownHandler);
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
            document.removeEventListener("keydown", this.keydownHandler);
            this.keydownHandler = this.playercontrols.bind(this);
            document.addEventListener("keydown", this.keydownHandler);
            this.startGame();
        }
    }

    public enableGameControls(): void {
        document.removeEventListener("keydown", this.keydownHandler);
        this.keydownHandler = this.playercontrols.bind(this);
        document.addEventListener("keydown", this.keydownHandler);
    }

    public disableGameControls(): void {
        document.removeEventListener("keydown", this.keydownHandler);
        this.keydownHandler = this.kbcontrols.bind(this);
        document.addEventListener("keydown", this.keydownHandler);
    }
}
