import * as THREE from 'three';
import { StoonMap } from '../shared/StoonMap';
import { MapChunk, Point } from '../shared/MapChunk';

class ExampleRenderer {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);

        this.addLight();
        this.stoonMap = this.createMap();
        this.renderMap();
    }

    addLight() {
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);
    }

    createMap() {
        const stoonMap = new StoonMap();
        const cornerPoints = [
            { worldPosition: { x: 0, y: 0, z: 0 }, gridCoordinates: { x: 0, y: 0 }, groundTypeIndex: 1 },
            { worldPosition: { x: 1, y: 0, z: 0 }, gridCoordinates: { x: 1, y: 0 }, groundTypeIndex: 1 },
            { worldPosition: { x: 1, y: 0, z: 1 }, gridCoordinates: { x: 1, y: 1 }, groundTypeIndex: 1 },
            { worldPosition: { x: 0, y: 0, z: 1 }, gridCoordinates: { x: 0, y: 1 }, groundTypeIndex: 1 }
        ];

        const centerPoints = [
            { worldPosition: { x: 0.5, y: 0, z: 0.5 }, gridCoordinates: { x: 0.5, y: 0.5 }, groundTypeIndex: 1 }
        ];

        const chunk = new MapChunk();
        cornerPoints.forEach(point => chunk.addCornerPoint(point));
        centerPoints.forEach(point => chunk.addCenterPoint(point));

        stoonMap.addChunk(chunk);
        return stoonMap;
    }

    renderMap() {
        const { corners, centers } = this.stoonMap.getPoints();

        corners.forEach((corner, index) => {
            const center = centers[index % centers.length];
            const geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3(center.worldPosition.x, center.worldPosition.y, center.worldPosition.z),
                new THREE.Vector3(corner.worldPosition.x, corner.worldPosition.y, corner.worldPosition.z),
                new THREE.Vector3(corners[(index + 1) % corners.length].worldPosition.x, corners[(index + 1) % corners.length].worldPosition.y, corners[(index + 1) % corners.length].worldPosition.z)
            );

            geometry.faces.push(new THREE.Face3(0, 1, 2));
            geometry.computeFaceNormals();

            const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);
            this.scene.add(mesh);
        });

        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}

export default ExampleRenderer;

// Initialize the renderer
document.addEventListener('DOMContentLoaded', () => {
    new ExampleRenderer();
});
