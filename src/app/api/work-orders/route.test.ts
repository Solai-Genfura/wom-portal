import { GET, POST } from './route';
import { getWorkOrders, createWorkOrder } from '@/lib/data-store';
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/data-store', () => ({
  getWorkOrders: vi.fn(),
  createWorkOrder: vi.fn(),
  CreateWorkOrderSchema: {
    safeParse: (data: any) => {
      if (!data.title || data.title.length < 2) {
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

describe('Work Orders API Endpoint - /api/work-orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('returns sorted work orders and handles filtering', async () => {
      const mockOrders = [
        {
          id: '1',
          title: 'Repair Cooling Fan',
          description: 'Broken fan',
          priority: 'High',
          status: 'Open',
          updatedAt: '2026-07-08T12:00:00.000Z',
        },
        {
          id: '2',
          title: 'Upgrade Network Switch',
          description: 'Firmware upgrade',
          priority: 'Medium',
          status: 'In Progress',
          updatedAt: '2026-07-08T10:00:00.000Z',
        },
      ];
      vi.mocked(getWorkOrders).mockResolvedValue(mockOrders);

      // 1. Test GET with status filter
      const req1 = new NextRequest('http://localhost/api/work-orders?status=Open');
      const res1 = await GET(req1);
      expect(res1.status).toBe(200);
      const data1 = await res1.json();
      expect(data1).toHaveLength(1);
      expect(data1[0].id).toBe('1');

      // 2. Test GET with priority filter
      const req2 = new NextRequest('http://localhost/api/work-orders?priority=Medium');
      const res2 = await GET(req2);
      const data2 = await res2.json();
      expect(data2).toHaveLength(1);
      expect(data2[0].id).toBe('2');

      // 3. Test GET with text query filter
      const req3 = new NextRequest('http://localhost/api/work-orders?q=firmware');
      const res3 = await GET(req3);
      const data3 = await res3.json();
      expect(data3).toHaveLength(1);
      expect(data3[0].id).toBe('2');
    });

    it('returns 500 status on database error', async () => {
      vi.mocked(getWorkOrders).mockRejectedValue(new Error('DB connection failed'));
      const req = new NextRequest('http://localhost/api/work-orders');
      const res = await GET(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Failed to fetch work orders.');
    });
  });

  describe('POST', () => {
    it('creates a work order successfully', async () => {
      const payload = {
        title: 'Repair Server A',
        description: 'Detail about repair',
        priority: 'High',
      };
      const createdOrder = {
        id: 'new-uuid',
        ...payload,
        status: 'Open',
        updatedAt: new Date().toISOString(),
      };
      vi.mocked(createWorkOrder).mockResolvedValue(createdOrder);

      const req = new NextRequest('http://localhost/api/work-orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.id).toBe('new-uuid');
      expect(createWorkOrder).toHaveBeenCalledWith(payload);
    });

    it('returns 400 validation error for invalid payloads', async () => {
      const invalidPayload = {
        title: 'A', // too short
        priority: 'High',
      };

      const req = new NextRequest('http://localhost/api/work-orders', {
        method: 'POST',
        body: JSON.stringify(invalidPayload),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.errors.title).toBe('Title must be at least 2 characters.');
    });
  });
});
