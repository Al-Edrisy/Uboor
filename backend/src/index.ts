import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './utils/logger';
import errorHandler from './middleware/errorHandler';
import flightRouter from './routes/flight.routes';
import paymentRouter from './routes/payment.routes';
import pdfRouter from './routes/pdf.routes';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger.middleware());

// Routes
app.use('/api/flights', flightRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/pdf', pdfRouter);


// Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});