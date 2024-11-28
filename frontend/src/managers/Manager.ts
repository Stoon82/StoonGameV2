export abstract class Manager {
    protected static instance: Manager;
    protected isInitialized: boolean = false;

    protected constructor() {}

    public abstract init(): void;
    public abstract update(deltaTime: number): void;
    public abstract dispose(): void;
}
