import express from 'express';
import { MapService } from '../models/Map';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const mapService = new MapService();

// Get a specific map
router.get('/:mapId', authenticateToken, async (req, res) => {
    try {
        const map = await mapService.getMap(req.params.mapId);
        if (!map) {
            return res.status(404).json({ message: 'Map not found' });
        }
        res.json(map);
    } catch (error) {
        console.error('Error in GET /:mapId:', error);
        res.status(500).json({ message: 'Error fetching map', error: error.message });
    }
});

// Create a new map
router.post('/', authenticateToken, async (req, res) => {
    try {
        const map = await mapService.createMap(req.body);
        res.status(201).json(map);
    } catch (error) {
        console.error('Error in POST /:', error);
        res.status(500).json({ message: 'Error creating map', error: error.message });
    }
});

// Update a tile in the map
router.patch('/:mapId/tile', authenticateToken, async (req, res) => {
    try {
        const { x, y, ...tileData } = req.body;
        const success = await mapService.updateMapTile(req.params.mapId, x, y, tileData);
        if (!success) {
            return res.status(404).json({ message: 'Map or tile not found' });
        }
        res.json({ message: 'Tile updated successfully' });
    } catch (error) {
        console.error('Error in PATCH /:mapId/tile:', error);
        res.status(500).json({ message: 'Error updating tile', error: error.message });
    }
});

// Create a test map (development only)
router.post('/test', authenticateToken, async (req, res) => {
    try {
        console.log('Creating test map...');
        const map = await mapService.createTestMap();
        console.log('Test map created:', map);
        res.status(201).json(map);
    } catch (error) {
        console.error('Error in POST /test:', error);
        res.status(500).json({ message: 'Error creating test map', error: error.message });
    }
});

export default router;
