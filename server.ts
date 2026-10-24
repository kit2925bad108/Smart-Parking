import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent storage setup
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'parking_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface Vehicle {
  id: number;
  vehicleNumber: string;
  vehicleType: string;
  ownerName: string;
  slotNumber: string;
  entryTime: string;
  exitTime?: string | null;
  fee?: number;
  status: string;
}

interface WaitingVehicle {
  id: number;
  vehicleNumber: string;
  vehicleType: string;
  ownerName: string;
  entryTime: string;
  position?: number;
}

interface ParkingHistory {
  id: number;
  vehicleNumber: string;
  vehicleType: string;
  slotNumber: string;
  entryTime: string;
  exitTime: string;
  durationHours: number;
  fee: number;
}

interface DatabaseState {
  availableSlots: number[]; // ArrayList simulation: [1, 2, ..., 20]
  parkedVehicles: Record<string, Vehicle>; // HashMap simulation: vehicleNumber -> Vehicle
  waitingQueue: WaitingVehicle[]; // FIFO Queue simulation
  parkingHistory: ParkingHistory[];
  nextId: number;
  adminUser?: {
    username: string;
    passwordHash: string;
    name: string;
    role: string;
    lastLogin?: string;
  };
  tariffSettings?: {
    baseHourFee: number;
    additionalHourFee: number;
  };
}

const TOTAL_SLOTS = 20;

function getInitialState(): DatabaseState {
  const slots: number[] = [];
  for (let i = 1; i <= TOTAL_SLOTS; i++) {
    slots.push(i);
  }

  // Pre-seed a few realistic parked vehicles so the dashboard has rich initial state
  const now = new Date();
  const t1 = new Date(now.getTime() - 2.5 * 3600 * 1000).toISOString();
  const t2 = new Date(now.getTime() - 1.2 * 3600 * 1000).toISOString();
  const t3 = new Date(now.getTime() - 0.7 * 3600 * 1000).toISOString();
  const t4 = new Date(now.getTime() - 3.8 * 3600 * 1000).toISOString();
  const t5 = new Date(now.getTime() - 0.4 * 3600 * 1000).toISOString();

  // Remove first 5 slots for initial parked
  const allocated = slots.splice(0, 5); // slots 1, 2, 3, 4, 5

  const parkedVehicles: Record<string, Vehicle> = {
    'TN38AB1234': {
      id: 1,
      vehicleNumber: 'TN38AB1234',
      vehicleType: 'Car',
      ownerName: 'Muthukrishnan',
      slotNumber: 'P01',
      entryTime: t1,
      fee: 0,
      status: 'PARKED'
    },
    'TN40CD5678': {
      id: 2,
      vehicleNumber: 'TN40CD5678',
      vehicleType: 'SUV',
      ownerName: 'Arun Kumar',
      slotNumber: 'P02',
      entryTime: t2,
      fee: 0,
      status: 'PARKED'
    },
    'KA05MN4321': {
      id: 3,
      vehicleNumber: 'KA05MN4321',
      vehicleType: 'Car',
      ownerName: 'Priya Sharma',
      slotNumber: 'P03',
      entryTime: t3,
      fee: 0,
      status: 'PARKED'
    },
    'MH02XY8899': {
      id: 4,
      vehicleNumber: 'MH02XY8899',
      vehicleType: 'Bike',
      ownerName: 'Rajesh Patil',
      slotNumber: 'P04',
      entryTime: t4,
      fee: 0,
      status: 'PARKED'
    },
    'DL01AK9900': {
      id: 5,
      vehicleNumber: 'DL01AK9900',
      vehicleType: 'Electric Car',
      ownerName: 'Sneha Verma',
      slotNumber: 'P05',
      entryTime: t5,
      fee: 0,
      status: 'PARKED'
    }
  };

  const hist1Exit = new Date(now.getTime() - 1.5 * 3600 * 1000).toISOString();
  const hist1Entry = new Date(now.getTime() - 4.5 * 3600 * 1000).toISOString();
  const hist2Exit = new Date(now.getTime() - 0.8 * 3600 * 1000).toISOString();
  const hist2Entry = new Date(now.getTime() - 2.8 * 3600 * 1000).toISOString();
  const hist3Exit = new Date(now.getTime() - 0.2 * 3600 * 1000).toISOString();
  const hist3Entry = new Date(now.getTime() - 1.2 * 3600 * 1000).toISOString();

  const parkingHistory: ParkingHistory[] = [
    {
      id: 101,
      vehicleNumber: 'TN09PQ3456',
      vehicleType: 'Car',
      slotNumber: 'P08',
      entryTime: hist1Entry,
      exitTime: hist1Exit,
      durationHours: 3.0,
      fee: 70
    },
    {
      id: 102,
      vehicleNumber: 'KA01BC7788',
      vehicleType: 'SUV',
      slotNumber: 'P12',
      entryTime: hist2Entry,
      exitTime: hist2Exit,
      durationHours: 2.0,
      fee: 50
    },
    {
      id: 103,
      vehicleNumber: 'TN37KL1122',
      vehicleType: 'Bike',
      slotNumber: 'P02',
      entryTime: hist3Entry,
      exitTime: hist3Exit,
      durationHours: 1.0,
      fee: 30
    }
  ];

  return {
    availableSlots: slots,
    parkedVehicles,
    waitingQueue: [],
    parkingHistory,
    nextId: 104,
    adminUser: {
      username: 'admin',
      passwordHash: 'admin123',
      name: 'Muthukrishnan (Admin)',
      role: 'ADMIN',
      lastLogin: new Date().toISOString()
    },
    tariffSettings: {
      baseHourFee: 30,
      additionalHourFee: 20
    }
  };
}

