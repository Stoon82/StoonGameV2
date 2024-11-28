import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import jwt from 'jsonwebtoken';
import { UserService } from './models/User';
import { auth } from './middleware/auth';
import dotenv from 'dotenv';
import cors from 'cors';
import { db } from './db/database';
import mapRoutes from './routes/map';
import fs from 'fs';
import { MapService, GameMap, MapTile } from './models/Map';

dotenv.config();

class GameServer {
    private app: express.Application;
    private server: http.Server;
    private io: Server;
    private userService: UserService;
    private port: number;

    constructor() {
        this.port = parseInt(process.env.PORT || '3000');
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
                methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                allowedHeaders: ["Content-Type", "Authorization"],
                credentials: true
            }
        });

        this.userService = new UserService();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketEvents();
        this.connectToDatabase();
    }

    private async connectToDatabase() {
        try {
            await db.connect();
            console.log('Database ready');

            // Check for 'Default Map'
            const mapsPath = path.join(__dirname, '../../data/maps.json');
            const mapsData = JSON.parse(fs.readFileSync(mapsPath, 'utf-8'));

            const defaultMap = mapsData.find((map: any) => map.name === 'Default Map');
            if (!defaultMap) {
                console.log('Default Map not found, creating...');
                const newMap = await this.createDefaultMap();
                mapsData.push(newMap);
                fs.writeFileSync(mapsPath, JSON.stringify(mapsData, null, 2));
                console.log('Default Map created and saved.');
            } else {
                console.log('Default Map already exists.');
            }
        } catch (error) {
            console.error('Database connection error:', error);
        }
    }

    private async createDefaultMap() {
        // Logic to create a default map
        const mapService = new MapService();
        const defaultMapData: Omit<GameMap, '_id' | 'createdAt' | 'updatedAt'> = {
            name: 'Default Map',
            width: 10,
            height: 10,
            tiles: [] as MapTile[],
            zoom: 1 // Example zoom level
        };

        // Generate a simple heightmap
        for (let x = 0; x < defaultMapData.width; x++) {
            for (let y = 0; y < defaultMapData.height; y++) {
                const height = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 2;
                defaultMapData.tiles.push({
                    x,
                    y,
                    height,
                    centerType: height > 1 ? 'mountain' : height > 0 ? 'hill' : 'plain',
                    cornerType_a: 'plain',
                    cornerType_b: 'plain',
                    cornerType_c: 'plain',
                    cornerType_d: 'plain'
                });
            }
        }

        return mapService.createMap(defaultMapData);
    }

    private setupMiddleware() {
        // Enable pre-flight requests for all routes
        this.app.options('*', cors());
        
        // Apply CORS middleware with specific configuration
        this.app.use(cors({
            origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true
        }));

        // Parse JSON bodies
        this.app.use(express.json());
    }

    private setupRoutes() {
        // Add CORS headers to all responses
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', req.headers.origin || "http://localhost:5173");
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.header('Access-Control-Allow-Credentials', 'true');
            if (req.method === 'OPTIONS') {
                return res.sendStatus(200);
            }
            next();
        });

        // Serve static files
        this.app.use(express.static(path.join(__dirname, '../../frontend')));

        // Authentication routes
        this.app.post('/api/register', async (req, res) => {
            try {
                const { username, email, password } = req.body;
                
                // Check if user already exists
                const existingUser = await this.userService.findByEmail(email);
                if (existingUser) {
                    return res.status(400).json({ error: 'Email already exists' });
                }

                const user = await this.userService.create({ username, email, password });
                const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!);
                
                res.status(201).json({ 
                    user: { 
                        _id: user._id, 
                        username: user.username, 
                        email: user.email 
                    }, 
                    token 
                });
            } catch (error) {
                console.error('Registration error:', error);
                res.status(400).json({ error: 'Registration failed' });
            }
        });

        this.app.post('/api/login', async (req, res) => {
            try {
                const { email, password } = req.body;
                const user = await this.userService.findByEmail(email);
                
                if (!user) {
                    return res.status(401).json({ error: 'Invalid login credentials' });
                }

                const isMatch = await this.userService.comparePassword(user, password);
                if (!isMatch) {
                    return res.status(401).json({ error: 'Invalid login credentials' });
                }

                const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!);
                res.json({ 
                    user: { 
                        _id: user._id, 
                        username: user.username, 
                        email: user.email 
                    }, 
                    token 
                });
            } catch (error) {
                console.error('Login error:', error);
                res.status(400).json({ error: 'Login failed' });
            }
        });

        // Protected route example
        this.app.get('/api/profile', auth, async (req: any, res) => {
            try {
                const user = await this.userService.findById(req.user._id);
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                res.json({ 
                    _id: user._id, 
                    username: user.username, 
                    email: user.email 
                });
            } catch (error) {
                console.error('Profile error:', error);
                res.status(500).json({ error: 'Server error' });
            }
        });

        // Map routes
        this.app.use('/api/maps', mapRoutes);

        // Health check route
        this.app.get('/api/health', (req, res) => {
            res.json({ status: 'Server is running' });
        });

        // Error handling middleware
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error('Global error handler:', err);
            res.status(500).json({ 
                message: 'Internal server error', 
                error: process.env.NODE_ENV === 'development' ? err.message : undefined 
            });
        });
    }

    private setupSocketEvents() {
        this.io.on('connection', (socket) => {
            console.log('New client connected');
            
            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }

    public start() {
        this.server.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
}

const gameServer = new GameServer();
gameServer.start();
