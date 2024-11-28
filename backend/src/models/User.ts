import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { db } from '../db/database';

export interface User {
    _id?: ObjectId;
    username: string;
    email: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class UserService {
    private collection;

    constructor() {
        this.collection = db.collection<User>('users');
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.collection.findOne({ email });
    }

    async findById(id: string): Promise<User | null> {
        return this.collection.findOne({ _id: new ObjectId(id) });
    }

    async create(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        const now = new Date();
        const user: User = {
            ...userData,
            password: hashedPassword,
            createdAt: now,
            updatedAt: now
        };

        const result = await this.collection.insertOne(user);
        return { ...user, _id: result.insertedId };
    }

    async comparePassword(user: User, candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, user.password);
    }
}
