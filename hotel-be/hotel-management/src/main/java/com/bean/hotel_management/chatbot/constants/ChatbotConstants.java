package com.bean.hotel_management.chatbot.constants;

import java.util.Arrays;
import java.util.List;

/**
 * Constants cho Chatbot module
 */
public final class ChatbotConstants {

    private ChatbotConstants() {
        throw new AssertionError("Cannot instantiate constants class");
    }

    // ==================== INTENTS ====================

    public static final class Intents {
        public static final String GREETING = "GREETING";
        public static final String GOODBYE = "GOODBYE";
        public static final String BOOKING_INQUIRY = "BOOKING_INQUIRY";
        public static final String ROOM_INFO = "ROOM_INFO";
        public static final String PRICE_INQUIRY = "PRICE_INQUIRY";
        public static final String FACILITY_INFO = "FACILITY_INFO";
        public static final String CHECK_IN_OUT = "CHECK_IN_OUT";
        public static final String CANCELLATION = "CANCELLATION";
        public static final String PAYMENT = "PAYMENT";
        public static final String COMPLAINT = "COMPLAINT";
        public static final String LOCATION = "LOCATION";
        public static final String CONTACT = "CONTACT";
        public static final String HELP = "HELP";
        public static final String UNKNOWN = "UNKNOWN";

        private Intents() {}
    }

    // ==================== CATEGORIES ====================

    public static final class Categories {
        public static final String BOOKING = "Đặt phòng";
        public static final String ROOM = "Thông tin phòng";
        public static final String FACILITY = "Tiện ích";
        public static final String PAYMENT = "Thanh toán";
        public static final String POLICY = "Chính sách";
        public static final String LOCATION = "Vị trí";
        public static final String OTHER = "Khác";

        private Categories() {}
    }

    // ==================== DEFAULT RESPONSES ====================

    public static final class Responses {
        public static final String GREETING =
                "Xin chào! Tôi là trợ lý ảo của khách sạn. Tôi có thể giúp gì cho bạn?";

        public static final String GOODBYE =
                "Cảm ơn bạn đã liên hệ! Chúc bạn một ngày tốt lành. 😊";

        public static final String NOT_UNDERSTAND =
                "Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể diễn đạt lại được không?";

        public static final String TRANSFER_TO_HUMAN =
                "Tôi sẽ chuyển bạn đến nhân viên hỗ trợ. Vui lòng đợi trong giây lát...";

        public static final String ERROR =
                "Đã có lỗi xảy ra. Vui lòng thử lại sau hoặc liên hệ trực tiếp với chúng tôi.";

        private Responses() {}
    }

    // ==================== KEYWORDS ====================

    public static final class Keywords {
        // Greeting
        public static final List<String> GREETING_KEYWORDS = Arrays.asList(
                "xin chào", "chào", "hello", "hi", "hey", "chào buổi"
        );

        // Goodbye
        public static final List<String> GOODBYE_KEYWORDS = Arrays.asList(
                "tạm biệt", "bye", "goodbye", "cảm ơn", "hẹn gặp lại"
        );

        // Booking
        public static final List<String> BOOKING_KEYWORDS = Arrays.asList(
                "đặt phòng", "booking", "đặt", "book", "thuê phòng", "có phòng"
        );

        // Room info
        public static final List<String> ROOM_KEYWORDS = Arrays.asList(
                "phòng", "room", "loại phòng", "room type", "phòng đôi", "phòng đơn"
        );

        // Price
        public static final List<String> PRICE_KEYWORDS = Arrays.asList(
                "giá", "price", "bao nhiêu", "how much", "chi phí", "cost"
        );

        // Facility
        public static final List<String> FACILITY_KEYWORDS = Arrays.asList(
                "tiện ích", "facility", "dịch vụ", "service", "tiện nghi", "amenities"
        );

        // Check-in/out
        public static final List<String> CHECKIN_KEYWORDS = Arrays.asList(
                "check in", "check-in", "nhận phòng", "vào phòng", "giờ nhận phòng"
        );

        public static final List<String> CHECKOUT_KEYWORDS = Arrays.asList(
                "check out", "check-out", "trả phòng", "giờ trả phòng"
        );

        // Cancellation
        public static final List<String> CANCEL_KEYWORDS = Arrays.asList(
                "hủy", "cancel", "huỷ bỏ", "hoàn tiền", "refund"
        );

        // Payment
        public static final List<String> PAYMENT_KEYWORDS = Arrays.asList(
                "thanh toán", "payment", "pay", "trả tiền", "phương thức"
        );

        // Location
        public static final List<String> LOCATION_KEYWORDS = Arrays.asList(
                "địa chỉ", "location", "address", "ở đâu", "where", "vị trí"
        );

        // Contact
        public static final List<String> CONTACT_KEYWORDS = Arrays.asList(
                "liên hệ", "contact", "số điện thoại", "phone", "email"
        );

        // Help
        public static final List<String> HELP_KEYWORDS = Arrays.asList(
                "giúp", "help", "hỗ trợ", "support", "trợ giúp"
        );

        private Keywords() {}
    }

    // ==================== QUICK REPLIES ====================

    public static final class QuickReplies {
        public static final String[] INITIAL_OPTIONS = {
                "Đặt phòng",
                "Xem phòng",
                "Giá phòng",
                "Tiện ích",
                "Liên hệ"
        };

        public static final String[] BOOKING_OPTIONS = {
                "Kiểm tra phòng trống",
                "Đặt phòng ngay",
                "Chính sách hủy",
                "Quay lại"
        };

        public static final String[] HELP_OPTIONS = {
                "Tôi cần hỗ trợ",
                "Nói chuyện với nhân viên",
                "Xem FAQ"
        };

        private QuickReplies() {}
    }

    // ==================== SETTINGS ====================

    public static final class Settings {
        public static final double CONFIDENCE_THRESHOLD = 0.6;
        public static final int MAX_MESSAGE_LENGTH = 1000;
        public static final int SESSION_TIMEOUT_MINUTES = 30;
        public static final int MAX_UNANSWERED_QUESTIONS = 3;

        private Settings() {}
    }

    // ==================== HOTEL INFO ====================

    public static final class HotelInfo {
        public static final String NAME = "Hotel Management";
        public static final String ADDRESS = "123 Nguyễn Huệ, Quận 1, TP.HCM";
        public static final String PHONE = "1900 xxxx";
        public static final String EMAIL = "info@hotelmanagement.com";
        public static final String CHECKIN_TIME = "14:00";
        public static final String CHECKOUT_TIME = "12:00";

        public static final String FACILITIES = String.join(", ",
                "Hồ bơi",
                "Phòng gym",
                "Nhà hàng",
                "Bar",
                "Spa",
                "Dịch vụ đưa đón sân bay"
        );

        private HotelInfo() {}
    }
}