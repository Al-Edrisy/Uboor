// errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ErrorRequestHandler } from 'express';
import logger from '../utils/logger';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error(`[${req.method}] ${req.path} >> ${err.stack}`);

  // Handle validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
    return;
  }

  // Handle Axios errors (specific to Amadeus API)
  if (err.isAxiosError) {
    res.status(502).json({
      error: 'Amadeus API Error',
      details: err.message
    });
    return;
  }

  // Handle Stripe-specific errors
  if (err.type === 'StripeError') {
    res.status(400).json({
      error: 'Stripe Error',
      details: err.message
    });
    return;
  }

  // Handle general internal server errors
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
};

export default errorHandler;