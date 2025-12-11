package com.bean.hotel_management.booking.model;

import lombok.Getter;

@Getter
public enum BookingStatus {
    PENDING("Pending", "Chờ xác nhận", "orange"),
    CONFIRMED("Confirmed", "Đã xác nhận", "blue"),
    CHECKED_IN("Checked In", "Đã check-in", "green"),
    CHECKED_OUT("Checked Out", "Đã check-out", "gray"),
    CANCELLED("Cancelled", "Đã hủy", "red"),
    NO_SHOW("No Show", "Không đến", "purple"),
    COMPLETED("Completed", "Hoàn thành", "green");

    private final String displayName;
    private final String vietnameseName;
    private final String colorCode;

    BookingStatus(String displayName, String vietnameseName, String colorCode) {
        this.displayName = displayName;
        this.vietnameseName = vietnameseName;
        this.colorCode = colorCode;
    }
}