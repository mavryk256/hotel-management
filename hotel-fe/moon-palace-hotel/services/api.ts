import axios from 'axios';
import { 
  ApiResponse, Room, Page, SearchRoomCriteria, RoomStatus, User, 
  Booking, CreateBookingRequest, BookingSearchCriteria, BookingStats,
  AdminDashboardData, DashboardFilterRequest, UserDashboardData, PublicStats,
  ChatSession, UserFilterParams, CreateRoomRequest,
  ResetPasswordRequest,
  CreateGroupBookingRequest,
  PaymentMethod,
  DailyReport,
  MonthlyReport,
  ServiceCharge
} from '../types';

const api = axios.create({
  baseURL: 'https://api.moonelia.site/api',
  // baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lux_token');

    const NO_TOKEN_PATHS = [
      '/auth/login',
      '/auth/register',
      '/auth/user/login',
      '/auth/userlogin',
      '/auth/logout',
      '/auth/forgot-password',
      '/bookings/check-availability', 
      '/bookings/room/'
    ];

    const isNoTokenPath = NO_TOKEN_PATHS.some(path => 
      config.url?.includes(path)
    );

    if (isNoTokenPath || !token || token === 'null' || token === 'undefined' || token.trim() === '') {
      delete config.headers.Authorization;
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("401 Unauthorized - likely expired token");
      return Promise.reject(error);
    }

    if (status === 403) {
      localStorage.removeItem('lux_token');
      localStorage.removeItem('lux_user');

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);


export default api;

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post(`/auth/forgot-password?email=${email}`),
  changePassword: (data: any) => api.post('/auth/change-password', data),
  refreshToken: (data: any) => api.post('/auth/refresh-token', data),
  resetPassword: (criteria: ResetPasswordRequest) => api.post('/auth/reset-password', criteria),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  sendVerificationEmail: (email: string) => api.post(`/auth/send-verification-email?email=${email}`)
};

export const roomApi = {
  getAll: (page = 0, size = 10, sortBy = 'createdDate', sortOrder = 'desc') => 
    api.get<ApiResponse<Page<Room>>>(`/rooms?page=${page}&size=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`),
  
  getById: (id: string) => 
    api.get<ApiResponse<Room>>(`/rooms/${id}`),
  
  getByNumber: (roomNumber: string) => 
    api.get<ApiResponse<Room>>(`/rooms/room-number/${roomNumber}`),
  
  search: (criteria: SearchRoomCriteria) => 
    api.post<ApiResponse<Page<Room>>>('/rooms/search', criteria),
  
  getFeatured: () => 
    api.get<ApiResponse<Room[]>>('/rooms/featured'),
  
  getAvailable: () => 
    api.get<ApiResponse<Room[]>>('/rooms/available'),
  
  getByType: (type: string) => 
    api.get<ApiResponse<Room[]>>(`/rooms/type/${type}`),
  
  checkAvailability: (id: string) => 
    api.get<ApiResponse<boolean>>(`/rooms/check-availability/${id}`),
};

export const bookingApi = {
  // --- USER ENDPOINTS ---
  create: (data: CreateBookingRequest) =>
    api.post<ApiResponse<Booking>>('/bookings', data),
  
  createGroup: (data: CreateGroupBookingRequest) =>
    api.post<ApiResponse<Booking[]>>('/bookings/group', data),

  getById: (id: string) =>
    api.get<ApiResponse<Booking>>(`/bookings/${id}`),
  
  getByNumber: (bookingNumber: string) =>
    api.get<ApiResponse<Booking>>(`/bookings/number/${bookingNumber}`),

  cancel: (id: string, reason: string) =>
    api.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { cancellationReason: reason }),
  
  update: (id: string, data: Partial<Booking>) =>
    api.put<ApiResponse<Booking>>(`/bookings/${id}`, data),

  getMyBookings: (page = 0, size = 10, sortBy = 'createdDate', sortOrder = 'desc') =>
    api.get<ApiResponse<Page<Booking>>>(`/bookings/my-bookings?page=${page}&size=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`),
  
  getUpcoming: () =>
    api.get<ApiResponse<Booking[]>>('/bookings/my-bookings/upcoming'),
  
  getHistory: () =>
    api.get<ApiResponse<Booking[]>>('/bookings/my-bookings/history'),
  
  checkAvailability: (data: { roomId: string, checkInDate: string, checkOutDate: string }) =>
    api.post<ApiResponse<boolean>>('/bookings/check-availability', data),
  
  getUnavailableDates: (roomId: string, startDate: string, endDate: string) =>
    api.get<ApiResponse<string[]>>(`/bookings/room/${roomId}/unavailable-dates?startDate=${startDate}&endDate=${endDate}`),

  payDeposit: (id: string, method: PaymentMethod, transactionId?: string) =>
    api.post<ApiResponse<any>>(`/bookings/${id}/deposit`, { paymentMethod: method, paymentTransactionId: transactionId }),
    
  payRemaining: (id: string, method: PaymentMethod, transactionId?: string) =>
    api.post<ApiResponse<any>>(`/bookings/${id}/payment`, { paymentMethod: method, paymentTransactionId: transactionId }),


  // --- ADMIN ENDPOINTS ---
  search: (criteria: BookingSearchCriteria) =>
    api.post<ApiResponse<Page<Booking>>>('/bookings/admin/search', criteria),
  
  searchByCCCD: (cccd: string) =>
    api.get<ApiResponse<Booking[]>>(`/bookings/admin/cccd/${cccd}`),
    
  getGroupBookings: (groupBookingId: string) =>
    api.get<ApiResponse<Booking[]>>(`/bookings/admin/group/${groupBookingId}`),

  getByStatus: (status: string) =>
    api.get<ApiResponse<Booking[]>>(`/bookings/admin/status/${status}`),

  confirm: (id: string) =>
    api.patch<ApiResponse<Booking>>(`/bookings/admin/${id}/confirm`),
  
  checkIn: (id: string, data?: any) =>
    api.patch<ApiResponse<Booking>>(`/bookings/admin/${id}/check-in`, data),
  
  checkOut: (id: string) =>
    api.patch<ApiResponse<Booking>>(`/bookings/admin/${id}/check-out`),
  
  // Administrative Actions
  approveEarlyCheckIn: (id: string, fee: number) =>
    api.patch<ApiResponse<Booking>>(`/bookings/admin/${id}/approve-early-checkin?fee=${fee}`),

  approveLateCheckOut: (id: string, fee: number) =>
    api.patch<ApiResponse<Booking>>(`/bookings/admin/${id}/approve-late-checkout?fee=${fee}`),

  applyDiscount: (id: string, discountAmount: number) =>
    api.patch<ApiResponse<Booking>>(`/bookings/admin/${id}/discount?discountAmount=${discountAmount}`),
    
  addAdminNotes: (id: string, notes: string) =>
    api.patch<ApiResponse<Booking>>(`/bookings/admin/${id}/notes?notes=${encodeURIComponent(notes)}`),
    
  markNoShow: (id: string) =>
    api.patch<ApiResponse<Booking>>(`/bookings/admin/${id}/no-show`),
    
  complete: (id: string) =>
    api.patch<ApiResponse<Booking>>(`/bookings/admin/${id}/complete`),
    
  refund: (id: string) =>
    api.post<ApiResponse<any>>(`/bookings/admin/${id}/refund`),

  // Service Charges
  addServiceCharge: (id: string, charge: Partial<ServiceCharge>) =>
    api.post<ApiResponse<Booking>>(`/bookings/admin/${id}/service-charges`, charge),

  getServiceCharges: (id: string) =>
    api.get<ApiResponse<ServiceCharge[]>>(`/bookings/admin/${id}/service-charges`),
    
  removeServiceCharge: (id: string, chargeIndex: number) =>
    api.delete<ApiResponse<any>>(`/bookings/admin/${id}/service-charges/${chargeIndex}`),

  // Housekeeping
  getNeedsCleaning: () =>
    api.get<ApiResponse<any[]>>('/bookings/admin/housekeeping/needs-cleaning'),
    
  markCleaned: (id: string) =>
    api.patch<ApiResponse<any>>(`/bookings/admin/${id}/mark-cleaned`),

  // Stats & Reports
  getStatistics: () =>
    api.get<ApiResponse<BookingStats>>('/bookings/admin/statistics'),
  
  getTodayCheckIns: () =>
    api.get<ApiResponse<Booking[]>>('/bookings/admin/today/check-ins'),

  getTodayCheckOuts: () =>
    api.get<ApiResponse<Booking[]>>('/bookings/admin/today/check-outs'),
    
  getTotalRevenue: () =>
    api.get<ApiResponse<number>>('/bookings/admin/revenue/total'),
    
  getRevenueByRange: (startDate: string, endDate: string) =>
    api.get<ApiResponse<any>>(`/bookings/admin/revenue/range?startDate=${startDate}&endDate=${endDate}`),
    
  getBookingsBySource: () =>
    api.get<ApiResponse<Record<string, number>>>('/bookings/admin/bookings-by-source'),
    
  getOccupancyRate: (startDate: string, endDate: string) =>
    api.get<ApiResponse<number>>(`/bookings/admin/occupancy-rate?startDate=${startDate}&endDate=${endDate}`),
    
  getDailyReport: (date: string) =>
    api.get<ApiResponse<DailyReport>>(`/bookings/admin/reports/daily?date=${date}`),
    
  getMonthlyReport: (year: number, month: number) =>
    api.get<ApiResponse<MonthlyReport>>(`/bookings/admin/reports/monthly?year=${year}&month=${month}`),
    
  // Emails
  sendConfirmationEmail: (id: string) =>
    api.post<ApiResponse<any>>(`/bookings/admin/${id}/send-confirmation`),
    
  sendReminderEmail: (id: string) =>
    api.post<ApiResponse<any>>(`/bookings/admin/${id}/send-reminder`),
    
  sendBulkReminders: () =>
    api.post<ApiResponse<any>>('/bookings/admin/send-bulk-reminders'),
};

