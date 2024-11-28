import { MapChunk, Point } from './MapChunk';

export class StoonMap {
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
        return { corners, centers };
    }
}
