import { connect } from "node:http2";
import prisma from "../config/db.js";

export interface HealthStatus {
    status: 'ok' | 'degraded';
    timestamp: string;
    uptime: number;
    database: 'connected' | 'unreachable';
}

export async function getHealthStatus(): Promise<HealthStatus> {
    let database: HealthStatus['database'] = 'unreachable'; //Used to be a separate database type def, but apparently "Indexed Access Type" is a thing.

    try {
        await prisma.$queryRaw`SELECT 1`;
        database = 'connected';
    } catch {
        //Apparently exception supression is a thing for infra checks like healthchecks.
    }

    return {
        status: database === 'connected' ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database
    };
} 