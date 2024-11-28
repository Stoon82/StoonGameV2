import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MapRenderer } from '../map/MapRenderer';
import { Manager } from './Manager';
import { InputManager } from './InputManager';
import axios from 'axios';

export class GameManager extends Manager {
    private static _instance: GameManager;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private mapRenderer: MapRenderer;
    private lastTime: number = 0;

    // New properties for ground and sphere
    private ground: THREE.Mesh;
    private followSphere: THREE.Mesh;
    private raycaster: THREE.Raycaster;
    private mousePosition: THREE.Vector2;

    private constructor() {
        super();
        this.raycaster = new THREE.Raycaster();
        this.mousePosition = new THREE.Vector2();
    }

    public static getInstance(): GameManager {
        if (!GameManager._instance) {
            GameManager._instance = new GameManager();
        }
        return GameManager._instance;
    }

    public init(): void {
        if (this.isInitialized) return;

        // Initialize scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 10);
        this.camera.lookAt(0, 0, 0);

        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        // Add orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Create ground plane
        this.createGround();

        // Create follow sphere
        this.createFollowSphere();

        // Setup mouse move handler
        InputManager.getInstance().addMouseListener('mousemove', this.handleMouseMove.bind(this));

        // Initialize map renderer
        this.mapRenderer = new MapRenderer(this.scene);

        // Load initial map
        this.loadTestMap();

        this.isInitialized = true;
        this.lastTime = performance.now();
    }

    private createGround(): void {
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x555555,
            roughness: 0.8,
            metalness: 0.2
        });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    private createFollowSphere(): void {
        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const sphereMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            roughness: 0.3,
            metalness: 0.7
        });
        this.followSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.followSphere.castShadow = true;
        this.followSphere.position.y = 0.5; // Place sphere above ground
        this.scene.add(this.followSphere);
    }

    private handleMouseMove(event: MouseEvent): void {
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update raycaster
        this.raycaster.setFromCamera(this.mousePosition, this.camera);

        // Check intersection with ground plane
        const intersects = this.raycaster.intersectObject(this.ground);
        if (intersects.length > 0) {
            const point = intersects[0].point;
            // Smoothly move sphere to intersection point
            this.followSphere.position.x += (point.x - this.followSphere.position.x) * 0.1;
            this.followSphere.position.z += (point.z - this.followSphere.position.z) * 0.1;
        }
    }

    private async loadTestMap() {
        try {
            const response = await axios.post('/api/maps/test', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            this.mapRenderer.renderMap(response.data);
        } catch (error) {
            console.error('Error loading test map:', error);
        }
    }

    public update(currentTime: number): void {
        if (!this.isInitialized) return;

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    public onWindowResize(): void {
        if (!this.isInitialized) return;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    public dispose(): void {
        if (!this.isInitialized) return;

        this.mapRenderer.dispose();
        this.renderer.dispose();
        this.scene.clear();
        this.isInitialized = false;
    }
}
