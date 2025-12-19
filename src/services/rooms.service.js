import { api } from './api';

export const RoomsService = {
  list: () => api.get('/rooms').then(r => r.data),
  listVacant: () => api.get('/rooms/vacant').then(r => r.data),
  listOccupied: () => api.get('/rooms/occupied').then(r => r.data),
  
};
