package com.bean.hotel_management.room.service.impl;

import com.bean.hotel_management.common.exception.DuplicateResourceException;
import com.bean.hotel_management.common.exception.ResourceNotFoundException;
import com.bean.hotel_management.room.dto.*;
import com.bean.hotel_management.room.mapper.RoomMapper;
import com.bean.hotel_management.room.model.*;
import com.bean.hotel_management.room.repository.IRoomRepository;
import com.bean.hotel_management.room.service.IRoomService;
import com.bean.hotel_management.room.specification.RoomSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements IRoomService {

    private final IRoomRepository roomRepository;
    private final RoomMapper roomMapper;
    private final RoomSpecification roomSpecification;

    // ==================== CRUD OPERATIONS ====================

    @Override
    @Transactional
    public RoomResponse createRoom(CreateRoomRequest request, String adminEmail) {
        validateRoomNumber(request.getRoomNumber());

        Room room = roomMapper.toEntity(request, adminEmail);
        Room savedRoom = roomRepository.save(room);

        log.info("Room created: {} by {}", savedRoom.getRoomNumber(), adminEmail);
        return roomMapper.toResponse(savedRoom);
    }

    @Override
    @Transactional
    public RoomResponse updateRoom(String roomId, UpdateRoomRequest request) {
        Room room = findRoomById(roomId);
        updateRoomFields(room, request);

        room.setUpdatedDate(LocalDateTime.now());
        Room updatedRoom = roomRepository.save(room);

        log.info("Room updated: {}", updatedRoom.getRoomNumber());
        return roomMapper.toResponse(updatedRoom);
    }

    @Override
    @Transactional
    public void deleteRoom(String roomId) {
        Room room = findRoomById(roomId);

        // Soft delete
        room.setIsActive(false);
        room.setStatus(RoomStatus.OUT_OF_SERVICE);
        room.setUpdatedDate(LocalDateTime.now());

        roomRepository.save(room);
        log.info("Room soft deleted: {}", room.getRoomNumber());
    }

    // ==================== QUERY OPERATIONS ====================

    @Override
    public RoomResponse getRoomById(String roomId) {
        return roomMapper.toResponse(findRoomById(roomId));
    }

    @Override
    public RoomResponse getRoomByRoomNumber(String roomNumber) {
        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy phòng số " + roomNumber));
        return roomMapper.toResponse(room);
    }

    @Override
    public Page<RoomResponse> getAllRooms(int page, int size, String sortBy, String sortOrder) {

        Pageable pageable = createPageable(page, size, sortBy, sortOrder);

        return roomRepository.findAll(pageable).map(roomMapper::toResponse);
    }

    @Override
    public Page<RoomResponse> searchRooms(RoomSearchRequest request) {
        Pageable pageable = createPageableFromRequest(request);

        // Keyword search
        if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
            return roomRepository.searchRooms(request.getKeyword(), pageable)
                    .map(roomMapper::toResponse);
        }

        // Filter search using specification
        List<Room> filteredRooms = roomRepository.findAll().stream()
                .filter(roomSpecification.createPredicate(request))
                .collect(Collectors.toList());

        return createPageFromList(filteredRooms, pageable);
    }

    @Override
    public List<RoomResponse> getFeaturedRooms() {
        return roomRepository.findByIsFeaturedTrue().stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomResponse> getAvailableRooms() {
        return roomRepository.findByStatusAndIsActiveTrue(RoomStatus.AVAILABLE).stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomResponse> getRoomsByType(RoomType type) {
        return roomRepository.findByTypeAndIsActiveTrue(type).stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomResponse> getRoomsByStatus(RoomStatus status) {
        return roomRepository.findByStatusAndIsActiveTrue(status).stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomResponse> getRoomsByFloor(Integer floor) {
        return roomRepository.findByFloor(floor).stream()
                .filter(Room::getIsActive)
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomResponse> getRoomsByPriceRange(Double minPrice, Double maxPrice) {
        return roomRepository.findByPricePerNightBetween(minPrice, maxPrice).stream()
                .filter(Room::getIsActive)
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomResponse> getRoomsByOccupancy(Integer minOccupancy) {
        return roomRepository.findByMaxOccupancyGreaterThanEqual(minOccupancy).stream()
                .filter(Room::getIsActive)
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    // ==================== STATUS MANAGEMENT ====================

    @Override
    @Transactional
    public RoomResponse updateRoomStatus(String roomId, RoomStatus status) {
        Room room = findRoomById(roomId);
        room.setStatus(status);
        room.setUpdatedDate(LocalDateTime.now());

        Room updatedRoom = roomRepository.save(room);
        log.info("Room {} status updated to {}", room.getRoomNumber(), status);

        return roomMapper.toResponse(updatedRoom);
    }

    @Override
    @Transactional
    public RoomResponse markAsAvailable(String roomId) {
        return updateRoomStatus(roomId, RoomStatus.AVAILABLE);
    }

    @Override
    @Transactional
    public RoomResponse markAsOccupied(String roomId) {
        return updateRoomStatus(roomId, RoomStatus.OCCUPIED);
    }

    @Override
    @Transactional
    public RoomResponse markAsMaintenance(String roomId) {
        return updateRoomStatus(roomId, RoomStatus.MAINTENANCE);
    }

    @Override
    @Transactional
    public RoomResponse markAsCleaning(String roomId) {
        return updateRoomStatus(roomId, RoomStatus.CLEANING);
    }

    // ==================== FEATURE MANAGEMENT ====================

    @Override
    @Transactional
    public RoomResponse toggleFeatured(String roomId) {
        Room room = findRoomById(roomId);
        room.setIsFeatured(!room.getIsFeatured());
        room.setUpdatedDate(LocalDateTime.now());

        Room updatedRoom = roomRepository.save(room);
        log.info("Room {} featured status toggled to {}", room.getRoomNumber(), room.getIsFeatured());

        return roomMapper.toResponse(updatedRoom);
    }

    @Override
    @Transactional
    public RoomResponse toggleActive(String roomId) {
        Room room = findRoomById(roomId);
        room.setIsActive(!room.getIsActive());

        if (!room.getIsActive()) {
            room.setStatus(RoomStatus.OUT_OF_SERVICE);
        }

        room.setUpdatedDate(LocalDateTime.now());
        Room updatedRoom = roomRepository.save(room);

        log.info("Room {} active status toggled to {}", room.getRoomNumber(), room.getIsActive());
        return roomMapper.toResponse(updatedRoom);
    }

    // ==================== IMAGE MANAGEMENT ====================

    @Override
    @Transactional
    public RoomResponse addImages(String roomId, List<String> imageUrls) {
        Room room = findRoomById(roomId);

        if (room.getImages() == null) {
            room.setImages(new ArrayList<>());
        }

        room.getImages().addAll(imageUrls);
        room.setUpdatedDate(LocalDateTime.now());

        Room updatedRoom = roomRepository.save(room);
        log.info("Added {} images to room {}", imageUrls.size(), room.getRoomNumber());

        return roomMapper.toResponse(updatedRoom);
    }

    @Override
    @Transactional
    public RoomResponse removeImage(String roomId, String imageUrl) {
        Room room = findRoomById(roomId);

        if (room.getImages() != null && room.getImages().remove(imageUrl)) {
            room.setUpdatedDate(LocalDateTime.now());
            roomRepository.save(room);
            log.info("Removed image from room {}", room.getRoomNumber());
        }

        return roomMapper.toResponse(room);
    }

    @Override
    @Transactional
    public RoomResponse setThumbnail(String roomId, String imageUrl) {
        Room room = findRoomById(roomId);
        room.setThumbnailImage(imageUrl);
        room.setUpdatedDate(LocalDateTime.now());

        Room updatedRoom = roomRepository.save(room);
        log.info("Set thumbnail for room {}", room.getRoomNumber());

        return roomMapper.toResponse(updatedRoom);
    }

    // ==================== AMENITIES MANAGEMENT ====================

    @Override
    @Transactional
    public RoomResponse addAmenities(String roomId, List<String> amenities) {
        Room room = findRoomById(roomId);

        if (room.getAmenities() == null) {
            room.setAmenities(new ArrayList<>());
        }

        room.getAmenities().addAll(amenities);
        room.setUpdatedDate(LocalDateTime.now());

        Room updatedRoom = roomRepository.save(room);
        log.info("Added {} amenities to room {}", amenities.size(), room.getRoomNumber());

        return roomMapper.toResponse(updatedRoom);
    }

    @Override
    @Transactional
    public RoomResponse removeAmenity(String roomId, String amenity) {
        Room room = findRoomById(roomId);

        if (room.getAmenities() != null && room.getAmenities().remove(amenity)) {
            room.setUpdatedDate(LocalDateTime.now());
            roomRepository.save(room);
            log.info("Removed amenity from room {}", room.getRoomNumber());
        }

        return roomMapper.toResponse(room);
    }

    // ==================== PRICE MANAGEMENT ====================

    @Override
    @Transactional
    public RoomResponse updatePrice(String roomId, Double newPrice) {
        Room room = findRoomById(roomId);
        room.setPricePerNight(newPrice);
        room.setUpdatedDate(LocalDateTime.now());

        Room updatedRoom = roomRepository.save(room);
        log.info("Updated price for room {} to {}", room.getRoomNumber(), newPrice);

        return roomMapper.toResponse(updatedRoom);
    }

    // ==================== STATISTICS ====================

    @Override
    public RoomStatistics getRoomStatistics() {
        List<Room> activeRooms = roomRepository.findByIsActiveTrue();

        return RoomStatistics.builder()
                .totalRooms(activeRooms.size())
                .availableRooms(countRoomsByStatusInList(activeRooms, RoomStatus.AVAILABLE))
                .occupiedRooms(countRoomsByStatusInList(activeRooms, RoomStatus.OCCUPIED))
                .maintenanceRooms(countRoomsByStatusInList(activeRooms, RoomStatus.MAINTENANCE))
                .cleaningRooms(countRoomsByStatusInList(activeRooms, RoomStatus.CLEANING))
                .averagePrice(calculateAveragePrice(activeRooms))
                .highestPrice(findMaxPrice(activeRooms))
                .lowestPrice(findMinPrice(activeRooms))
                .averageRating(calculateAverageRating(activeRooms))
                .totalBookings(calculateTotalBookings(activeRooms))
                .roomTypeStats(generateRoomTypeStats(activeRooms))
                .build();
    }

    @Override
    public Long countRoomsByStatus(RoomStatus status) {
        return roomRepository.countByStatusAndIsActiveTrue(status);
    }

    @Override
    public Long countRoomsByType(RoomType type) {
        return roomRepository.countByType(type);
    }

    @Override
    public Double getAveragePrice() {
        return roomRepository.findByIsActiveTrue().stream()
                .mapToDouble(Room::getPricePerNight)
                .average()
                .orElse(0.0);
    }

    // ==================== AVAILABILITY CHECK ====================

    @Override
    public boolean isRoomAvailable(String roomId) {
        Room room = findRoomById(roomId);
        return room.getIsActive() && room.getStatus() == RoomStatus.AVAILABLE;
    }

    @Override
    public boolean checkAvailabilityByNumber(String roomNumber) {
        return roomRepository.findByRoomNumber(roomNumber)
                .map(room -> room.getIsActive() && room.getStatus() == RoomStatus.AVAILABLE)
                .orElse(false);
    }

    // ==================== PRIVATE HELPER METHODS ====================

    private Room findRoomById(String roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy phòng với ID: " + roomId));
    }

    private void validateRoomNumber(String roomNumber) {
        if (roomRepository.existsByRoomNumber(roomNumber)) {
            throw new DuplicateResourceException(
                    "Số phòng " + roomNumber + " đã tồn tại");
        }
    }

    private void updateRoomFields(Room room, UpdateRoomRequest request) {
        Optional.ofNullable(request.getName()).ifPresent(room::setName);
        Optional.ofNullable(request.getDescription()).ifPresent(room::setDescription);
        Optional.ofNullable(request.getPricePerNight()).ifPresent(room::setPricePerNight);
        Optional.ofNullable(request.getView()).ifPresent(room::setView);
        Optional.ofNullable(request.getAmenities()).ifPresent(room::setAmenities);
        Optional.ofNullable(request.getImages()).ifPresent(room::setImages);
        Optional.ofNullable(request.getThumbnailImage()).ifPresent(room::setThumbnailImage);
        Optional.ofNullable(request.getAllowSmoking()).ifPresent(room::setAllowSmoking);
        Optional.ofNullable(request.getHasBalcony()).ifPresent(room::setHasBalcony);
        Optional.ofNullable(request.getHasKitchen()).ifPresent(room::setHasKitchen);
        Optional.ofNullable(request.getIsFeatured()).ifPresent(room::setIsFeatured);
        Optional.ofNullable(request.getNotes()).ifPresent(room::setNotes);
    }

    private Page<RoomResponse> createPageFromList(List<Room> rooms, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), rooms.size());

        List<RoomResponse> pageContent = rooms.subList(start, end).stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(pageContent, pageable, rooms.size());
    }

    private Pageable createPageable(int page, int size, String sortBy, String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        return PageRequest.of(page, size, sort);
    }

    private Pageable createPageableFromRequest(RoomSearchRequest request) {
        int page = Optional.ofNullable(request.getPage()).orElse(0);
        int size = Optional.ofNullable(request.getSize()).orElse(10);
        String sortBy = Optional.ofNullable(request.getSortBy()).orElse("createdDate");
        String sortOrder = Optional.ofNullable(request.getSortOrder()).orElse("desc");

        return createPageable(page, size, sortBy, sortOrder);
    }

    private Integer countRoomsByStatusInList(List<Room> rooms, RoomStatus status) {
        return (int) rooms.stream()
                .filter(r -> r.getStatus() == status)
                .count();
    }

    private Double calculateAveragePrice(List<Room> rooms) {
        return rooms.stream()
                .mapToDouble(Room::getPricePerNight)
                .average()
                .orElse(0.0);
    }

    private Double findMaxPrice(List<Room> rooms) {
        return rooms.stream()
                .mapToDouble(Room::getPricePerNight)
                .max()
                .orElse(0.0);
    }

    private Double findMinPrice(List<Room> rooms) {
        return rooms.stream()
                .mapToDouble(Room::getPricePerNight)
                .min()
                .orElse(0.0);
    }

    private Double calculateAverageRating(List<Room> rooms) {
        return rooms.stream()
                .mapToDouble(Room::getAverageRating)
                .average()
                .orElse(0.0);
    }

    private Integer calculateTotalBookings(List<Room> rooms) {
        return rooms.stream()
                .mapToInt(Room::getTotalBookings)
                .sum();
    }

    private List<RoomTypeStats> generateRoomTypeStats(List<Room> rooms) {
        return Arrays.stream(RoomType.values())
                .map(type -> {
                    List<Room> roomsByType = rooms.stream()
                            .filter(r -> r.getType() == type)
                            .collect(Collectors.toList());

                    if (roomsByType.isEmpty()) {
                        return null;
                    }

                    return RoomTypeStats.builder()
                            .type(type)
                            .count(roomsByType.size())
                            .available((int) roomsByType.stream()
                                    .filter(r -> r.getStatus() == RoomStatus.AVAILABLE)
                                    .count())
                            .averagePrice(calculateAveragePrice(roomsByType))
                            .build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}


