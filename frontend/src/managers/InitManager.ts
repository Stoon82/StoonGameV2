import { Manager } from './Manager';
import { GameManager } from './GameManager';
import { DebugManager } from './DebugManager';
import { UIManager } from './UIManager';
import { InputManager } from './InputManager';

export class InitManager extends Manager {
    private static _instance: InitManager;
    private managers: Manager[] = [];

    private constructor() {
        super();
    }

    public static getInstance(): InitManager {
        if (!InitManager._instance) {
            InitManager._instance = new InitManager();
        }
        return InitManager._instance;
    }

    public init(): void {
        if (this.isInitialized) return;

        // Initialize all managers in the correct order
        this.managers = [
            InputManager.getInstance(),
            UIManager.getInstance(),
            GameManager.getInstance(),
            DebugManager.getInstance()
        ];

        // Initialize each manager
        this.managers.forEach(manager => manager.init());

        // Start the game loop
        this.startGameLoop();

        // Setup window resize handler
        window.addEventListener('resize', this.handleResize.bind(this));

        this.isInitialized = true;
    }

    private startGameLoop(): void {
        const animate = (currentTime: number) => {
            // Update all managers
            this.managers.forEach(manager => manager.update(currentTime));
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    private handleResize(): void {
        GameManager.getInstance().onWindowResize();
        UIManager.getInstance().onWindowResize();
    }

    public update(deltaTime: number): void {
        // InitManager doesn't need to update
    }

    public dispose(): void {
        if (!this.isInitialized) return;

        // Dispose all managers in reverse order
        [...this.managers].reverse().forEach(manager => manager.dispose());
        this.managers = [];
        window.removeEventListener('resize', this.handleResize);
        this.isInitialized = false;
    }
}
