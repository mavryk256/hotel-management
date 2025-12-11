export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  STAFF = 'STAFF'
}

export interface UserPreferences {
  roomTemperature?: string;
  pillowType?: 'Soft' | 'Firm' | 'Feather' | 'Hypoallergenic';
  floorPreference?: 'Low' | 'High' | 'Ground';
  dietaryRestrictions?: string;
  specialRequests?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  phoneNumber: string;
  role: Role;
  address: string;
  cccdNumber?: string;
  isLocked?: boolean;
  isActive?: boolean;
  avatarUrl?: string;
  createdDate?: string; 
  preferences?: UserPreferences;
}

export interface UserFilterParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
  role?: string;
  isActive?: boolean;
  isLocked?: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// --- Room Management Types ---

export enum RoomType {
  STANDARD = 'STANDARD',
  SUPERIOR = 'SUPERIOR',
  DELUXE = 'DELUXE',
  SUITE = 'SUITE',
  EXECUTIVE = 'EXECUTIVE',
  PRESIDENTIAL = 'PRESIDENTIAL',
  FAMILY = 'FAMILY',
  HONEYMOON = 'HONEYMOON'
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE',
  CLEANING = 'CLEANING',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export enum RoomView {
  CITY = 'CITY',
  SEA = 'SEA',
  GARDEN = 'GARDEN',
  POOL = 'POOL',
  MOUNTAIN = 'MOUNTAIN',
  LAKE = 'LAKE',
  COURTYARD = 'COURTYARD',
  NO_VIEW = 'NO_VIEW'
}

export enum BedType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  QUEEN = 'QUEEN',
  KING = 'KING',
  TWIN = 'TWIN',
  BUNK = 'BUNK'
}

export interface Room {
  id: string;
  roomNumber: string;
  name: string;
  type: RoomType;
  typeDisplay?: string;
  description: string;
  pricePerNight: number;
  size: number;
  bedCount: number;
  bedType: BedType;
  bedTypeDisplay?: string;
  maxOccupancy: number;
  floor: number;
  view: RoomView;
  viewDisplay?: string;
  amenities: string[];
  images: string[];
  thumbnailImage: string;
  status: RoomStatus;
  statusDisplay?: string;
  statusColor?: string;
  isActive: boolean;
  isFeatured: boolean;
  allowSmoking: boolean;
  hasBathroom: boolean;
  hasBalcony: boolean;
  hasKitchen: boolean;
  averageRating?: number;
  totalReviews?: number;
  totalBookings?: number;
  lastBookedDate?: string;
  createdDate?: string;
  updatedDate?: string;
  notes?: string;
}

export interface CreateRoomRequest {
  roomNumber: string;
  name: string;
  type: RoomType;
  description: string;
  pricePerNight: number;
  size: number;
  bedCount: number;
  bedType: BedType;
  maxOccupancy: number;
  floor: number;
  view?: RoomView;
  amenities: string[];
  images: string[];
  thumbnailImage?: string;
  allowSmoking?: boolean;
  hasBathroom: boolean;
  hasBalcony?: boolean;
  hasKitchen?: boolean;
  notes?: string;
}

export interface SearchRoomCriteria {
  type?: RoomType;
  status?: RoomStatus;
  view?: RoomView;
  minPrice?: number;
  maxPrice?: number;
  minOccupancy?: number;
  floor?: number;
  isFeatured?: boolean;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  size?: number;
  
  checkInDate?: string;
  checkOutDate?: string;
  adults?: number;
  children?: number;
  roomTypes?: RoomType[];
  amenities?: string[];
}

// --- Booking Management Types ---

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  COMPLETED = 'COMPLETED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED'
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  E_WALLET = 'E_WALLET',
  PAYPAL = 'PAYPAL'
}

export interface GuestInfo {
  fullName: string;
  phoneNumber?: string;
  email?: string;
  cccdNumber?: string;
  nationality?: string;
  address?: string;
}

export interface ServiceCharge {
  serviceType: string;
  description: string;
  amount: number;
  quantity: number;
  chargeDate: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  bookingCode?: string; // Legacy field
  
  // User info
  userId: string;
  userEmail: string;
  userFullName: string;
  userPhoneNumber: string;
  
  // Room info
  roomId: string;
  roomNumber: string;
  roomName: string;
  room?: Room;
  
  // Guest Info
  primaryGuest: GuestInfo;
  additionalGuests: GuestInfo[];

  // Group Info
  isGroupBooking: boolean;
  groupBookingId?: string;

  // Dates
  checkInDate: string;
  checkOutDate: string;
  actualCheckInTime?: string;
  actualCheckOutTime?: string;
  
  // Guest Counts
  numberOfGuests: number;
  numberOfChildren: number;
  adults?: number; // Legacy alias
  children?: number; // Legacy alias

  // Pricing
  roomPricePerNight: number;
  numberOfNights: number;
  
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  discount: number;
  
  // Additional Charges
  additionalCharges: ServiceCharge[];
  additionalChargesTotal: number;

  totalAmount: number;
  totalPrice?: number; // Legacy alias

  // Deposit
  depositAmount: number;
  depositPaid: boolean;
  depositPaidDate?: string;

  // Payment
  paymentStatus: PaymentStatus;
  paymentStatusDisplay?: string;
  paymentMethod?: PaymentMethod;
  paymentTransactionId?: string;
  
