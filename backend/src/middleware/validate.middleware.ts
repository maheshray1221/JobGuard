import type { Request, Response, NextFunction } from "express";
import * as z from "zod";

type ValidateTarget = "body" | "params" | "query";

export function createValidate(target: ValidateTarget) {
  return function <T>(schema: z.ZodType<T>) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const result = schema.safeParse(req[target]);

      if (!result.success) {
        // error.issues use karo (error.errors bhi kaam karta hai but issues preferred)
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        res.status(400).json({
          success: false,
          message: errors[0]?.message ?? "Validation failed",
          errors,
        });
        return;
      }

      req[target] = result.data as any; // sanitized + transformed data wapas daalo
      next();
    };
  };
}

export const validateBody   = createValidate("body");
export const validateParams = createValidate("params");
export const validateQuery  = createValidate("query");