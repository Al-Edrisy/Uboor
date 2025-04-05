// validate.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

const validate = (schema: AnyZodObject) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the request body against the provided schema
      schema.parse(req.body);
      next();
    } catch (error) {
      // If validation fails, attach the error details to the response
      if (error instanceof Error) {
        error.name = 'ValidationError'; // Set a custom error name for easier handling
      }
      next(error);
    }
  };

export default validate;