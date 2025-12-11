package com.bean.hotel_management.room.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    private String id;

    @NotBlank(message = "Số phòng không được để trống")
    private String roomNumber; // 101, 102, 201, 202...

    @NotBlank(message = "Tên phòng không được để trống")
    private String name; // Deluxe Suite, Executive Room...

    @NotNull(message = "Loại phòng không được để trống")
    private RoomType type; // STANDARD, DELUXE, SUITE, PRESIDENTIAL

    @NotBlank(message = "Mô tả không được để trống")
    private String description;

    @NotNull(message = "Giá phòng không được để trống")
    @Min(value = 0, message = "Giá phòng phải lớn hơn 0")
    private Double pricePerNight; // Giá theo đêm

    @NotNull(message = "Diện tích không được để trống")
    @Min(value = 1, message = "Diện tích phải lớn hơn 0")
    private Integer size; // m²

    @NotNull(message = "Số lượng giường không được để trống")
    @Min(value = 1, message = "Số lượng giường phải lớn hơn 0")
    private Integer bedCount;

    private BedType bedType; // SINGLE, DOUBLE, QUEEN, KING

    @NotNull(message = "Sức chứa không được để trống")
    @Min(value = 1, message = "Sức chứa phải lớn hơn 0")
    private Integer maxOccupancy; // Số người tối đa

    private Integer floor; // Tầng

    private RoomView view; // CITY, GARDEN, POOL, SEA

    private List<String> amenities; // Wifi, TV, Minibar, AC, Balcony...

    private List<String> images; // URLs của ảnh phòng

    private String thumbnailImage; // Ảnh thumbnail chính

    @NotNull(message = "Trạng thái không được để trống")
    private RoomStatus status; // AVAILABLE, OCCUPIED, MAINTENANCE, CLEANING

    private Boolean isActive; // Phòng có đang hoạt động không

    private Boolean isFeatured; // Phòng nổi bật

    private Boolean allowSmoking; // Cho phép hút thuốc

    private Boolean hasBathroom; // Có phòng tắm riêng

    private Boolean hasBalcony; // Có ban công

    private Boolean hasKitchen; // Có bếp

    // Rating & Reviews
    private Double averageRating; // 0-5

    private Integer totalReviews;

    // Booking stats
    private Integer totalBookings;

    private LocalDateTime lastBookedDate;

    private LocalDateTime createdDate;

    private LocalDateTime updatedDate;

    private String createdBy; // Admin user ID

    private String notes; // Ghi chú cho admin
}