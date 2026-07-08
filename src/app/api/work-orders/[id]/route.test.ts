import { GET, PUT, DELETE } from './route';
import { getWorkOrderById, updateWorkOrder, deleteWorkOrder } from '@/lib/data-store';
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/data-store', () => ({
  getWorkOrderById: vi.fn(),
  updateWorkOrder: vi.fn(),
  deleteWorkOrder: vi.fn(),
  UpdateWorkOrderSchema: {
    safeParse: (data: any) => {
      if (data.title && data.title.length < 2) {
        return {
          success: false,
          error: {
            issues: [
              { path: ['title'], message: 'Title must be at least 2 characters.' }
            ]
          }
        };
      }
      return { success: true, data };
    }
  }
}));

describe('Work Order API Endpoint by ID - /api/work-orders/[id]', () => {
  const mockId = '81f087be-cdce-4277-bf3b-9e450b4a45a6';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('returns a work order if found', async () => {
      const mockOrder = {
        id: mockId,
        title: 'Repair Server A',
        description: 'Server repair',
        priority: 'High',
        status: 'Open',
        updatedAt: new Date().toISOString(),
      };
      vi.mocked(getWorkOrderById).mockResolvedValue(mockOrder);

      const req = new NextRequest(`http://localhost/api/work-orders/${mockId}`);
      const res = await GET(req, { params: Promise.resolve({ id: mockId }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe(mockId);
      expect(getWorkOrderById).toHaveBeenCalledWith(mockId);
    });

    it('returns 404 if work order is not found', async () => {
      vi.mocked(getWorkOrderById).mockResolvedValue(null);

      const req = new NextRequest(`http://localhost/api/work-orders/${mockId}`);
      const res = await GET(req, { params: Promise.resolve({ id: mockId }) });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Work order not found.');
    });

    it('returns 500 status on exception', async () => {
      vi.mocked(getWorkOrderById).mockRejectedValue(new Error('Internal storage read failed'));

      const req = new NextRequest(`http://localhost/api/work-orders/${mockId}`);
      const res = await GET(req, { params: Promise.resolve({ id: mockId }) });
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Failed to fetch work order.');
    });
  });

  describe('PUT', () => {
    it('updates a work order successfully', async () => {
      const updatePayload = {
        title: 'New Server Title',
        status: 'In Progress',
      };
      const updatedOrder = {
        id: mockId,
        title: 'New Server Title',
        description: 'Server repair',
        priority: 'High',
        status: 'In Progress',
        updatedAt: new Date().toISOString(),
      };
      vi.mocked(updateWorkOrder).mockResolvedValue(updatedOrder);

      const req = new NextRequest(`http://localhost/api/work-orders/${mockId}`, {
        method: 'PUT',
        body: JSON.stringify(updatePayload),
      });

      const res = await PUT(req, { params: Promise.resolve({ id: mockId }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('In Progress');
      expect(data.title).toBe('New Server Title');
      expect(updateWorkOrder).toHaveBeenCalledWith(mockId, updatePayload);
    });

    it('returns 400 validation error for invalid update payload', async () => {
      const invalidPayload = {
        title: 'A', // too short
      };

      const req = new NextRequest(`http://localhost/api/work-orders/${mockId}`, {
        method: 'PUT',
        body: JSON.stringify(invalidPayload),
      });

      const res = await PUT(req, { params: Promise.resolve({ id: mockId }) });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.errors.title).toBe('Title must be at least 2 characters.');
    });

    it('returns 404 if order to update does not exist', async () => {
      const updatePayload = { title: 'Updated Title' };
      vi.mocked(updateWorkOrder).mockRejectedValue(new Error('Work Order with ID test not found.'));

      const req = new NextRequest(`http://localhost/api/work-orders/${mockId}`, {
        method: 'PUT',
        body: JSON.stringify(updatePayload),
      });

      const res = await PUT(req, { params: Promise.resolve({ id: mockId }) });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toContain('not found');
    });
  });

  describe('DELETE', () => {
    it('deletes work order successfully', async () => {
      vi.mocked(deleteWorkOrder).mockResolvedValue(undefined);

      const req = new NextRequest(`http://localhost/api/work-orders/${mockId}`, {
        method: 'DELETE',
      });

      const res = await DELETE(req, { params: Promise.resolve({ id: mockId }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(deleteWorkOrder).toHaveBeenCalledWith(mockId);
    });

    it('returns 404 if deleting a non-existent order', async () => {
      vi.mocked(deleteWorkOrder).mockRejectedValue(new Error('Work Order with ID test not found.'));

      const req = new NextRequest(`http://localhost/api/work-orders/${mockId}`, {
        method: 'DELETE',
      });

      const res = await DELETE(req, { params: Promise.resolve({ id: mockId }) });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toContain('not found');
    });
  });
});
