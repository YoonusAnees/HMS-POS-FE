import { api } from './api';

export const DashboardService = {
  summary: ({ from, to }) =>
    api.get(`/dashboard/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      .then(r => r.data)
};
