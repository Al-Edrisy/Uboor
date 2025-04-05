import dotenv from 'dotenv';

dotenv.config();

export const amadeusConfig = {
  clientId: process.env.AMADEUS_CLIENT_ID ,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
  baseUrl: process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com'
};