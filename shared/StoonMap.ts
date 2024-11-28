import { MapChunk, Point } from './MapChunk';

class StoonMap {
    private chunks: MapChunk[];

    constructor() {
        this.chunks = [];
    }

    public addChunk(chunk: MapChunk): void {
        this.chunks.push(chunk);
    }

    public getPoints(): { corners: Point[]; centers: Point[] } {
        const corners: Point[] = [];
        const centers: Point[] = [];

        this.chunks.forEach(chunk => {
            corners.push(...chunk.getCornerPoints());
            centers.push(...chunk.getCenterPoints());
        });

        return { corners, centers };
    }

    public buildGeometry(): any { // Replace 'any' with the actual geometry type used by your renderer
        const { corners, centers } = this.getPoints();

        // Placeholder logic for building geometry
        // Implement the logic to create triangles using corners and centers
        const geometry = {};

        corners.forEach((corner, index) => {
            const center = centers[index % centers.length]; // Example logic
            // Build triangle geometry using corner and center points
            // Add to geometry object
        });

        return geometry;
    }
}

export { StoonMap };