  // Status
  status: BookingStatus;
  statusDisplay?: string;
  statusColor?: string;
  
  // Requests & Options
  specialRequests?: string;
  addedServices?: string[];
  isEarlyCheckIn?: boolean;
  earlyCheckInFee?: number;
  isLateCheckOut?: boolean;
  lateCheckOutFee?: number;

  // Cancellation
  cancellationReason?: string;
  cancelledAt?: string;
  
  // Metadata
  bookingSource?: string;
  createdDate: string;
  updatedDate?: string;
  adminNotes?: string;
  
  // Permissions / Computed
  canCancel: boolean;
  canCheckIn: boolean;
  canCheckOut: boolean;
  canReview: boolean;
  daysUntilCheckIn?: number;
  
  // Helper for UI
  guestName?: string; // Legacy helper
  image?: string; // Legacy helper
}

export interface CreateBookingRequest {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfChildren: number;
  
  primaryGuest: GuestInfo;
  additionalGuests?: GuestInfo[];
  
  specialRequests?: string;
  addedServices?: string[];
  
  isEarlyCheckIn?: boolean;
  isLateCheckOut?: boolean;
  bookingSource?: string;

  // Legacy fields to maintain compatibility if UI hasn't fully updated
  adults?: number;
  children?: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export interface CreateGroupBookingRequest {
  roomIds: string[];
  checkInDate: string;
  checkOutDate: string;
  groupName: string;
  groupContactPerson: string;
  groupContactPhone: string;
  groupContactEmail: string;
  roomBookings: {
      roomId: string;
      numberOfGuests: number;
      primaryGuest: GuestInfo;
  }[];
  specialRequests?: string;
}

export interface BookingSearchCriteria {
  userId?: string;
  roomId?: string;
  bookingNumber?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  checkInDateFrom?: string;
  checkInDateTo?: string;
  checkOutDateFrom?: string;
  checkOutDateTo?: string;
  
  keyword?: string;
  checkInFrom?: string; // Legacy alias
  checkInTo?: string; // Legacy alias
  
  minAmount?: number;
  maxAmount?: number;
  bookingSource?: string;
  isGroupBooking?: boolean;
  cccdNumber?: string;

  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  checkedInBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  
  totalRevenue: number;
  paidRevenue: number;
  unpaidRevenue: number;
  
  todayCheckIns: number;
  todayCheckOuts: number;
  
  averageBookingValue: number;
  cancellationRate: number;
  occupancyRate: number;
}

export interface DailyReport {
    expectedCheckIns: number;
    checkInsList: Booking[];
    expectedCheckOuts: number;
    checkOutsList: Booking[];
    dailyRevenue: number;
    paymentsCount: number;
    occupancyRate: number;
    occupiedRooms: number;
    totalRooms: number;
    roomsNeedingCleaning: number;
}

export interface MonthlyReport {
    totalBookings: number;
    bookingsByStatus: Record<string, number>;
    totalRevenue: number;
    averageBookingValue: number;
    occupancyRate: number;
    cancellationRate: number;
    bookingsBySource: Record<string, number>;
    topRooms: Record<string, number>;
}

// --- Common Types ---

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  status: 'success' | 'fail';
  message: string;
  data: T;
}

export interface Review {
  id: string;
  roomId: string;
  roomName: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Hidden';
  reply?: string;
  isNew?: boolean;
}

// --- Dashboard Types ---

export interface AdminDashboardData {
  overviewStats: any;
  bookingStats: any;
  roomStats: any;
  revenueStats: any;
  
  totalRevenue?: number;
  totalBookings?: number;
  totalRooms?: number;
  activeRooms?: number;
  occupancyRate?: number;
  
  revenueChart: any[];
  bookingTrendChart: any[];
  roomOccupancyChart: any[];
  
  recentBookings: any[];
  todayActivities: any[];
}

export interface DashboardFilterRequest {
  startDate?: string;
  endDate?: string;
  period?: 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM';
  groupBy?: 'DAY' | 'WEEK' | 'MONTH';
}

export interface RecommendedRoom {
  roomId: string;
  roomName: string;
  roomType: string;
  thumbnailImage: string;
  pricePerNight: number;
  rating: number;
  matchReason?: string;
}

export interface UserDashboardData {
  userStats: {
    totalSpent: number;
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    loyaltyPoints: number;
    membershipTier: 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
    totalNightsStayed: number;
  };
  recentBookings: Booking[];
  upcomingBookings: any[];
  recommendedRooms: RecommendedRoom[];
  activitySummary: any;
}

export interface PublicStats {
    totalRooms: number;
    availableRooms: number;
    happyGuests?: number;
    yearsOfOperation?: number;
    averageRating?: number;
}

// --- Chatbot Types ---

export interface ChatSession {
  sessionId: string;
  userId?: string;
  userName?: string;
  messages?: any[];
  status?: string;
  createdAt?: string;
}

export interface ChatMessage {
  id?: string;
  content?: string; 
  message?: string; 
  type: 'TEXT' | 'IMAGE' | 'QUICK_REPLY' | 'CARD' | 'TYPING';
  sender?: 'USER' | 'BOT' | 'STAFF';
  role?: 'user' | 'model'; 
  timestamp?: string;
  quickReplies?: any[];
  cards?: any[];
}