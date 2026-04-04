package com.example.maplander_be.dto;

public class EmailCheckResponse {

    private boolean available;
    private String message;


    public EmailCheckResponse(boolean available, String message) {
        this.available = available;
        this.message   = message;
    }
    public boolean isAvailable() { return available; }
    public String getMessage()  { return message; }


}
