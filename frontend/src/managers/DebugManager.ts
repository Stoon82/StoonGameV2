import { Manager } from './Manager';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

export class DebugManager extends Manager {
    private static _instance: DebugManager;
    private stats: Stats;
    private debugMode: boolean = false;
    private debugObjects: THREE.Object3D[] = [];
    private debugInfo: HTMLDivElement;

    private constructor() {
        super();
    }

    public static getInstance(): DebugManager {
        if (!DebugManager._instance) {
            DebugManager._instance = new DebugManager();
        }
        return DebugManager._instance;
    }

    public init(): void {
        if (this.isInitialized) return;

        // Initialize Stats
        this.stats = new Stats();
        this.stats.dom.style.display = 'none';
        document.body.appendChild(this.stats.dom);

        // Create debug info panel
        this.debugInfo = document.createElement('div');
        this.debugInfo.style.position = 'absolute';
        this.debugInfo.style.top = '10px';
        this.debugInfo.style.left = '10px';
        this.debugInfo.style.color = 'white';
        this.debugInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.debugInfo.style.padding = '10px';
        this.debugInfo.style.fontFamily = 'monospace';
        this.debugInfo.style.display = 'none';
        document.body.appendChild(this.debugInfo);

        // Setup debug mode toggle
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Shift') {
                this.toggleDebugMode(true);
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'Shift') {
                this.toggleDebugMode(false);
            }
        });

        this.isInitialized = true;
    }

    public toggleDebugMode(enabled: boolean): void {
        this.debugMode = enabled;
        this.stats.dom.style.display = enabled ? 'block' : 'none';
        this.debugInfo.style.display = enabled ? 'block' : 'none';
        this.debugObjects.forEach(obj => obj.visible = enabled);
    }

    public update(deltaTime: number): void {
        if (!this.isInitialized || !this.debugMode) return;

        this.stats.update();
        this.updateDebugInfo(deltaTime);
    }

    private updateDebugInfo(deltaTime: number): void {
        const fps = Math.round(1 / deltaTime);
        this.debugInfo.innerHTML = `
            FPS: ${fps}<br>
            Debug Mode: Active<br>
            Time: ${new Date().toLocaleTimeString()}<br>
        `;
    }

    public addDebugObject(object: THREE.Object3D): void {
        object.visible = this.debugMode;
        this.debugObjects.push(object);
    }

    public removeDebugObject(object: THREE.Object3D): void {
        const index = this.debugObjects.indexOf(object);
        if (index !== -1) {
            this.debugObjects.splice(index, 1);
        }
    }

    public dispose(): void {
        if (!this.isInitialized) return;

        document.body.removeChild(this.stats.dom);
        document.body.removeChild(this.debugInfo);
        this.debugObjects = [];
        this.isInitialized = false;
    }
}
