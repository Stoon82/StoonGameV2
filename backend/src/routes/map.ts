import express from 'express';
import { MapService } from '../models/Map';
import { auth } from '../middleware/auth';

const router = express.Router();
const mapService = new MapService();

// Get a specific map
router.get('/:mapId', auth, async (req, res) => {
    try {
        const map = await mapService.getMap(req.params.mapId);
        if (!map) {
            return res.status(404).json({ error: 'Map not found' });
        }
        res.json(map);
    } catch (error) {
        console.error('Error in GET /:mapId:', error);
        res.status(500).json({ error: 'Error retrieving map' });
    }
});

// Create a new map
router.post('/', auth, async (req, res) => {
    try {
        const map = await mapService.createMap(req.body);
        res.status(201).json(map);
    } catch (error) {
        console.error('Error creating map:', error);
        res.status(400).json({ error: 'Error creating map' });
    }
});

// Update a tile in the map
router.patch('/:mapId/tile', auth, async (req, res) => {
    try {
        const { x, y, ...tileData } = req.body;
        const success = await mapService.updateMapTile(req.params.mapId, x, y, tileData);
        if (!success) {
            return res.status(404).json({ error: 'Map or tile not found' });
        }
        res.json({ message: 'Tile updated successfully' });
    } catch (error) {
        console.error('Error in PATCH /:mapId/tile:', error);
        res.status(500).json({ error: 'Error updating tile' });
    }
});

// Fetch map data around player's position
router.post('/:mapId/data', auth, async (req, res) => {
    try {
        const { position, viewDistance } = req.body;
        const map = await mapService.getMap(req.params.mapId);
        if (!map) {
            return res.status(404).json({ error: 'Map not found' });
        }

        // Filter tiles based on player's position and view distance
        const visibleTiles = map.tiles.filter(tile => {
            const dx = tile.x - position.x;
            const dy = tile.y - position.y;
            return Math.sqrt(dx * dx + dy * dy) <= viewDistance;
        });

        res.json({ tiles: visibleTiles });
    } catch (error) {
        console.error('Error in POST /:mapId/data:', error);
        res.status(500).json({ error: 'Error retrieving map data' });
    }
});

// Create a test map (development only)
router.post('/test', auth, async (req, res) => {
    try {
        console.log('Creating test map...');
        const map = await mapService.createTestMap();
        console.log('Test map created:', map);
        res.status(201).json(map);
    } catch (error) {
        console.error('Error in POST /test:', error);
        res.status(500).json({ error: 'Error generating test map' });
    }
});

export default router;
