import type { ActivityMeta } from "./activity.types.ts";

declare global {
    namespace PrismaJson {
        type ActivityMeta = import('./activity.types.ts').ActivityMeta;
    }
}
export {};