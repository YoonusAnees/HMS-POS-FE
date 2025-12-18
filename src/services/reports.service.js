import { api } from './api';

export const ReportsService = {
  eod: ({ date, currency = 'LKR' }) =>
    api.get(`/reports/eod?date=${encodeURIComponent(date)}&currency=${encodeURIComponent(currency)}`)
      .then(r => r.data)
};
