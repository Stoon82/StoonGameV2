import { Manager } from './Manager';

type InputCallback = (event: KeyboardEvent | MouseEvent) => void;

export class InputManager extends Manager {
    private static _instance: InputManager;
    private keyStates: Map<string, boolean> = new Map();
    private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
    private mouseButtons: Map<number, boolean> = new Map();
    private keyCallbacks: Map<string, Set<InputCallback>> = new Map();
    private mouseCallbacks: Map<string, Set<InputCallback>> = new Map();

    private constructor() {
        super();
    }

    public static getInstance(): InputManager {
        if (!InputManager._instance) {
            InputManager._instance = new InputManager();
        }
        return InputManager._instance;
    }

    public init(): void {
        if (this.isInitialized) return;

        // Setup keyboard listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));

        // Setup mouse listeners
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('mousedown', this.handleMouseDown.bind(this));
        window.addEventListener('mouseup', this.handleMouseUp.bind(this));
        window.addEventListener('contextmenu', (e) => e.preventDefault());

        this.isInitialized = true;
    }

    private handleKeyDown(event: KeyboardEvent): void {
        this.keyStates.set(event.key.toLowerCase(), true);
        const callbacks = this.keyCallbacks.get('keydown');
        callbacks?.forEach(callback => callback(event));
    }

    private handleKeyUp(event: KeyboardEvent): void {
        this.keyStates.set(event.key.toLowerCase(), false);
        const callbacks = this.keyCallbacks.get('keyup');
        callbacks?.forEach(callback => callback(event));
    }

    private handleMouseMove(event: MouseEvent): void {
        this.mousePosition.x = event.clientX;
        this.mousePosition.y = event.clientY;
        const callbacks = this.mouseCallbacks.get('mousemove');
        callbacks?.forEach(callback => callback(event));
    }

    private handleMouseDown(event: MouseEvent): void {
        this.mouseButtons.set(event.button, true);
        const callbacks = this.mouseCallbacks.get('mousedown');
        callbacks?.forEach(callback => callback(event));
    }

    private handleMouseUp(event: MouseEvent): void {
        this.mouseButtons.set(event.button, false);
        const callbacks = this.mouseCallbacks.get('mouseup');
        callbacks?.forEach(callback => callback(event));
    }

    public isKeyPressed(key: string): boolean {
        return this.keyStates.get(key.toLowerCase()) || false;
    }

    public isMouseButtonPressed(button: number): boolean {
        return this.mouseButtons.get(button) || false;
    }

    public getMousePosition(): { x: number; y: number } {
        return { ...this.mousePosition };
    }

    public addKeyListener(type: 'keydown' | 'keyup', callback: InputCallback): void {
        if (!this.keyCallbacks.has(type)) {
            this.keyCallbacks.set(type, new Set());
        }
        this.keyCallbacks.get(type)!.add(callback);
    }

    public removeKeyListener(type: 'keydown' | 'keyup', callback: InputCallback): void {
        this.keyCallbacks.get(type)?.delete(callback);
    }

    public addMouseListener(type: 'mousemove' | 'mousedown' | 'mouseup', callback: InputCallback): void {
        if (!this.mouseCallbacks.has(type)) {
            this.mouseCallbacks.set(type, new Set());
        }
        this.mouseCallbacks.get(type)!.add(callback);
    }

    public removeMouseListener(type: 'mousemove' | 'mousedown' | 'mouseup', callback: InputCallback): void {
        this.mouseCallbacks.get(type)?.delete(callback);
    }

    public update(deltaTime: number): void {
        // Update any input-related logic here
    }

    public dispose(): void {
        if (!this.isInitialized) return;

        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mouseup', this.handleMouseUp);

        this.keyStates.clear();
        this.mouseButtons.clear();
        this.keyCallbacks.clear();
        this.mouseCallbacks.clear();

        this.isInitialized = false;
    }
}