export const adminRoomApi = {
  create: (data: CreateRoomRequest) => 
    api.post<ApiResponse<Room>>('/rooms/admin', data),
  
  update: (id: string, data: Partial<Room>) => 
    api.put<ApiResponse<Room>>(`/rooms/admin/${id}`, data),
  
  delete: (id: string) => 
    api.delete<ApiResponse<null>>(`/rooms/admin/${id}`),
  
  updateStatus: (id: string, status: RoomStatus) => 
    api.patch<ApiResponse<Room>>(`/rooms/admin/${id}/status?status=${status}`),
  
  toggleFeatured: (id: string) => 
    api.patch<ApiResponse<Room>>(`/rooms/admin/${id}/toggle-featured`),
  
  toggleActive: (id: string) => 
    api.patch<ApiResponse<Room>>(`/rooms/admin/${id}/toggle-active`),
  
  updateImages: (id: string, images: string[]) => 
    api.post<ApiResponse<Room>>(`/rooms/admin/${id}/images`, images),
  
  updateAmenities: (id: string, amenities: string[]) => 
    api.post<ApiResponse<Room>>(`/rooms/admin/${id}/amenities`, amenities),
    
  getStatistics: () => 
    api.get<ApiResponse<any>>('/rooms/admin/statistics'),
};

