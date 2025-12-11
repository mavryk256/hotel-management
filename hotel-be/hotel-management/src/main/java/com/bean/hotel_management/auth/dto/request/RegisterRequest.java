package com.bean.hotel_management.auth.dto.request;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegisterRequest {
    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    @Pattern(regexp = "^\\+?[0-9]\\d{1,14}$", message = "Số điện thoại không hợp lệ")
    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;

    @Email
    @NotBlank(message = "Email không được để trống")
    private String email;

    @NotBlank(message = "Số CCCD không được để trống")
    private String cccdNumber;

    private String address;

    @NotBlank(message = "Username không được để trống")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
    )
    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
    private String password;
}
