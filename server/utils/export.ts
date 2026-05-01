import { Parser } from 'json2csv';
import { logger } from './logger.js';

export const exportToCSV = (data: any[], fields: string[]) => {
  try {
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    return csv;
  } catch (error) {
    logger.error('CSV Export error:', error);
    throw new Error('Failed to generate CSV export');
  }
};