let dbState: DatabaseState;

function loadState(): DatabaseState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed: DatabaseState = JSON.parse(data);
      if (!parsed.adminUser) {
        parsed.adminUser = {
          username: 'admin',
          passwordHash: 'admin123',
          name: 'Muthukrishnan (Admin)',
          role: 'ADMIN',
          lastLogin: new Date().toISOString()
        };
      }
      if (!parsed.tariffSettings) {
        parsed.tariffSettings = { baseHourFee: 30, additionalHourFee: 20 };
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed reading parking_db.json, using defaults', err);
  }
  const initial = getInitialState();
  saveState(initial);
  return initial;
}

function saveState(state: DatabaseState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed saving parking_db.json', err);
  }
}

dbState = loadState();

// Fee calculation according to specifications:
// First hour = ₹30
// Each additional hour = ₹20
// Minimum fee = ₹30
// Round partial hours appropriately (e.g., 2.25h -> rounded to 2h = ₹50)
function calculateFee(entryTimeStr: string, exitTimeStr: string): { durationHours: number; fee: number; formula: string } {
  const entry = new Date(entryTimeStr).getTime();
  const exit = new Date(exitTimeStr).getTime();
  const diffMs = Math.max(60000, exit - entry);
  const rawHours = diffMs / (1000 * 60 * 60);
  const durationHours = Math.round(rawHours * 100) / 100;

  // Round partial hours to nearest integer, minimum 1 hour
  const billedHours = Math.max(1, Math.round(durationHours));
  let fee = 30;
  let formula = 'First 1 hour = ₹30';
  if (billedHours > 1) {
    const additional = billedHours - 1;
    fee += additional * 20;
    formula = `1st hr (₹30) + ${additional} addl hr(s) @ ₹20 = ₹${fee}`;
  }
  return { durationHours, fee, formula };
}

// REST API ROUTES

// 0. AUTHENTICATION ENDPOINTS
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  const admin = dbState.adminUser || {
    username: 'admin',
    passwordHash: 'admin123',
    name: 'Muthukrishnan (Admin)',
    role: 'ADMIN'
  };

  const inputUser = username.trim().toLowerCase();
  const validUser = admin.username.toLowerCase();

  if (inputUser === validUser && password === admin.passwordHash) {
    admin.lastLogin = new Date().toISOString();
    dbState.adminUser = admin;
    saveState(dbState);

    const token = 'session_' + Buffer.from(`${admin.username}:${Date.now()}`).toString('base64');
    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        username: admin.username,
        name: admin.name,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid administrator credentials. Try default username "admin" and password "admin123".'
  });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized session' });
  }

  const token = authHeader.split(' ')[1];
  if (!token || !token.startsWith('session_')) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token' });
  }

  const admin = dbState.adminUser || {
    username: 'admin',
    passwordHash: 'admin123',
    name: 'Muthukrishnan (Admin)',
    role: 'ADMIN'
  };

  res.json({
    success: true,
    user: {
      username: admin.username,
      name: admin.name,
      role: admin.role,
      lastLogin: admin.lastLogin
    }
  });
});

