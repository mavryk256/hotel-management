package com.bean.hotel_management.user.service.impl;

import com.bean.hotel_management.common.exception.ResourceNotFoundException;
import com.bean.hotel_management.user.dto.UpdateProfileRequest;
import com.bean.hotel_management.user.dto.UserResponse;
import com.bean.hotel_management.user.mapper.UserMapper;
import com.bean.hotel_management.user.model.User;
import com.bean.hotel_management.user.repository.IUserRepository;
import com.bean.hotel_management.user.service.IUserService;
import com.bean.hotel_management.user.utils.UserUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final IUserRepository iUserRepository;
    private final UserMapper userMapper;
    private final UserUtils userUtils;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String username) {
        log.info("Lấy thông tin user với email: {}", username);
        User user = iUserRepository.findByEmailOrUsername(username, username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        return userMapper.mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUserProfile(String username, UpdateProfileRequest request) {
        log.info("Cập nhật thông tin user: {}, dữ liệu: {}", username, request);
        User user = iUserRepository.findByEmailOrUsername(username, username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        String newPhoneNumber = request.getPhoneNumber();
        String newFullName = request.getFullName();
        String newUsername = request.getUsername();
        String newEmail = request.getEmail();

        if (newPhoneNumber != null && !newPhoneNumber.isBlank() && !newPhoneNumber.equals(user.getPhoneNumber())) {
            userUtils.validateDuplicatePhoneNumber(newPhoneNumber);
            user.setPhoneNumber(newPhoneNumber);
        }
        if (newFullName != null && !newFullName.isBlank() ) {
            user.setFullName(newFullName);
        }
        if (newUsername != null && !newUsername.isBlank() && !newUsername.equals(user.getUsername())) {
            userUtils.validateDuplicateUsername(newUsername);
            user.setUsername(newUsername);
        }
        if (newEmail != null && !newEmail.isBlank() && !newEmail.equals(user.getEmail())) {
            userUtils.validateDuplicateEmail(newEmail);
            user.setEmail(newEmail);
        }

        iUserRepository.save(user);

        return userMapper.mapToUserResponse(user);
    }
}
