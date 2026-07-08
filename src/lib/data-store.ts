import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// 1. Zod Schema Definitions
export const WorkOrderSchema = z.object({
  id: z.string().uuid(),
  title: z.string()
    .min(2, 'Title must be at least 2 characters.')
    .max(80, 'Title must be at most 80 characters.'),
  description: z.string()
    .max(2000, 'Description must be at most 2000 characters.'),
  priority: z.enum(['Low', 'Medium', 'High'], {
    message: 'Priority must be Low, Medium, or High.'
  }),
  status: z.enum(['Open', 'In Progress', 'Done'], {
    message: 'Status must be Open, In Progress, or Done.'
  }),
  updatedAt: z.string()
});

// TypeScript type inference
export type WorkOrder = z.infer<typeof WorkOrderSchema>;

// Partial schemas for validation
export const CreateWorkOrderSchema = WorkOrderSchema.omit({
  id: true,
  status: true,
  updatedAt: true
});

export const UpdateWorkOrderSchema = WorkOrderSchema.omit({
  id: true,
  updatedAt: true
}).partial();

// 2. File Persistence Configuration
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'work-orders.json');

// Ensure data directory and file exist
async function ensureDataFileExists(): Promise<string> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Ignore error if directory already exists
  }

  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    // File doesn't exist, create it with empty array
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }

  return DATA_FILE;
}

// 3. Data Store Helper API
export async function getWorkOrders(): Promise<WorkOrder[]> {
  const filePath = await ensureDataFileExists();
  const fileContent = await fs.readFile(filePath, 'utf-8');
  try {
    const data = JSON.parse(fileContent);
    return z.array(WorkOrderSchema).parse(data);
  } catch (error) {
    console.error('Error parsing work orders file, returning empty list:', error);
    return [];
  }
}

export async function saveWorkOrders(orders: WorkOrder[]): Promise<void> {
  const filePath = await ensureDataFileExists();
  // Validate schema before writing to file
  const validatedOrders = z.array(WorkOrderSchema).parse(orders);
  await fs.writeFile(filePath, JSON.stringify(validatedOrders, null, 2), 'utf-8');
}

export async function getWorkOrderById(id: string): Promise<WorkOrder | null> {
  const orders = await getWorkOrders();
  const order = orders.find(o => o.id === id);
  return order || null;
}

export async function createWorkOrder(data: z.infer<typeof CreateWorkOrderSchema>): Promise<WorkOrder> {
  // Validate inputs
  const parsedData = CreateWorkOrderSchema.parse(data);
  const orders = await getWorkOrders();

  const newOrder: WorkOrder = {
    id: uuidv4(),
    title: parsedData.title,
    description: parsedData.description,
    priority: parsedData.priority,
    status: 'Open', // default status
    updatedAt: new Date().toISOString()
  };

  orders.push(newOrder);
  await saveWorkOrders(orders);
  return newOrder;
}

export async function updateWorkOrder(id: string, data: z.infer<typeof UpdateWorkOrderSchema>): Promise<WorkOrder> {
  // Validate update input
  const parsedUpdate = UpdateWorkOrderSchema.parse(data);
  const orders = await getWorkOrders();
  const index = orders.findIndex(o => o.id === id);

  if (index === -1) {
    throw new Error(`Work Order with ID ${id} not found.`);
  }

  const existingOrder = orders[index];
  const updatedOrder: WorkOrder = {
    ...existingOrder,
    ...parsedUpdate,
    id, // Ensure id cannot be changed
    updatedAt: new Date().toISOString() // Always update timestamp on modification
  };

  orders[index] = updatedOrder;
  await saveWorkOrders(orders);
  return updatedOrder;
}

export async function deleteWorkOrder(id: string): Promise<void> {
  const orders = await getWorkOrders();
  const filtered = orders.filter(o => o.id !== id);
  if (filtered.length === orders.length) {
    throw new Error(`Work Order with ID ${id} not found.`);
  }
  await saveWorkOrders(filtered);
}
