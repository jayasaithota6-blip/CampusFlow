import { INITIAL_MAINTENANCE_TICKETS } from '../data/mockData';
import { MaintenanceTicket } from '../types';
import { facilityService } from './facilityService';
import { resourceService } from './resourceService';

const STORAGE_KEY = 'campusflow_maintenance_tickets';

function getStoredTickets(): MaintenanceTicket[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MAINTENANCE_TICKETS));
    return INITIAL_MAINTENANCE_TICKETS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_MAINTENANCE_TICKETS;
  }
}

function saveTickets(tickets: MaintenanceTicket[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

export const maintenanceService = {
  async getAll(): Promise<MaintenanceTicket[]> {
    return getStoredTickets();
  },

  async createTicket(
    ticket: Omit<MaintenanceTicket, 'id' | 'status'>
  ): Promise<MaintenanceTicket> {
    const list = getStoredTickets();
    const newId = `MNT-2026-00${list.length + 45}`;
    const newTicket: MaintenanceTicket = {
      ...ticket,
      id: newId,
      status: 'In Progress',
    };

    list.unshift(newTicket);
    saveTickets(list);

    // If it's a facility, automatically update its status to Under Maintenance
    if (ticket.itemType === 'Facility' && ticket.itemId) {
      await facilityService.updateStatus(ticket.itemId, 'Under Maintenance', ticket.reason);
    } else if (ticket.itemType === 'Resource' && ticket.itemId) {
      await resourceService.markMaintenance(ticket.itemId, 1);
    }

    return newTicket;
  },

  async resolveTicket(id: string): Promise<MaintenanceTicket> {
    const list = getStoredTickets();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Ticket not found');

    const ticket = list[index];
    ticket.status = 'Resolved';
    saveTickets(list);

    if (ticket.itemType === 'Facility' && ticket.itemId) {
      await facilityService.updateStatus(ticket.itemId, 'Available');
    } else if (ticket.itemType === 'Resource' && ticket.itemId) {
      await resourceService.returnFromMaintenance(ticket.itemId, 1);
    }

    return ticket;
  },

  async updateTicket(id: string, updates: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> {
    const list = getStoredTickets();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Ticket not found');

    list[index] = { ...list[index], ...updates };
    saveTickets(list);
    return list[index];
  },

  async deleteTicket(id: string): Promise<void> {
    const list = getStoredTickets();
    const filtered = list.filter((t) => t.id !== id);
    saveTickets(filtered);
  },
};
