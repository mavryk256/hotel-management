package com.bean.hotel_management.auth.service.impl;

import com.bean.hotel_management.auth.dto.request.ChangePasswordRequest;
import com.bean.hotel_management.auth.dto.request.LoginRequest;
import com.bean.hotel_management.auth.dto.request.RegisterRequest;
import com.bean.hotel_management.auth.dto.response.AuthResponse;
import com.bean.hotel_management.user.dto.UserResponse;
import com.bean.hotel_management.user.mapper.UserMapper;
import com.bean.hotel_management.user.model.Role;
import com.bean.hotel_management.user.model.User;
import com.bean.hotel_management.auth.model.VerificationToken;
import com.bean.hotel_management.user.repository.IUserRepository;
import com.bean.hotel_management.auth.repository.IVerificationTokenRepository;
import com.bean.hotel_management.auth.service.IAuthService;
import com.bean.hotel_management.common.exception.*;
import com.bean.hotel_management.user.utils.UserUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private final IUserRepository iUserRepository;
    private final IVerificationTokenRepository verificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final UserMapper userMapper;
    private final UserUtils userUtils;

    @Value("${app.verification.token.expiration}")
    private long verificationTokenExpiration;

    @Value("${app.reset.token.expiration}")
    private long resetTokenExpiration;

    @Value("${app.test.mode:false}")
    private boolean testMode;

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String username = request.getUsername();
        User user = iUserRepository.findByEmailOrUsername(username, username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));

        userUtils.validateUserStatus(user);

        String token = jwtService.generateToken(
                user.getEmail(),
                List.of("ROLE_" + user.getRole().name())
        );

        log.info("User {} logged in successfully", user.getEmail());
        return new AuthResponse(token, userMapper.mapToUserResponse(user));
    }

    @Override
    @Transactional
    public Map<String, Object> register(RegisterRequest request) {
        userUtils.validateDuplicateUser(request.getEmail(),
                request.getUsername(),
                request.getPhoneNumber(),
                request.getCccdNumber());

        User newUser = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .username(request.getUsername())
                .phoneNumber(request.getPhoneNumber())
                .cccdNumber(request.getCccdNumber())
                .address(request.getAddress())
                .avatarUrl(null)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .isLocked(false)
                .isActive(true)
//                .isActive(false)
                .createdDate(LocalDateTime.now())
                .build();

        User savedUser = iUserRepository.save(newUser);

        // Tạo verification token
        String verificationToken = createAndSendVerificationToken(savedUser);

        String jwtToken = jwtService.generateToken(
                savedUser.getEmail(),
                List.of("ROLE_" + savedUser.getRole().name())
        );

        log.info("User {} registered successfully", savedUser.getEmail());

        // Trả về response với verification token (chỉ dùng cho testing)
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwtToken);
        response.put("user", userMapper.mapToUserResponse(savedUser));

        // Trong test mode, trả token để test trực tiếp
        if (testMode) {
            response.put("verificationToken", verificationToken);
            response.put("verificationUrl", "/api/auth/verify-email?token=" + verificationToken);
        }

        return response;
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtService.isTokenValid(refreshToken)) {
            throw new InvalidTokenException("Token không hợp lệ hoặc đã hết hạn");
        }

        String email = jwtService.extractUserId(refreshToken);
        User user = iUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        String newToken = jwtService.generateToken(
                user.getEmail(),
                List.of("ROLE_" + user.getRole().name())
        );

        return new AuthResponse(newToken, userMapper.mapToUserResponse(user));
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = iUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Mật khẩu cũ không chính xác");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new InvalidCredentialsException("Mật khẩu mới và xác nhận mật khẩu không khớp");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        iUserRepository.save(user);

        log.info("User {} changed password successfully", email);
    }

    @Override
    @Transactional
    public Map<String, Object> sendResetPasswordEmail(String email) {
        User user = iUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));

        // Xóa các token reset password cũ
        verificationTokenRepository.deleteByEmailAndTokenType(email, "PASSWORD_RESET");

        String resetToken = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(resetToken)
                .email(user.getEmail())
                .expiryDate(LocalDateTime.now().plusSeconds(resetTokenExpiration / 1000))
                .used(false)
                .tokenType("PASSWORD_RESET")
                .build();

        verificationTokenRepository.save(verificationToken);

        // Truyền token vào email service
        emailService.sendResetPasswordEmail(user.getEmail(), resetToken);

        log.info("Reset password email sent to: {}", email);

        // Trả về token để test
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Email reset mật khẩu đã được gửi");

        if (testMode) {
            response.put("resetToken", resetToken);
        }

        return response;
    }

    @Override
    @Transactional
    public Map<String, Object> resetPassword(String token, String newPassword) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Token không hợp lệ"));

        validateResetPasswordToken(verificationToken);

        User user = iUserRepository.findByEmail(verificationToken.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        user.setPassword(passwordEncoder.encode(newPassword));
        iUserRepository.save(user);
        log.info("Password reset successfully for user: {}", user.getEmail());
        verificationToken.setUsed(true);
        verificationTokenRepository.save(verificationToken);

        log.info("Password reset successfully for user: {}", user.getEmail());
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đặt lại mật khẩu thành công");
        return response;
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Token xác thực không hợp lệ"));

        validateVerificationToken(verificationToken);

        User user = iUserRepository.findByEmail(verificationToken.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        if (user.isActive()) {
            throw new InvalidCredentialsException("Tài khoản đã được xác thực trước đó");
        }

        user.setActive(true);
        iUserRepository.save(user);

        verificationToken.setUsed(true);
        verificationTokenRepository.save(verificationToken);

        log.info("Email verified successfully for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public Map<String, Object> sendVerificationEmail(String email) {
        User user = iUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));


        if (user.isActive()) {
            throw new InvalidCredentialsException("Tài khoản đã được xác thực");
        }

        // Xóa các token verification cũ
        verificationTokenRepository.deleteByEmailAndTokenType(email, "EMAIL_VERIFICATION");

        String verificationToken = createAndSendVerificationToken(user);

        log.info("Verification email sent to: {}", email);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Email xác thực đã được gửi");

        if (testMode) {
            response.put("verificationToken", verificationToken);
            response.put("verificationUrl", "/api/auth/verify-email?token=" + verificationToken);
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String username) {
        log.info("Lấy thông tin user với email: {}", username);
        User user = iUserRepository.findByEmailOrUsername(username, username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        return userMapper.mapToUserResponse(user);
    }

    // ==================== PRIVATE HELPER METHODS ====================

    private String createAndSendVerificationToken(User user) {
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .email(user.getEmail())
                .expiryDate(LocalDateTime.now().plusSeconds(verificationTokenExpiration / 1000))
                .used(false)
                .tokenType("EMAIL_VERIFICATION")
                .build();

        verificationTokenRepository.save(verificationToken);

        try {
            // Truyền token vào email service
            emailService.sendVerificationEmail(user.getEmail(), token);
        } catch (Exception e) {
            log.error("Cannot send verification email to {}: {}", user.getEmail(), e.getMessage());
            // Không throw exception, vẫn trả về token để test
        }

        return token;
    }

    private void validateVerificationToken(VerificationToken token) {
        if (token.isUsed()) {
            throw new InvalidTokenException("Token đã được sử dụng");
        }

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new TokenExpiredException("Token xác thực đã hết hạn");
        }

        if (!"EMAIL_VERIFICATION".equals(token.getTokenType())) {
            throw new InvalidTokenException("Token không hợp lệ");
        }
    }

    private void validateResetPasswordToken(VerificationToken token) {
        if (token.isUsed()) {
            throw new InvalidTokenException("Token đã được sử dụng");
        }

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new TokenExpiredException("Token reset đã hết hạn");
        }

        if (!"PASSWORD_RESET".equals(token.getTokenType())) {
            throw new InvalidTokenException("Token không hợp lệ");
        }
    }
}