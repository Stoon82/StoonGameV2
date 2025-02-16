import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class StoonGame {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;

    constructor() {
        // Initialize scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background

        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;

        // Setup renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Add orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // Create initial map prototype
        this.createMapPrototype();

        // Start render loop
        this.animate();

        // Add window resize handler
        window.addEventListener('resize', () => this.onWindowResize());
    }

    private createMapPrototype() {
        // Create a basic terrain grid
        const gridHelper = new THREE.GridHelper(10, 10);
        this.scene.add(gridHelper);

        // Add some basic terrain elements
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        
        for (let i = 0; i < 5; i++) {
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                Math.random() * 10 - 5,
                0.5,
                Math.random() * 10 - 5
            );
            this.scene.add(cube);
        }
    }

    private animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    private onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
