export interface Vehicle {
  id?: number;
  vehicleNumber: string;
  vehicleType: string;
  ownerName: string;
  slotNumber?: string;
  entryTime?: string;
  exitTime?: string | null;
  fee?: number;
  status?: string;
}

export interface ParkingSlot {
  slotNumber: string;
  status: 'AVAILABLE' | 'OCCUPIED';
  vehicleNumber?: string | null;
  vehicleType?: string | null;
  ownerName?: string | null;
  entryTime?: string | null;
}

export interface WaitingVehicle {
  id?: number;
  position: number;
  vehicleNumber: string;
  vehicleType: string;
  ownerName: string;
  entryTime: string;
}

export interface ParkingHistoryItem {
  id: number;
  vehicleNumber: string;
  vehicleType: string;
  slotNumber: string;
  entryTime: string;
  exitTime: string;
  durationHours: number;
  fee: number;
}

export interface DashboardStats {
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  waitingVehicles: number;
  todayRevenue: number;
  totalHistoryCount?: number;
  dataStructures?: {
    availableSlotsList: number[];
    parkedVehiclesKeys: string[];
    queueSize: number;
  };
}

export interface EntryResponse {
  success: boolean;
  status: 'PARKED' | 'QUEUED';
  message: string;
  vehicleNumber?: string;
  vehicleType?: string;
  ownerName?: string;
  slotNumber?: string;
  entryTime?: string;
  queuePosition?: number;
  availableSlotsCount?: number;
}

export interface ExitResponse {
  success: boolean;
  message: string;
  vehicleNumber: string;
  vehicleType?: string;
  ownerName?: string;
  slotNumber: string;
  entryTime: string;
  exitTime: string;
  durationHours: number;
  fee: number;
  feeFormula?: string;
  autoAllocatedVehicle?: {
    vehicleNumber: string;
    vehicleType: string;
    ownerName: string;
    slotNumber: string;
    allocatedTime: string;
  } | null;
  availableSlotsCount?: number;
  remainingQueueSize?: number;
}
