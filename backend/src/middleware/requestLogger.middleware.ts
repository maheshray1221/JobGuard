import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const shouldLogRequests = process.env.NODE_ENV !== "test";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const requestId =
    req.get("x-request-id")?.trim().slice(0, 80) || randomUUID();
  const startedAt = process.hrtime.bigint();

  res.setHeader("X-Request-ID", requestId);
  res.locals.requestId = requestId;

  if (shouldLogRequests) {
    res.on("finish", () => {
      const latencyMs =
        Number(process.hrtime.bigint() - startedAt) / 1_000_000;

      console.info(
        JSON.stringify({
          requestId,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          latencyMs: Math.round(latencyMs),
          errorCategory:
            res.statusCode >= 500
              ? "server"
              : res.statusCode >= 400
                ? "client"
                : undefined,
        }),
      );
    });
  }

  next();
};
