package com.bean.hotel_management.common.exception;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BusinessException extends RuntimeException{

    private String message;

    public BusinessException(String message) {
        super(message);
        this.message = message;
    }
}
