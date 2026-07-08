import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  WorkOrderSchema, 
  CreateWorkOrderSchema, 
  getWorkOrders, 
  createWorkOrder, 
  updateWorkOrder, 
  deleteWorkOrder 
} from './data-store';
import fs from 'fs/promises';

vi.mock('fs/promises', () => ({
  default: {
    mkdir: vi.fn().mockResolvedValue(undefined),
    access: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue('[]'),
    writeFile: vi.fn().mockResolvedValue(undefined),
  }
}));

describe('Data Store Schema Validation', () => {
  it('successfully validates correct work order payloads', () => {
    const validPayload = {
      id: '81f087be-cdce-4277-bf3b-9e450b4a45a6',
      title: 'Replace server hardware',
      description: 'Upgrade storage drives in Rack 4',
      priority: 'High',
      status: 'Open',
      updatedAt: new Date().toISOString(),
    };

    const result = WorkOrderSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects short title payloads', () => {
    const invalidPayload = {
      title: 'A', // too short (min 2 characters)
      description: 'Valid description',
      priority: 'Medium',
    };

    const result = CreateWorkOrderSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Title must be at least 2 characters');
    }
  });

  it('rejects invalid priority levels', () => {
    const invalidPayload = {
      title: 'Valid title',
      description: 'Valid description',
      priority: 'Urgent', // invalid enum value
    };

    const result = CreateWorkOrderSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});

describe('Data Store CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getWorkOrders parses and returns work orders from file', async () => {
    const mockData = [
      {
        id: '81f087be-cdce-4277-bf3b-9e450b4a45a6',
        title: 'Replace server hardware',
        description: 'Upgrade storage drives in Rack 4',
        priority: 'High',
        status: 'Open',
        updatedAt: '2026-07-08T00:00:00.000Z',
      }
    ];
    vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(mockData));

    const result = await getWorkOrders();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Replace server hardware');
    expect(fs.readFile).toHaveBeenCalled();
  });

  it('createWorkOrder adds a work order and saves it', async () => {
    vi.mocked(fs.readFile).mockResolvedValueOnce('[]');
    
    const payload = {
      title: 'Fix AC unit',
      description: 'Lobby AC is leaking water',
      priority: 'High' as const,
    };

    const newOrder = await createWorkOrder(payload);
    expect(newOrder.id).toBeDefined();
    expect(newOrder.title).toBe('Fix AC unit');
    expect(newOrder.status).toBe('Open');
    expect(newOrder.updatedAt).toBeDefined();

    expect(fs.writeFile).toHaveBeenCalled();
    const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
    const writtenData = JSON.parse(writeCall[1] as string);
    expect(writtenData).toHaveLength(1);
    expect(writtenData[0].title).toBe('Fix AC unit');
  });

  it('updateWorkOrder modifies an existing work order and saves it', async () => {
    const mockData = [
      {
        id: '81f087be-cdce-4277-bf3b-9e450b4a45a6',
        title: 'Replace server hardware',
        description: 'Upgrade storage drives in Rack 4',
        priority: 'High' as const,
        status: 'Open' as const,
        updatedAt: '2026-07-08T00:00:00.000Z',
      }
    ];
    vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(mockData));

    const updated = await updateWorkOrder('81f087be-cdce-4277-bf3b-9e450b4a45a6', {
      title: 'Replace server SSDs',
      status: 'In Progress',
    });

    expect(updated.title).toBe('Replace server SSDs');
    expect(updated.status).toBe('In Progress');
    expect(updated.id).toBe('81f087be-cdce-4277-bf3b-9e450b4a45a6');

    expect(fs.writeFile).toHaveBeenCalled();
    const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
    const writtenData = JSON.parse(writeCall[1] as string);
    expect(writtenData[0].title).toBe('Replace server SSDs');
    expect(writtenData[0].status).toBe('In Progress');
  });

  it('updateWorkOrder throws an error if work order not found', async () => {
    vi.mocked(fs.readFile).mockResolvedValueOnce('[]');

    await expect(
      updateWorkOrder('non-existent-uuid', { title: 'New title' })
    ).rejects.toThrow('not found');
  });

  it('deleteWorkOrder removes a work order', async () => {
    const mockData = [
      {
        id: '81f087be-cdce-4277-bf3b-9e450b4a45a6',
        title: 'Replace server hardware',
        description: 'Upgrade storage drives in Rack 4',
        priority: 'High' as const,
        status: 'Open' as const,
        updatedAt: '2026-07-08T00:00:00.000Z',
      }
    ];
    vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(mockData));

    await deleteWorkOrder('81f087be-cdce-4277-bf3b-9e450b4a45a6');
    expect(fs.writeFile).toHaveBeenCalled();
    const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
    const writtenData = JSON.parse(writeCall[1] as string);
    expect(writtenData).toHaveLength(0);
  });

  it('deleteWorkOrder throws an error if work order not found', async () => {
    vi.mocked(fs.readFile).mockResolvedValueOnce('[]');

    await expect(
      deleteWorkOrder('non-existent-uuid')
    ).rejects.toThrow('not found');
  });
});