export const userApi = {
  getProfile: () => 
    api.get<ApiResponse<User>>('/users/me'),
  
  updateProfile: (data: Partial<User>) => 
    api.put<ApiResponse<User>>('/users/update-profile', data),
};

export const adminUserApi = {
  getUsers: (params: UserFilterParams) => {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.role) queryParams.append('role', params.role);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.isLocked !== undefined) queryParams.append('isLocked', params.isLocked.toString());

    return api.get<ApiResponse<Page<User>>>(`/users/admin?${queryParams.toString()}`);
  },

  getById: (id: string) => 
    api.get<ApiResponse<User>>(`/users/admin/${id}`),

  addUser: (data: Partial<User> & { password?: string }) => 
    api.post<ApiResponse<User>>('/users/admin', data),

  updateById: (id: string, data: Partial<User>) => 
    api.put<ApiResponse<User>>(`/users/admin/${id}`, data),
  
  deactivate: (id: string) => 
    api.delete<ApiResponse<User>>(`/users/admin/${id}/deactivate`),
  
  activate: (id: string) => 
    api.put<ApiResponse<User>>(`/users/admin/${id}/activate`),

  lock: (id: string) => 
    api.put<ApiResponse<User>>(`/users/admin/${id}/lock`),
  
  unlock: (id: string) => 
    api.put<ApiResponse<User>>(`/users/admin/${id}/unlock`),
};

