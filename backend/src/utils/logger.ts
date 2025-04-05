import { Request, Response, NextFunction } from 'express';

// Define a logger interface for better type safety
interface Logger {
  info: (message: string, data?: any) => void;
  error: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void; // Add warn method here
  middleware: () => (req: Request, res: Response, next: NextFunction) => void;
}

// Create a logger object
const logger: Logger = {
  info: (message: string, data?: any) => {
    const logMessage = `[INFO] ${new Date().toISOString()} - ${message}`;
    console.log(data ? `${logMessage} - ${JSON.stringify(data)}` : logMessage);
  },
  
  error: (message: string, data?: any) => {
    const logMessage = `[ERROR] ${new Date().toISOString()} - ${message}`;
    console.error(data ? `${logMessage} - ${JSON.stringify(data)}` : logMessage);
  },

  warn: (message: string, data?: any) => { // Implement warn method
    const logMessage = `[WARN] ${new Date().toISOString()} - ${message}`;
    console.warn(data ? `${logMessage} - ${JSON.stringify(data)}` : logMessage);
  },
  
  middleware: () => (req: Request, res: Response, next: NextFunction) => {
    const { method, path, headers, body } = req;
    logger.info(`Request: ${method} ${path}`, { headers, body });
    next();
  }
};

export default logger;