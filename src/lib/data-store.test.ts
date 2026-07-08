import { describe, it, expect } from 'vitest';
import { WorkOrderSchema, CreateWorkOrderSchema } from './data-store';

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