export const dashboardApi = {
  getAdminDashboard: () => 
    api.get<ApiResponse<AdminDashboardData>>('/dashboard/admin'),
  
  getAdminDashboardFiltered: (filter: DashboardFilterRequest) => 
    api.post<ApiResponse<AdminDashboardData>>('/dashboard/admin/filter', filter),
  
  getOverviewStats: () => 
    api.get<ApiResponse<any>>('/dashboard/admin/overview'),
  
  getBookingStats: (params?: { startDate?: string, endDate?: string }) => 
    api.get<ApiResponse<any>>('/dashboard/admin/stats/bookings', { params }),
  
  getRoomStats: () => 
    api.get<ApiResponse<any>>('/dashboard/admin/stats/rooms'),
  
  getRevenueStats: (params?: { startDate?: string, endDate?: string }) => 
    api.get<ApiResponse<any>>('/dashboard/admin/stats/revenue', { params }),
  
  getRecentBookings: (limit = 10) => 
    api.get<ApiResponse<any>>(`/dashboard/admin/recent-bookings?limit=${limit}`),
  
  getTodayActivities: () => 
    api.get<ApiResponse<any>>('/dashboard/admin/today-activities'),
  
  getRevenueChart: (params: { startDate: string, endDate: string, groupBy?: string }) => 
    api.get<ApiResponse<any>>('/dashboard/admin/charts/revenue', { params }),
  
  getBookingTrendChart: (params: { startDate: string, endDate: string, groupBy?: string }) => 
    api.get<ApiResponse<any>>('/dashboard/admin/charts/booking-trend', { params }),
  
  getRoomOccupancyChart: (params: { startDate: string, endDate: string }) => 
    api.get<ApiResponse<any>>('/dashboard/admin/charts/room-occupancy', { params }),

  getUserDashboard: () => 
    api.get<ApiResponse<UserDashboardData>>('/dashboard/user'),
  
  getUserStats: () => 
    api.get<ApiResponse<any>>('/dashboard/user/stats'),
  
  getPublicStats: () => 
    api.get<ApiResponse<PublicStats>>('/dashboard/public/stats'),
};

export const chatbotApi = {
  startSession: (userId?: string, userName?: string) => 
    api.post<ApiResponse<ChatSession>>(`/chatbot/start?userId=${userId || ''}&userName=${userName || ''}`),
  
  sendMessage: (data: { message: string, sessionId: string, userId?: string, context?: string }) =>
    api.post<ApiResponse<{ sessionId: string, message: string, messageType: string, quickReplies: any[], cards: any[] }>>('/chatbot/chat', data),
  
  getConversationHistory: (sessionId: string) =>
    api.get<ApiResponse<ChatSession>>(`/chatbot/conversation/${sessionId}`),
  
  endSession: (sessionId: string) =>
    api.post<ApiResponse<null>>(`/chatbot/end/${sessionId}`),
  
  submitFeedback: (data: { sessionId: string, rating: number, feedback?: string, wasHelpful?: boolean }) =>
    api.post<ApiResponse<null>>('/chatbot/feedback', data)
};

export const paymentApi = {
  processPayment: (data: { bookingId: string, amount: number, method: string }) => 
    api.post<ApiResponse<any>>('/payments/process', data),
    
  simulatePayment: (bookingId: string) => 
    new Promise<ApiResponse<any>>((resolve) => {
        setTimeout(() => {
            resolve({
                status: 'success',
                message: 'Payment processed successfully',
                data: { transactionId: 'TXN-' + Date.now(), bookingId }
            });
        }, 2000);
    }),
};