package com.bean.hotel_management.dashboard.service;

import com.bean.hotel_management.dashboard.dto.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface IDashboardService {

    // ==================== ADMIN DASHBOARD ====================

    /**
     * Lấy complete admin dashboard data
     */
    AdminDashboardResponse getAdminDashboard();

    /**
     * Lấy admin dashboard với filter
     */
    AdminDashboardResponse getAdminDashboard(DashboardFilterRequest filter);

    /**
     * Lấy overview statistics
     */
    OverviewStats getOverviewStats();

    /**
     * Lấy booking statistics
     */
    BookingStats getBookingStats(LocalDate startDate, LocalDate endDate);

    /**
     * Lấy room statistics
     */
    RoomStats getRoomStats();

    /**
     * Lấy revenue statistics
     */
    RevenueStats getRevenueStats(LocalDate startDate, LocalDate endDate);

    /**
     * Lấy recent bookings
     */
    List<RecentBooking> getRecentBookings(Integer limit);

    /**
     * Lấy today activities
     */
    List<TodayActivity> getTodayActivities();

    // ==================== CHARTS DATA ====================

    /**
     * Lấy revenue chart data
     */
    List<ChartData> getRevenueChart(LocalDate startDate, LocalDate endDate, String groupBy);

    /**
     * Lấy booking trend chart
     */
    List<ChartData> getBookingTrendChart(LocalDate startDate, LocalDate endDate, String groupBy);

    /**
     * Lấy room occupancy chart
     */
    List<ChartData> getRoomOccupancyChart(LocalDate startDate, LocalDate endDate);

    /**
     * Lấy revenue by room type
     */
    List<ChartData> getRevenueByRoomType(LocalDate startDate, LocalDate endDate);

    /**
     * Lấy booking status distribution
     */
    List<ChartData> getBookingStatusDistribution();

    /**
     * Lấy payment method distribution
     */
    List<ChartData> getPaymentMethodDistribution(LocalDate startDate, LocalDate endDate);

    // ==================== USER DASHBOARD ====================

    /**
     * Lấy user dashboard
     */
    UserDashboardResponse getUserDashboard(String userEmail);

    /**
     * Lấy user statistics
     */
    UserStats getUserStats(String userEmail);

    /**
     * Lấy user activity summary
     */
    UserActivitySummary getUserActivitySummary(String userEmail);

    /**
     * Lấy recommended rooms for user
     */
    List<RecommendedRoom> getRecommendedRooms(String userEmail);

    // ==================== ANALYTICS ====================

    /**
     * Lấy top performing rooms
     */
    List<ChartData> getTopPerformingRooms(Integer limit);

    /**
     * Lấy guest demographics
     */
    List<ChartData> getGuestDemographics();

    /**
     * Lấy peak booking times
     */
    List<ChartData> getPeakBookingTimes();

    /**
     * Lấy average length of stay
     */
    Double getAverageLengthOfStay(LocalDate startDate, LocalDate endDate);

    /**
     * Lấy cancellation trends
     */
    List<ChartData> getCancellationTrends(LocalDate startDate, LocalDate endDate);

    // ==================== COMPARISONS ====================

    /**
     * So sánh performance giữa các periods
     */
    Map<String, Object> comparePerformance(
            LocalDate period1Start, LocalDate period1End,
            LocalDate period2Start, LocalDate period2End
    );

    /**
     * Lấy year-over-year comparison
     */
    Map<String, Object> getYearOverYearComparison(Integer year);
}