import axios from 'axios';
import { logger } from './logger.js';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

export const initializeTransaction = async (data: {
  email: string;
  amount: number; // in kobo
  callback_url?: string;
  metadata?: any;
}) => {
  try {
    const response = await paystack.post('/transaction/initialize', data);
    return response.data;
  } catch (error: any) {
    logger.error('Paystack initialize error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to initialize Paystack transaction');
  }
};

export const verifyTransaction = async (reference: string) => {
  try {
    const response = await paystack.get(`/transaction/verify/${reference}`);
    return response.data;
  } catch (error: any) {
    logger.error('Paystack verify error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to verify Paystack transaction');
  }
};

export const createTransferRecipient = async (data: {
  type: string; // 'nuban'
  name: string;
  account_number: string;
  bank_code: string;
  currency: string;
}) => {
  try {
    const response = await paystack.post('/transferrecipient', data);
    return response.data;
  } catch (error: any) {
    logger.error('Paystack create recipient error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create Paystack transfer recipient');
  }
};

export const initiateTransfer = async (data: {
  source: string; // 'balance'
  amount: number; // in kobo
  recipient: string; // recipient code
  reason?: string;
}) => {
  try {
    const response = await paystack.post('/transfer', data);
    return response.data;
  } catch (error: any) {
    logger.error('Paystack transfer error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to initiate Paystack transfer');
  }
};

// Task 80: Tax Calculation (Withholding Tax - WHT)
// Nigerian WHT for contractors is typically 5%
export const calculateWHT = (amount: number, rate: number = 0.05) => {
  return amount * rate;
};

export const calculateServiceFee = (amount: number, rate: number = 0.1) => {
  // NollyCrew service fee (e.g., 10%)
  return amount * rate;
};