app.post('/api/auth/update-profile', (req, res) => {
  const { currentPassword, newPassword, name, username } = req.body;

  const admin = dbState.adminUser || {
    username: 'admin',
    passwordHash: 'admin123',
    name: 'Muthukrishnan (Admin)',
    role: 'ADMIN'
  };

  if (currentPassword && currentPassword !== admin.passwordHash) {
    return res.status(400).json({ success: false, message: 'Current password does not match' });
  }

  if (username && username.trim()) {
    admin.username = username.trim();
  }
  if (name && name.trim()) {
    admin.name = name.trim();
  }
  if (newPassword && newPassword.trim()) {
    if (newPassword.trim().length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters' });
    }
    admin.passwordHash = newPassword.trim();
  }

  dbState.adminUser = admin;
  saveState(dbState);

  res.json({
    success: true,
    message: 'Admin profile updated successfully',
    user: {
      username: admin.username,
      name: admin.name,
      role: admin.role
    }
  });
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// 1. POST /api/vehicles/entry
app.post('/api/vehicles/entry', (req, res) => {
  const { vehicleNumber, vehicleType, ownerName } = req.body;

  if (!vehicleNumber || !vehicleNumber.trim()) {
    return res.status(400).json({ success: false, message: 'Vehicle number is required' });
  }

  const vNum = vehicleNumber.trim().toUpperCase();
  const vType = vehicleType && vehicleType.trim() ? vehicleType.trim() : 'Car';
  const vOwner = ownerName && ownerName.trim() ? ownerName.trim() : 'Guest Owner';

  // Check HashMap: vehicle already parked?
  if (dbState.parkedVehicles[vNum]) {
    const existing = dbState.parkedVehicles[vNum];
    return res.status(409).json({
      success: false,
      message: `Vehicle ${vNum} is already parked in slot ${existing.slotNumber}`
    });
  }

  // Check Queue: vehicle already waiting?
  if (dbState.waitingQueue.some(v => v.vehicleNumber === vNum)) {
    return res.status(409).json({
      success: false,
      message: `Vehicle ${vNum} is already in the waiting queue.`
    });
  }

  const now = new Date().toISOString();

  // Check ArrayList: available slots
  if (dbState.availableSlots.length > 0) {
    // Remove available slot (ArrayList remove(0))
    const slotId = dbState.availableSlots.shift()!;
    const slotNumber = `P${String(slotId).padStart(2, '0')}`;

    const newVehicle: Vehicle = {
      id: dbState.nextId++,
      vehicleNumber: vNum,
      vehicleType: vType,
      ownerName: vOwner,
      slotNumber,
      entryTime: now,
      fee: 0,
      status: 'PARKED'
    };

    // Add to HashMap
    dbState.parkedVehicles[vNum] = newVehicle;
    saveState(dbState);

    return res.json({
      success: true,
      status: 'PARKED',
      message: 'Vehicle parked successfully',
      vehicleNumber: vNum,
      vehicleType: vType,
      ownerName: vOwner,
      slotNumber,
      entryTime: now,
      availableSlotsCount: dbState.availableSlots.length
    });
  } else {
    // Parking is full -> Add to FIFO Waiting Queue
    const waiting: WaitingVehicle = {
      id: dbState.nextId++,
      vehicleNumber: vNum,
      vehicleType: vType,
      ownerName: vOwner,
      entryTime: now
    };

    dbState.waitingQueue.push(waiting);
    saveState(dbState);

    return res.json({
      success: true,
      status: 'QUEUED',
      message: 'Parking Full. Vehicle added to waiting queue.',
      vehicleNumber: vNum,
      vehicleType: vType,
      ownerName: vOwner,
      queuePosition: dbState.waitingQueue.length,
      entryTime: now
    });
  }
});

// 2. POST /api/vehicles/exit
app.post('/api/vehicles/exit', (req, res) => {
  const { vehicleNumber } = req.body;

  if (!vehicleNumber || !vehicleNumber.trim()) {
    return res.status(400).json({ success: false, message: 'Vehicle number is required' });
  }

  const vNum = vehicleNumber.trim().toUpperCase();

  // 1. Fast lookup in HashMap
  const vehicle = dbState.parkedVehicles[vNum];
  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: `Vehicle ${vNum} is not currently parked.`
    });
  }

  const exitTime = new Date().toISOString();
  const feeCalc = calculateFee(vehicle.entryTime, exitTime);

  const freedSlot = vehicle.slotNumber;

  // 2. Remove from HashMap
  delete dbState.parkedVehicles[vNum];

  // 3. Save to parking history
  const historyRecord: ParkingHistory = {
    id: dbState.nextId++,
    vehicleNumber: vNum,
    vehicleType: vehicle.vehicleType,
    slotNumber: freedSlot,
    entryTime: vehicle.entryTime,
    exitTime,
    durationHours: feeCalc.durationHours,
    fee: feeCalc.fee
  };
  dbState.parkingHistory.unshift(historyRecord);

  // 4. Check Queue (FIFO)
  let autoAllocatedVehicle: any = null;
  if (dbState.waitingQueue.length > 0) {
    const nextInQueue = dbState.waitingQueue.shift()!;
    const now = new Date().toISOString();

    const allocatedVehicle: Vehicle = {
      id: dbState.nextId++,
      vehicleNumber: nextInQueue.vehicleNumber,
      vehicleType: nextInQueue.vehicleType,
      ownerName: nextInQueue.ownerName,
      slotNumber: freedSlot,
      entryTime: now,
      fee: 0,
      status: 'PARKED'
    };

    dbState.parkedVehicles[nextInQueue.vehicleNumber] = allocatedVehicle;

    autoAllocatedVehicle = {
      vehicleNumber: nextInQueue.vehicleNumber,
      vehicleType: nextInQueue.vehicleType,
      ownerName: nextInQueue.ownerName,
      slotNumber: freedSlot,
      allocatedTime: now
    };
  } else {
    // Return freed slot to availableSlots ArrayList
    const slotId = parseInt(freedSlot.replace('P', ''), 10);
    if (!dbState.availableSlots.includes(slotId)) {
      dbState.availableSlots.push(slotId);
      dbState.availableSlots.sort((a, b) => a - b);
    }
  }

  saveState(dbState);

  return res.json({
    success: true,
    message: 'Vehicle exited successfully',
    vehicleNumber: vNum,
    vehicleType: vehicle.vehicleType,
    ownerName: vehicle.ownerName,
    slotNumber: freedSlot,
    entryTime: vehicle.entryTime,
    exitTime,
    durationHours: feeCalc.durationHours,
    fee: feeCalc.fee,
    feeFormula: feeCalc.formula,
    autoAllocatedVehicle,
    availableSlotsCount: dbState.availableSlots.length,
    remainingQueueSize: dbState.waitingQueue.length
  });
});

