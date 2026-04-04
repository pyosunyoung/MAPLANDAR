package com.example.maplander_be.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

public record PlaceDto(
        String placeName,
        String addressName,
        String roadAddressName,
        double latitude,
        double longitude,
        int distance
) {
    /* 카카오 응답 매핑용 내부 DTO */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record KakaoPlaceResponse(
            @JsonAlias("documents") List<KakaoDocument> documents) {

        public List<PlaceDto> toPlaceDtoList() {
            return documents.stream()
                    .map(KakaoDocument::toPlaceDto)
                    .toList();
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record KakaoDocument(
            @JsonAlias("place_name") String placeName,
            @JsonAlias("address_name") String addressName,
            @JsonAlias("road_address_name") String roadAddress,
            @JsonAlias("y") String y, // 위도
            @JsonAlias("x") String x, // 경도
            @JsonAlias("distance") String distance
    ) {
        private PlaceDto toPlaceDto() {
            return new PlaceDto(
                    placeName,
                    addressName,
                    roadAddress,
                    Double.parseDouble(y),
                    Double.parseDouble(x),
                    Integer.parseInt(distance)
            );
        }
    }
}