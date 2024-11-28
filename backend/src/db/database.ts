import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';

interface Collection<T> {
    findOne(query: Partial<T>): Promise<T | null>;
    insertOne(doc: Omit<T, '_id'>): Promise<{ insertedId: ObjectId }>;
}

interface BaseDocument {
    _id?: ObjectId;
    [key: string]: any;
}

class JsonCollection<T extends BaseDocument> implements Collection<T> {
    private data: T[] = [];
    private filePath: string;

    constructor(collectionName: string) {
        this.filePath = path.join(__dirname, `../../../data/${collectionName}.json`);
        this.loadData();
    }

    private loadData() {
        try {
            if (fs.existsSync(this.filePath)) {
                const fileContent = fs.readFileSync(this.filePath, 'utf-8');
                const parsedData = JSON.parse(fileContent);
                // Convert string _id back to ObjectId
                this.data = parsedData.map((item: any) => ({
                    ...item,
                    _id: item._id ? new ObjectId(item._id) : new ObjectId()
                }));
            } else {
                // Ensure the directory exists
                const dir = path.dirname(this.filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                // Create empty collection file
                this.saveData();
            }
        } catch (error) {
            console.error(`Error loading ${this.filePath}:`, error);
            this.data = [];
        }
    }

    private saveData() {
        try {
            // Convert ObjectId to string for JSON storage
            const dataToSave = this.data.map(item => ({
                ...item,
                _id: item._id?.toString()
            }));
            fs.writeFileSync(this.filePath, JSON.stringify(dataToSave, null, 2));
        } catch (error) {
            console.error(`Error saving ${this.filePath}:`, error);
        }
    }

    async findOne(query: Partial<T>): Promise<T | null> {
        return this.data.find(item => {
            return Object.entries(query).every(([key, value]) => {
                if (key === '_id') {
                    return item[key]?.toString() === value?.toString();
                }
                return item[key] === value;
            });
        }) || null;
    }

    async insertOne(doc: Omit<T, '_id'>): Promise<{ insertedId: ObjectId }> {
        const _id = new ObjectId();
        const newDoc = { ...doc, _id } as T;
        this.data.push(newDoc);
        this.saveData();
        return { insertedId: _id };
    }
}

class Database {
    private static instance: Database;
    private collections: Map<string, JsonCollection<any>> = new Map();

    private constructor() {}

    static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    async connect(): Promise<void> {
        console.log('JSON Database ready');
    }

    collection<T extends BaseDocument>(name: string): Collection<T> {
        if (!this.collections.has(name)) {
            this.collections.set(name, new JsonCollection<T>(name));
        }
        return this.collections.get(name)!;
    }

    async close(): Promise<void> {
        // Nothing to close for JSON files
    }
}

export const db = Database.getInstance();
