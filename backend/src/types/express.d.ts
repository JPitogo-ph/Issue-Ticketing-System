import { JwtPayload } from "./auth.types.ts";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
// "Module Augmentation", basically a header file to extend external code. 
// Added that custom JwtPayload field to Express' Request type.