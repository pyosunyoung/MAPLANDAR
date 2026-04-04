package com.example.maplander_be.dto;

public class FriendDto {

    // 친구 요청 전송 시 사용할 이메일
    private String receiverEmail;

    // 친구 요청 수락/거절 시 사용할 ID (기존 코드 유지)
    private Integer requesterId;
    private Integer receiverId;

    public FriendDto() {}

    //요청 전송 생성자: 이메일만 받도록 변경
    public FriendDto(String receiverEmail) {
        this.receiverEmail = receiverEmail;
    }

    // 수락/거절 생성자
    public FriendDto(Integer requesterId, Integer receiverId) {
        this.requesterId = requesterId;
        this.receiverId  = receiverId;
    }


    public String getReceiverEmail() {
        return receiverEmail;
    }
    public void setReceiverEmail(String receiverEmail) {
        this.receiverEmail = receiverEmail;
    }


    public Integer getRequesterId() {
        return requesterId;
    }
    public void setRequesterId(Integer requesterId) {
        this.requesterId = requesterId;
    }

    public Integer getReceiverId() {
        return receiverId;
    }
    public void setReceiverId(Integer receiverId) {
        this.receiverId = receiverId;
    }


}
