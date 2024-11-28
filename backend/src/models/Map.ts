import { ObjectId } from 'mongodb';
import { db } from '../db/database';

export interface MapTile {
    x: number;
    y: number;
    height: number;
    type: string;
    properties?: Record<string, any>;
}

export interface GameMap {
    _id?: ObjectId;
    name: string;
    width: number;
    height: number;
    tiles: MapTile[];
    createdAt: Date;
    updatedAt: Date;
}

export class MapService {
    private collection = db.collection<GameMap>('maps');

    async createMap(mapData: Omit<GameMap, '_id' | 'createdAt' | 'updatedAt'>): Promise<GameMap> {
        try {
            console.log('Creating map with data:', mapData);
            const now = new Date();
            const map: GameMap = {
                ...mapData,
                createdAt: now,
                updatedAt: now
            };
            
            const result = await this.collection.insertOne(map);
            console.log('Map created with ID:', result.insertedId);
            return { ...map, _id: result.insertedId };
        } catch (error) {
            console.error('Error in createMap:', error);
            throw error;
        }
    }

    async getMap(mapId: string): Promise<GameMap | null> {
        try {
            return await this.collection.findOne({ _id: new ObjectId(mapId) });
        } catch (error) {
            console.error('Error in getMap:', error);
            throw error;
        }
    }

    async updateMapTile(mapId: string, x: number, y: number, tileData: Partial<MapTile>): Promise<boolean> {
        try {
            const map = await this.getMap(mapId);
            if (!map) return false;

            const tileIndex = map.tiles.findIndex(tile => tile.x === x && tile.y === y);
            if (tileIndex === -1) return false;

            map.tiles[tileIndex] = { ...map.tiles[tileIndex], ...tileData };
            map.updatedAt = new Date();

            // Save the updated map
            await this.collection.updateOne({ _id: map._id }, { $set: map });
            return true;
        } catch (error) {
            console.error('Error in updateMapTile:', error);
            throw error;
        }
    }

    async createTestMap(): Promise<GameMap> {
        try {
            console.log('Starting test map creation...');
            const mapData: Omit<GameMap, '_id' | 'createdAt' | 'updatedAt'> = {
                name: 'Test Map',
                width: 10,
                height: 10,
                tiles: []
            };

            // Generate a simple heightmap
            for (let x = 0; x < mapData.width; x++) {
                for (let y = 0; y < mapData.height; y++) {
                    const height = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 2;
                    mapData.tiles.push({
                        x,
                        y,
                        height,
                        type: height > 1 ? 'mountain' : height > 0 ? 'hill' : 'plain'
                    });
                }
            }

            console.log('Test map data generated, creating map...');
            return this.createMap(mapData);
        } catch (error) {
            console.error('Error in createTestMap:', error);
            throw error;
        }
    }
}
