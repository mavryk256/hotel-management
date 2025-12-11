package com.bean.hotel_management.room.model;

import lombok.Getter;

@Getter
public enum RoomStatus {
    AVAILABLE("Available", "Còn trống", "green"),
    OCCUPIED("Occupied", "Đang có khách", "red"),
    RESERVED("Reserved", "Đã đặt trước", "blue"),
    MAINTENANCE("Maintenance", "Đang bảo trì", "orange"),
    CLEANING("Cleaning", "Đang dọn dẹp", "yellow"),
    OUT_OF_SERVICE("Out of Service", "Ngừng hoạt động", "gray");

    private final String displayName;
    private final String vietnameseName;
    private final String colorCode;

    RoomStatus(String displayName, String vietnameseName, String colorCode) {
        this.displayName = displayName;
        this.vietnameseName = vietnameseName;
        this.colorCode = colorCode;
    }
}
