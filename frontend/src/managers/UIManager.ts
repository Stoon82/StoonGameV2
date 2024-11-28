import { Manager } from './Manager';

export class UIManager extends Manager {
    private static _instance: UIManager;
    private uiContainer: HTMLDivElement;
    private activeMenus: Map<string, HTMLElement> = new Map();

    private constructor() {
        super();
    }

    public static getInstance(): UIManager {
        if (!UIManager._instance) {
            UIManager._instance = new UIManager();
        }
        return UIManager._instance;
    }

    public init(): void {
        if (this.isInitialized) return;

        // Create main UI container
        this.uiContainer = document.createElement('div');
        this.uiContainer.id = 'game-ui';
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.top = '0';
        this.uiContainer.style.left = '0';
        this.uiContainer.style.width = '100%';
        this.uiContainer.style.height = '100%';
        this.uiContainer.style.pointerEvents = 'none'; // Allow click-through by default
        document.body.appendChild(this.uiContainer);

        // Initialize default UI elements
        this.createHUD();

        this.isInitialized = true;
    }

    private createHUD(): void {
        const hud = document.createElement('div');
        hud.id = 'game-hud';
        hud.style.position = 'absolute';
        hud.style.top = '10px';
        hud.style.right = '10px';
        hud.style.padding = '10px';
        hud.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        hud.style.color = 'white';
        hud.style.fontFamily = 'Arial, sans-serif';
        hud.style.pointerEvents = 'auto';
        
        this.uiContainer.appendChild(hud);
        this.activeMenus.set('hud', hud);
    }

    public showMenu(menuId: string, content: HTMLElement): void {
        if (this.activeMenus.has(menuId)) {
            this.hideMenu(menuId);
        }

        content.style.position = 'absolute';
        content.style.pointerEvents = 'auto';
        this.uiContainer.appendChild(content);
        this.activeMenus.set(menuId, content);
    }

    public hideMenu(menuId: string): void {
        const menu = this.activeMenus.get(menuId);
        if (menu) {
            this.uiContainer.removeChild(menu);
            this.activeMenus.delete(menuId);
        }
    }

    public updateHUD(data: Record<string, any>): void {
        const hud = this.activeMenus.get('hud');
        if (hud) {
            hud.innerHTML = Object.entries(data)
                .map(([key, value]) => `${key}: ${value}`)
                .join('<br>');
        }
    }

    public onWindowResize(): void {
        // Handle any UI scaling or repositioning needed
    }

    public update(deltaTime: number): void {
        // Update any animated UI elements
    }

    public dispose(): void {
        if (!this.isInitialized) return;

        this.activeMenus.forEach((menu) => {
            if (menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
        });
        this.activeMenus.clear();

        if (this.uiContainer.parentNode) {
            this.uiContainer.parentNode.removeChild(this.uiContainer);
        }

        this.isInitialized = false;
    }
}
