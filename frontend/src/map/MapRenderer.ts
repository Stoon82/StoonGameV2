import * as THREE from 'three';
import { GameMap, MapTile } from '../../../backend/src/models/Map';

export class MapRenderer {
    private scene: THREE.Scene;
    private tileGeometry: THREE.PlaneGeometry;
    private materials: Record<string, THREE.Material>;
    private tiles: THREE.Mesh[] = [];

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.tileGeometry = new THREE.PlaneGeometry(1, 1);
        
        // Create materials for different tile types
        this.materials = {
            plain: new THREE.MeshStandardMaterial({ 
                color: 0x90EE90,  // Light green
                roughness: 0.8 
            }),
            hill: new THREE.MeshStandardMaterial({ 
                color: 0x808000,  // Olive
                roughness: 0.9 
            }),
            mountain: new THREE.MeshStandardMaterial({ 
                color: 0x808080,  // Gray
                roughness: 1.0 
            })
        };

        // Add lighting
        this.setupLighting();
    }

    private setupLighting() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Add directional light
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 5, 5);
        dirLight.castShadow = true;
        this.scene.add(dirLight);
    }

    public renderMap(map: GameMap) {
        // Clear existing tiles
        this.clearMap();

        // Create a group to hold all tiles
        const mapGroup = new THREE.Group();

        // Center the map
        mapGroup.position.set(-map.width / 2, -map.height / 2, 0);

        // Create tiles
        map.tiles.forEach(tile => {
            const mesh = this.createTileMesh(tile);
            this.tiles.push(mesh);
            mapGroup.add(mesh);
        });

        this.scene.add(mapGroup);
    }

    private createTileMesh(tile: MapTile): THREE.Mesh {
        const material = this.materials[tile.type] || this.materials.plain;
        const mesh = new THREE.Mesh(this.tileGeometry, material);

        // Position the tile
        mesh.position.set(tile.x + 0.5, tile.y + 0.5, tile.height);
        mesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal

        // Add shadows
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    public updateTile(x: number, y: number, tileData: Partial<MapTile>) {
        const tile = this.tiles.find(mesh => 
            mesh.position.x === x + 0.5 && mesh.position.y === y + 0.5
        );

        if (tile && tileData.type && this.materials[tileData.type]) {
            tile.material = this.materials[tileData.type];
        }

        if (tile && tileData.height !== undefined) {
            tile.position.z = tileData.height;
        }
    }

    private clearMap() {
        this.tiles.forEach(tile => {
            this.scene.remove(tile);
            tile.geometry.dispose();
            (tile.material as THREE.Material).dispose();
        });
        this.tiles = [];
    }

    public dispose() {
        this.clearMap();
        this.tileGeometry.dispose();
        Object.values(this.materials).forEach(material => material.dispose());
    }
}
