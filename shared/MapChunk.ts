interface Point {
    worldPosition: { x: number; y: number; z: number };
    gridCoordinates: { x: number; y: number };
    groundTypeIndex: number;
}

class MapChunk {
    private cornerPoints: Point[];
    private centerPoints: Point[];

    constructor() {
        this.cornerPoints = [];
        this.centerPoints = [];
    }

    public addCornerPoint(point: Point): void {
        this.cornerPoints.push(point);
    }

    public addCenterPoint(point: Point): void {
        this.centerPoints.push(point);
    }

    public getCornerPoints(): Point[] {
        return this.cornerPoints;
    }

    public getCenterPoints(): Point[] {
        return this.centerPoints;
    }

    // Placeholder for octree sorting - to be implemented
    public sortPointsUsingOctree(): void {
        // Implement octree sorting logic here
    }
}

export { MapChunk, Point };
