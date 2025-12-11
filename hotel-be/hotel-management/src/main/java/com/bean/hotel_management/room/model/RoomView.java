package com.bean.hotel_management.room.model;

import lombok.Getter;

@Getter
public enum RoomView {
    CITY("City View", "Nhìn ra thành phố"),
    GARDEN("Garden View", "Nhìn ra vườn"),
    POOL("Pool View", "Nhìn ra hồ bơi"),
    SEA("Sea View", "Nhìn ra biển"),
    MOUNTAIN("Mountain View", "Nhìn ra núi"),
    COURTYARD("Courtyard View", "Nhìn ra sân trong"),
    NO_VIEW("No View", "Không có view");

    private final String displayName;
    private final String vietnameseName;

    RoomView(String displayName, String vietnameseName) {
        this.displayName = displayName;
        this.vietnameseName = vietnameseName;
    }

}