import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { networkInterfaces } from 'os';
import logger from './utils/logger';
import errorHandler from './middleware/errorHandler';
import flightRouter from './routes/flight.routes';
import paymentRouter from './routes/payment.routes';
import pdfRouter from './routes/pdf.routes';

// Configuration
dotenv.config();
const PORT = process.env.PORT || 2000;

// Automatic IP Detection
const getLocalIp = (): string => {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name];
    if (!nets) continue;

    for (const net of nets) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
};

const LOCAL_IP = getLocalIp();

// Express Setup
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/flights', flightRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/pdf', pdfRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    ip: LOCAL_IP,
    port: PORT
  });
});

// Error Handling
app.use(errorHandler);

// Server Start
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log('\n=== Connection Information ===');
  console.log(`Local access:     http://localhost:${PORT}`);
  console.log(`Network access:   http://${LOCAL_IP}:${PORT}`);
  console.log(`Android emulator: http://10.0.2.2:${PORT}`);
  console.log('==============================\n');
});
