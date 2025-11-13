import pino, { Logger } from "pino";

export type Environment = "dev" | "prod" | "test";

export const ENV: Environment = (process.env.NODE_ENV as Environment) || "dev";

const loggerConfig: Record<Environment, Logger> = {
    dev: pino({
        timestamp: () => `,"time":"${new Date().toLocaleTimeString()}"`,
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
            },
        },
        level: process.env.LOG_LEVEL || "debug",
    }),
    prod: pino({ level: process.env.LOG_LEVEL || "warn" }),
    test: pino({ level: process.env.LOG_LEVEL || "silent" }),
};

export const config = {
    logger: loggerConfig[ENV],
    environment: ENV,
};
