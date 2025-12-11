package com.bean.hotel_management.admin.service.impl;

import com.bean.hotel_management.admin.dto.AddUserRequest;
import com.bean.hotel_management.admin.dto.FilterUserRequest;
import com.bean.hotel_management.admin.dto.UpdateUserRequest;
import com.bean.hotel_management.admin.specification.AdminSpecification;
import com.bean.hotel_management.user.dto.UserResponse;
import com.bean.hotel_management.common.exception.BusinessException;
import com.bean.hotel_management.common.exception.ResourceNotFoundException;
import com.bean.hotel_management.user.mapper.UserMapper;
import com.bean.hotel_management.user.model.Role;
import com.bean.hotel_management.user.model.User;
import com.bean.hotel_management.user.repository.IUserRepository;
import com.bean.hotel_management.admin.service.IAdminService;
import com.bean.hotel_management.user.utils.UserUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements IAdminService {

    private final IUserRepository iUserRepository;

    private final AdminSpecification adminSpecification;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final UserUtils userUtils;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(FilterUserRequest request) {
        try {
            Pageable pageable = createPageable(
                    request.getPage(),
                    request.getSize(),
                    request.getSortBy(),
                    request.getSortOrder()
            );

            log.info("Lấy danh sách người dùng với filters: {}", request);

            List<User> allUsers = iUserRepository.findAll();
            List<User> filteredUsers = allUsers.stream()
                    .filter(adminSpecification.createPredicate(request))
                    .collect(Collectors.toList());

            log.info("Tổng số người dùng sau khi lọc: {}", filteredUsers.size());

            return createPageFromList(filteredUsers, pageable);

        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách người dùng: {}", e.getMessage(), e);
            throw new BusinessException("Không thể lấy danh sách người dùng");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(String id) {
        log.info("Lấy thông tin người dùng với ID: {}", id);
        return userMapper.mapToUserResponse(getUserEntityById(id));
    }

    @Override
    @Transactional
    public UserResponse updateUserById(String id, UpdateUserRequest request) {
        log.info("Cập nhật thông tin người dùng với ID: {}", id);
        User updatedUser = getUserEntityById(id);

        String newPhoneNumber = request.getPhoneNumber();
        String newFullName = request.getFullName();
        String newUsername = request.getUsername();
        String newEmail = request.getEmail();
        String newRole = request.getRole();
        String newAddress = request.getAddress();
        String newCccdNumber = request.getCccdNumber();

        if (newPhoneNumber != null && !newPhoneNumber.isBlank() && !newPhoneNumber.equals(updatedUser.getPhoneNumber())) {
            userUtils.validateDuplicatePhoneNumber(newPhoneNumber);
            updatedUser.setPhoneNumber(newPhoneNumber);
        }
        if (newFullName != null && !newFullName.isBlank() ) {
            updatedUser.setFullName(newFullName);
        }
        if (newUsername != null && !newUsername.isBlank() && !newUsername.equals(updatedUser.getUsername())) {
            userUtils.validateDuplicateUsername(newUsername);
            updatedUser.setUsername(newUsername);
        }
        if (newEmail != null && !newEmail.isBlank() && !newEmail.equals(updatedUser.getEmail())) {
            userUtils.validateDuplicateEmail(newEmail);
            updatedUser.setEmail(newEmail);
        }

        if (newAddress != null && !newAddress.isBlank() ) {
            updatedUser.setAddress(newAddress);
        }

        if (newCccdNumber != null && !newCccdNumber.isBlank() && !newCccdNumber.equals(updatedUser.getCccdNumber())) {
            userUtils.validateDuplicateCccdNumber(newCccdNumber);
            updatedUser.setCccdNumber(newCccdNumber);
        }

        if (newRole != null && !newRole.isBlank()) {
            try {
                updatedUser.setRole(Enum.valueOf(Role.class, newRole.toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Vai trò không hợp lệ: " + newRole);
            }
        }

        iUserRepository.save(updatedUser);

        return userMapper.mapToUserResponse(updatedUser);
    }

    @Override
    @Transactional
    public UserResponse deactivateUserById(String id) {
        User userToDelete = getUserEntityById(id);
        log.info("Vô hiệu hóa người dùng với ID: {}", id);
        userToDelete.setActive(false);
        iUserRepository.save(userToDelete);

        return userMapper.mapToUserResponse(userToDelete);
    }

    @Override
    @Transactional
    public UserResponse activateUserById(String id) {
        User activateUser  = getUserEntityById(id);
        log.info("Kích hoạt tài khoản người dùng với ID: {}", id);
        activateUser.setActive(true);
        iUserRepository.save(activateUser);
        return userMapper.mapToUserResponse(activateUser);
    }

    @Override
    @Transactional
    public UserResponse lockUserById(String id) {
        User lockUser  = getUserEntityById(id);
        log.info("Khoá tài khoản người dùng với ID: {}", id);
        lockUser.setLocked(true);
        iUserRepository.save(lockUser);
        return userMapper.mapToUserResponse(lockUser);
    }

    @Override
    @Transactional
    public UserResponse unlockUserById(String id) {
        User unlockUser  = getUserEntityById(id);
        log.info("Mở khoá tài khoản người dùng với ID: {}", id);
        unlockUser.setLocked(false);
        iUserRepository.save(unlockUser);
        return userMapper.mapToUserResponse(unlockUser);
    }

    @Override
    @Transactional
    public UserResponse addUser(AddUserRequest request) {
        log.info("Thêm mới người dùng với thông tin: {}", request);
        userUtils.validateDuplicateUser(request.getEmail(),
                request.getUsername(),
                request.getPhoneNumber(),
                request.getCccdNumber());

        User newUser = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .username(request.getUsername())
                .cccdNumber(request.getCccdNumber())
                .address(request.getAddress())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Enum.valueOf(Role.class, request.getRole().toUpperCase()))
                .isActive(true)
                .isLocked(false)
                .createdDate(LocalDateTime.now())
                .build();
        User savedUser = iUserRepository.save(newUser);
        return userMapper.mapToUserResponse(savedUser);
    }


    private User getUserEntityById(String id) {
        return iUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + id));
    }


    private Page<UserResponse> createPageFromList(List<User> users, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), users.size());
        List<UserResponse> userResponses = users.subList(start, end).stream()
                .map(userMapper::mapToUserResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(userResponses, pageable, users.size());
    }

    private Pageable createPageable(int page, int size, String sortBy, String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        return PageRequest.of(page, size, sort);
    }


}
