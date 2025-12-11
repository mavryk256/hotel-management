package com.bean.hotel_management.room.mapper;

import com.bean.hotel_management.room.dto.CreateRoomRequest;
import com.bean.hotel_management.room.dto.RoomResponse;
import com.bean.hotel_management.room.model.Room;
import com.bean.hotel_management.room.model.RoomStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

/**
 * Mapper để chuyển đổi giữa Room entity và DTOs
 * Tách riêng logic mapping ra khỏi Service để code sạch hơn
 */
@Component
public class RoomMapper {

    /**
     * Chuyển từ CreateRoomRequest sang Room entity
     */
    public Room toEntity(CreateRoomRequest request, String createdBy) {
        return Room.builder()
                .roomNumber(request.getRoomNumber())
                .name(request.getName())
                .type(request.getType())
                .description(request.getDescription())
                .pricePerNight(request.getPricePerNight())
                .size(request.getSize())
                .bedCount(request.getBedCount())
                .bedType(request.getBedType())
                .maxOccupancy(request.getMaxOccupancy())
                .floor(request.getFloor())
                .view(request.getView())
                .amenities(request.getAmenities())
                .images(Optional.ofNullable(request.getImages()).orElse(new ArrayList<>()))
                .thumbnailImage(request.getThumbnailImage())
                .status(RoomStatus.AVAILABLE)
                .isActive(true)
                .isFeatured(false)
                .allowSmoking(Optional.ofNullable(request.getAllowSmoking()).orElse(false))
                .hasBathroom(request.getHasBathroom())
                .hasBalcony(Optional.ofNullable(request.getHasBalcony()).orElse(false))
                .hasKitchen(Optional.ofNullable(request.getHasKitchen()).orElse(false))
                .averageRating(0.0)
                .totalReviews(0)
                .totalBookings(0)
                .createdDate(LocalDateTime.now())
                .createdBy(createdBy)
                .notes(request.getNotes())
                .build();
    }

    /**
     * Chuyển từ Room entity sang RoomResponse
     */
    public RoomResponse toResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .name(room.getName())
                .type(room.getType())
                .typeDisplay(room.getType().getVietnameseName())
                .description(room.getDescription())
                .pricePerNight(room.getPricePerNight())
                .size(room.getSize())
                .bedCount(room.getBedCount())
                .bedType(room.getBedType())
                .bedTypeDisplay(room.getBedType().getVietnameseName())
                .maxOccupancy(room.getMaxOccupancy())
                .floor(room.getFloor())
                .view(room.getView())
                .viewDisplay(room.getView() != null ? room.getView().getVietnameseName() : null)
                .amenities(room.getAmenities())
                .images(room.getImages())
                .thumbnailImage(room.getThumbnailImage())
                .status(room.getStatus())
                .statusDisplay(room.getStatus().getVietnameseName())
                .statusColor(room.getStatus().getColorCode())
                .isActive(room.getIsActive())
                .isFeatured(room.getIsFeatured())
                .allowSmoking(room.getAllowSmoking())
                .hasBathroom(room.getHasBathroom())
                .hasBalcony(room.getHasBalcony())
                .hasKitchen(room.getHasKitchen())
                .averageRating(room.getAverageRating())
                .totalReviews(room.getTotalReviews())
                .totalBookings(room.getTotalBookings())
                .lastBookedDate(room.getLastBookedDate())
                .createdDate(room.getCreatedDate())
                .updatedDate(room.getUpdatedDate())
                .notes(room.getNotes())
                .build();
    }
}