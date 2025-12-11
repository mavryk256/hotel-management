package com.bean.hotel_management.booking.service;

import com.bean.hotel_management.booking.dto.response.*;
import com.bean.hotel_management.booking.dto.request.*;
import com.bean.hotel_management.booking.model.BookingStatus;
import com.bean.hotel_management.booking.model.ServiceCharge;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface IBookingService {

    // ==================== CRUD OPERATIONS ====================

    BookingResponse createBooking(CreateBookingRequest request, String userEmail);

    // ⭐ MỚI - Group booking (đặt nhiều phòng cùng lúc)
    List<BookingResponse> createGroupBooking(GroupBookingRequest request, String userEmail);

    BookingResponse updateBooking(String bookingId, UpdateBookingRequest request, String userEmail);

    BookingResponse cancelBooking(String bookingId, CancelBookingRequest request, String userEmail);

    BookingResponse getBookingById(String bookingId);

    BookingResponse getBookingByNumber(String bookingNumber);

    // ==================== SEARCH & FILTER ====================

    Page<BookingResponse> getUserBookings(String userEmail, int page, int size, String sortBy, String sortOrder);

    List<BookingResponse> getUserBookingHistory(String userEmail);

    List<BookingResponse> getUpcomingBookings(String userEmail);

    // ⭐ MỚI - Tìm kiếm theo CCCD
    List<BookingResponse> searchByCccdNumber(String cccdNumber);

    // ⭐ CẬP NHẬT - Search nâng cao với nhiều tiêu chí hơn
    Page<BookingResponse> searchBookings(BookingSearchRequest request);

    List<BookingResponse> getBookingsByStatus(BookingStatus status);

    List<BookingResponse> getBookingsByRoom(String roomId);

    // ⭐ MỚI - Group booking queries
    List<BookingResponse> getGroupBookings(String groupBookingId);

    // ==================== AVAILABILITY ====================

    boolean checkAvailability(CheckAvailabilityRequest request);

    List<LocalDate> getUnavailableDates(String roomId, LocalDate startDate, LocalDate endDate);

    // ⭐ MỚI - Check availability cho nhiều phòng
    Map<String, Boolean> checkMultipleRoomsAvailability(List<String> roomIds, LocalDate checkIn, LocalDate checkOut);

    // ==================== BOOKING MANAGEMENT ====================

    BookingResponse confirmBooking(String bookingId);

    // ⭐ CẬP NHẬT - Check-in với thông tin bổ sung
    BookingResponse checkIn(String bookingId, CheckInRequest request);

    BookingResponse checkOut(String bookingId);

    BookingResponse markAsNoShow(String bookingId);

    BookingResponse completeBooking(String bookingId);

    // ==================== PAYMENT ====================

    BookingResponse processPayment(String bookingId, PaymentRequest request);

    // ⭐ MỚI - Deposit payment
    BookingResponse processDepositPayment(String bookingId, PaymentRequest request);

    BookingResponse refundPayment(String bookingId);

    // ==================== SERVICE CHARGES (⭐ MỚI) ====================

    BookingResponse addServiceCharge(String bookingId, AddServiceChargeRequest request);

    BookingResponse removeServiceCharge(String bookingId, int chargeIndex);

    List<ServiceCharge> getBookingServiceCharges(String bookingId);

    Double calculateTotalServiceCharges(String bookingId);

    // ==================== STATISTICS ====================

    BookingStatistics getBookingStatistics();

    List<BookingResponse> getTodayCheckIns();

    List<BookingResponse> getTodayCheckOuts();

    Double getTotalRevenue();

    // ⭐ MỚI - Revenue statistics
    Map<String, Double> getRevenueByDateRange(LocalDate startDate, LocalDate endDate);

    Map<String, Long> getBookingsBySource();

    Double getOccupancyRate(LocalDate startDate, LocalDate endDate);

    // ==================== ADMIN OPERATIONS ====================

    BookingResponse addAdminNotes(String bookingId, String notes);

    BookingResponse applyDiscount(String bookingId, Double discountAmount);

    // ⭐ MỚI - Early check-in / Late check-out
    BookingResponse approveEarlyCheckIn(String bookingId, Double fee);

    BookingResponse approveLateCheckOut(String bookingId, Double fee);

    // ==================== EMAIL & NOTIFICATIONS (⭐ MỚI) ====================

    void sendBookingConfirmationEmail(String bookingId);

    void sendCheckInReminder(String bookingId);

    void sendBulkReminders(); // Gửi nhắc nhở hàng loạt

    // ==================== HOUSEKEEPING (⭐ MỚI) ====================

    List<BookingResponse> getRoomsNeedingCleaning();

    BookingResponse markRoomAsCleaned(String bookingId);

    // ==================== REPORTS (⭐ MỚI) ====================

    Map<String, Object> getDailyOperationsReport(LocalDate date);

    Map<String, Object> getMonthlyReport(int year, int month);
}