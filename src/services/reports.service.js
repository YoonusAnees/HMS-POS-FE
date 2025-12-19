import { api } from './api';

export const ReportsService = {
  eod: ({ date, currency = 'LKR' }) =>
    api
      .get(`/reports/eod?date=${encodeURIComponent(date)}&currency=${encodeURIComponent(currency)}`)
      .then((r) => r.data),

  managerSummary: ({ from, to, currency = 'LKR' }) =>
    api
      .get(
        `/reports/manager-summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(
          to
        )}&currency=${encodeURIComponent(currency)}`
      )
      .then((r) => r.data),
};
