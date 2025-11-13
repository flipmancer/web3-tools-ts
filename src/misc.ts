import { performance } from "perf_hooks";
import { config } from "./config";

const logger = config.logger;

export function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return new Promise(async (resolve, reject) => {
        const start = performance.now();
        try {
            const result = await fn();
            const duration = performance.now() - start;
            logger.info({ operation: name, duration_ms: duration }, "Operation completed");
            resolve(result);
        } catch (error) {
            const duration = performance.now() - start;
            logger.error({ operation: name, duration_ms: duration, error }, "Operation failed");
            reject(error);
        }
    });
}

// // Usage
// await measureAsync("fetch-orderbook", async () => {
//     return await client.getOrderBook(marketId);
// });
