package com.bean.hotel_management.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Cấu hình Async để gửi email không đồng bộ
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    // Spring Boot sẽ tự động cấu hình ThreadPoolTaskExecutor
    // dựa trên properties: spring.task.execution.*
}