// 3. GET /api/vehicles
app.get('/api/vehicles', (_req, res) => {
  const list = Object.values(dbState.parkedVehicles);
  res.json(list);
});

// 4. GET /api/vehicles/:vehicleNumber
app.get('/api/vehicles/:vehicleNumber', (req, res) => {
  const vNum = req.params.vehicleNumber.trim().toUpperCase();
  const vehicle = dbState.parkedVehicles[vNum];
  if (!vehicle) {
    return res.status(404).json({ success: false, message: `Vehicle ${vNum} not found in parked list` });
  }
  res.json(vehicle);
});

// 5. GET /api/slots
app.get('/api/slots', (_req, res) => {
  const slotToVehicle: Record<string, Vehicle> = {};
  for (const v of Object.values(dbState.parkedVehicles)) {
    if (v.slotNumber) {
      slotToVehicle[v.slotNumber] = v;
    }
  }

  const result = [];
  for (let i = 1; i <= TOTAL_SLOTS; i++) {
    const slotNumber = `P${String(i).padStart(2, '0')}`;
    const vehicle = slotToVehicle[slotNumber];
    if (vehicle) {
      result.push({
        slotNumber,
        status: 'OCCUPIED',
        vehicleNumber: vehicle.vehicleNumber,
        vehicleType: vehicle.vehicleType,
        ownerName: vehicle.ownerName,
        entryTime: vehicle.entryTime
      });
    } else {
      result.push({
        slotNumber,
        status: 'AVAILABLE',
        vehicleNumber: null,
        vehicleType: null,
        ownerName: null,
        entryTime: null
      });
    }
  }
  res.json(result);
});

