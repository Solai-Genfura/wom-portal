import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'work-orders.json');

const sampleWorkOrders = [
  {
    id: uuidv4(),
    title: 'Repair Server Rack Cooling Fans',
    description: 'The primary cooling fan unit on Server Rack B4 is making loud grinding noises and has dropped to 30% RPM. Please replace the fan assembly and verify airflow diagnostics.',
    priority: 'High',
    status: 'In Progress',
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: uuidv4(),
    title: 'Office Desk Power Outlet Installation',
    description: 'Install a quad power outlet under the new desks in Room 204. Ensure wires are channeled through desk cable management trays and tested for load limits.',
    priority: 'Medium',
    status: 'Open',
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
  },
  {
    id: uuidv4(),
    title: 'Replace Lobby Fluorescent Tube Lights',
    description: 'Three tube lights in the main lobby ceiling are flickering. Replace with energy-efficient T8 LED tube lights and recycle the old tubes.',
    priority: 'Low',
    status: 'Done',
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
  },
  {
    id: uuidv4(),
    title: 'Upgrade Network Switch Firmware',
    description: 'Upgrade the core stack switches to firmware version 15.2.4 during the scheduled maintenance window (Saturday 2 AM). Perform config backup before applying updates.',
    priority: 'High',
    status: 'Open',
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
  },
  {
    id: uuidv4(),
    title: 'Conference Room Projector Calibration',
    description: 'The projector in Conference Room A has a color misalignment (red shadow). Please calibrate the lenses and reset display settings to default.',
    priority: 'Medium',
    status: 'Open',
    updatedAt: new Date().toISOString(),
  }
];

async function seed() {
  console.log('Seeding work orders data...');
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(sampleWorkOrders, null, 2), 'utf-8');
    console.log(`Successfully seeded ${sampleWorkOrders.length} work orders to ${DATA_FILE}`);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
