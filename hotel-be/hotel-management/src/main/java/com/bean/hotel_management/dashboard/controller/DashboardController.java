package com.bean.hotel_management.dashboard.controller;

import com.bean.hotel_management.common.dto.ApiResponse;
import com.bean.hotel_management.dashboard.dto.*;
import com.bean.hotel_management.dashboard.service.IDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final IDashboardService dashboardService;

    // ==================== ADMIN DASHBOARD ====================

    /**
     * Lấy complete admin dashboard
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAdminDashboard() {
        AdminDashboardResponse dashboard = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy admin dashboard thành công", dashboard));
    }

    /**
     * Lấy admin dashboard với filter
     */
    @PostMapping("/admin/filter")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAdminDashboardWithFilter(
            @RequestBody DashboardFilterRequest filter) {

        AdminDashboardResponse dashboard = dashboardService.getAdminDashboard(filter);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy admin dashboard thành công", dashboard));
    }

    /**
     * Lấy overview statistics
     */
    @GetMapping("/admin/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getOverviewStats() {
        OverviewStats stats = dashboardService.getOverviewStats();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy overview stats thành công", stats));
    }

    /**
     * Lấy booking statistics
     */
    @GetMapping("/admin/stats/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getBookingStats(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null) startDate = LocalDate.now().withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();

        BookingStats stats = dashboardService.getBookingStats(startDate, endDate);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy booking stats thành công", stats));
    }

    /**
     * Lấy room statistics
     */
    @GetMapping("/admin/stats/rooms")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getRoomStats() {
        RoomStats stats = dashboardService.getRoomStats();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy room stats thành công", stats));
    }

    /**
     * Lấy revenue statistics
     */
    @GetMapping("/admin/stats/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getRevenueStats(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null) startDate = LocalDate.now().withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();

        RevenueStats stats = dashboardService.getRevenueStats(startDate, endDate);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy revenue stats thành công", stats));
    }

    /**
     * Lấy recent bookings
     */
    @GetMapping("/admin/recent-bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getRecentBookings(
            @RequestParam(defaultValue = "10") Integer limit) {

        List<RecentBooking> bookings = dashboardService.getRecentBookings(limit);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy recent bookings thành công", bookings));
    }

    /**
     * Lấy today activities
     */
    @GetMapping("/admin/today-activities")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getTodayActivities() {
        List<TodayActivity> activities = dashboardService.getTodayActivities();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy today activities thành công", activities));
    }

    // ==================== CHARTS ====================

    /**
     * Revenue chart
     */
    @GetMapping("/admin/charts/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getRevenueChart(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "DAY") String groupBy) {

        List<ChartData> chartData = dashboardService.getRevenueChart(
                startDate, endDate, groupBy);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy revenue chart thành công", chartData));
    }

    /**
     * Booking trend chart
     */
    @GetMapping("/admin/charts/booking-trend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getBookingTrendChart(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "DAY") String groupBy) {

        List<ChartData> chartData = dashboardService.getBookingTrendChart(
                startDate, endDate, groupBy);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy booking trend chart thành công", chartData));
    }

    /**
     * Room occupancy chart
     */
    @GetMapping("/admin/charts/room-occupancy")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getRoomOccupancyChart(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<ChartData> chartData = dashboardService.getRoomOccupancyChart(
                startDate, endDate);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy room occupancy chart thành công", chartData));
    }

    /**
     * Revenue by room type
     */
    @GetMapping("/admin/charts/revenue-by-room-type")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getRevenueByRoomType(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<ChartData> chartData = dashboardService.getRevenueByRoomType(
                startDate, endDate);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy revenue by room type thành công", chartData));
    }

    /**
     * Booking status distribution
     */
    @GetMapping("/admin/charts/booking-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getBookingStatusDistribution() {
        List<ChartData> chartData = dashboardService.getBookingStatusDistribution();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy booking status distribution thành công",
                        chartData));
    }

    /**
     * Payment method distribution
     */
    @GetMapping("/admin/charts/payment-methods")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getPaymentMethodDistribution(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<ChartData> chartData = dashboardService.getPaymentMethodDistribution(
                startDate, endDate);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy payment method distribution thành công",
                        chartData));
    }

    // ==================== ANALYTICS ====================

    /**
     * Top performing rooms
     */
    @GetMapping("/admin/analytics/top-rooms")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getTopPerformingRooms(
            @RequestParam(defaultValue = "10") Integer limit) {

        List<ChartData> data = dashboardService.getTopPerformingRooms(limit);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy top performing rooms thành công", data));
    }

    /**
     * Peak booking times
     */
    @GetMapping("/admin/analytics/peak-times")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getPeakBookingTimes() {
        List<ChartData> data = dashboardService.getPeakBookingTimes();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy peak booking times thành công", data));
    }

    /**
     * Average length of stay
     */
    @GetMapping("/admin/analytics/avg-length-of-stay")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAverageLengthOfStay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Double avgStay = dashboardService.getAverageLengthOfStay(startDate, endDate);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy average length of stay thành công", avgStay));
    }

    /**
     * Cancellation trends
     */
    @GetMapping("/admin/analytics/cancellation-trends")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getCancellationTrends(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<ChartData> data = dashboardService.getCancellationTrends(startDate, endDate);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy cancellation trends thành công", data));
    }

    // ==================== USER DASHBOARD ====================

    /**
     * Lấy user dashboard
     */
    @GetMapping("/user")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getUserDashboard(Authentication authentication) {
        String userEmail = authentication.getName();
        UserDashboardResponse dashboard = dashboardService.getUserDashboard(userEmail);

        return ResponseEntity.ok(
                ApiResponse.success("Lấy user dashboard thành công", dashboard));
    }

    /**
     * Lấy user statistics
     */
    @GetMapping("/user/stats")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getUserStats(Authentication authentication) {
        String userEmail = authentication.getName();
        UserStats stats = dashboardService.getUserStats(userEmail);

        return ResponseEntity.ok(
                ApiResponse.success("Lấy user stats thành công", stats));
    }

    /**
     * Lấy user activity summary
     */
    @GetMapping("/user/activity-summary")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getUserActivitySummary(Authentication authentication) {
        String userEmail = authentication.getName();
        UserActivitySummary summary = dashboardService.getUserActivitySummary(userEmail);

        return ResponseEntity.ok(
                ApiResponse.success("Lấy user activity summary thành công", summary));
    }

    /**
     * Lấy recommended rooms
     */
    @GetMapping("/user/recommended-rooms")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getRecommendedRooms(Authentication authentication) {
        String userEmail = authentication.getName();
        List<RecommendedRoom> rooms = dashboardService.getRecommendedRooms(userEmail);

        return ResponseEntity.ok(
                ApiResponse.success("Lấy recommended rooms thành công", rooms));
    }

    // ==================== PUBLIC ENDPOINTS ====================

    /**
     * Lấy basic statistics (for public homepage)
     */
    @GetMapping("/public/stats")
    public ResponseEntity<ApiResponse> getPublicStats() {
        OverviewStats stats = dashboardService.getOverviewStats();

        // Only return non-sensitive data
        return ResponseEntity.ok(
                ApiResponse.success("Lấy public stats thành công", Map.of(
                        "totalRooms", stats.getTotalRooms(),
                        "availableRooms", stats.getAvailableRooms()
                )));
    }
}