// 6. GET /api/queue
app.get('/api/queue', (_req, res) => {
  const list = dbState.waitingQueue.map((wv, idx) => ({
    ...wv,
    position: idx + 1
  }));
  res.json(list);
});

// 7. GET /api/history
app.get('/api/history', (_req, res) => {
  res.json(dbState.parkingHistory);
});

// 8. GET /api/dashboard
app.get('/api/dashboard', (_req, res) => {
  const occupiedSlots = Object.keys(dbState.parkedVehicles).length;
  const availableSlots = dbState.availableSlots.length;
  const waitingVehicles = dbState.waitingQueue.length;

  // Calculate today's revenue
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRevenue = dbState.parkingHistory
    .filter(h => h.exitTime.slice(0, 10) === todayStr)
    .reduce((sum, h) => sum + (h.fee || 0), 0);

  res.json({
    totalSlots: TOTAL_SLOTS,
    availableSlots,
    occupiedSlots,
    waitingVehicles,
    todayRevenue,
    totalHistoryCount: dbState.parkingHistory.length,
    dataStructures: {
      availableSlotsList: [...dbState.availableSlots],
      parkedVehiclesKeys: Object.keys(dbState.parkedVehicles),
      queueSize: dbState.waitingQueue.length
    }
  });
});

// 9. POST /api/reset
app.post('/api/reset', (_req, res) => {
  dbState = getInitialState();
  saveState(dbState);
  res.json({ success: true, message: 'Parking database reset successfully' });
});

// 10. POST /api/seed-full (Helper to test filling all 20 slots immediately)
app.post('/api/seed-full', (_req, res) => {
  const dummyOwners = ['Vikram', 'Ananya', 'Rohan', 'Kavita', 'Suresh', 'Deepa', 'Manoj', 'Meera', 'Karthik', 'Swati', 'Alok', 'Divya', 'Gaurav', 'Tara', 'Sunil', 'Bhavna'];
  const types = ['Car', 'Bike', 'SUV', 'Electric Car'];

  while (dbState.availableSlots.length > 0) {
    const slotId = dbState.availableSlots.shift()!;
    const slotNum = `P${String(slotId).padStart(2, '0')}`;
    const vNum = `TN${String(Math.floor(10 + Math.random() * 89))}ZZ${String(Math.floor(1000 + Math.random() * 8999))}`;
    const vType = types[Math.floor(Math.random() * types.length)];
    const owner = dummyOwners[Math.floor(Math.random() * dummyOwners.length)];

    dbState.parkedVehicles[vNum] = {
      id: dbState.nextId++,
      vehicleNumber: vNum,
      vehicleType: vType,
      ownerName: owner,
      slotNumber: slotNum,
      entryTime: new Date(Date.now() - Math.floor(Math.random() * 7200000)).toISOString(),
      fee: 0,
      status: 'PARKED'
    };
  }

  saveState(dbState);
  res.json({
    success: true,
    message: 'All 20 parking slots have been filled! Next vehicle entry will enter the Waiting Queue.',
    occupiedSlots: Object.keys(dbState.parkedVehicles).length,
    availableSlots: dbState.availableSlots.length
  });
});

// 11. GET /api/backend-files (Returns all Java backend files for inspection in UI)
app.get('/api/backend-files', (_req, res) => {
  const backendDir = path.resolve(__dirname, 'backend');
  const files: { path: string; name: string; content: string; language: string }[] = [];

  function scan(dir: string, base: string = '') {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = path.join(base, entry.name);
      if (entry.isDirectory()) {
        scan(full, rel);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        let lang = 'plaintext';
        if (ext === '.java') lang = 'java';
        else if (ext === '.xml') lang = 'xml';
        else if (ext === '.properties') lang = 'properties';
        else if (ext === '.sql') lang = 'sql';
        files.push({
          path: rel,
          name: entry.name,
          content: fs.readFileSync(full, 'utf-8'),
          language: lang
        });
      }
    }
  }

  scan(backendDir);
  res.json(files);
});

// Setup Vite dev server middleware
async function setupVite() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Parking Server running at http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch(err => {
  console.error('Error starting server:', err);
});
