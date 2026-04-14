export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        //instanceof breaks without this line:
        Object.setPrototypeOf(this, new.target.prototype)
    }
}