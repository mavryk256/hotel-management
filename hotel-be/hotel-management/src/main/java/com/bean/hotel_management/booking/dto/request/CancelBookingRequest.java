package com.bean.hotel_management.booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancelBookingRequest {

    @NotBlank(message = "Lý do hủy không được để trống")
    @Size(min = 10, max = 500, message = "Lý do hủy từ 10-500 ký tự")
    private String cancellationReason;
}

