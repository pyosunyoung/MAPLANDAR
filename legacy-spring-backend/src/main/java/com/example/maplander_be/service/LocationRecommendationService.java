package com.example.maplander_be.service;

import com.example.maplander_be.client.KakaoMapClient;
import com.example.maplander_be.dto.NamedCoordinateDto;
import com.example.maplander_be.dto.RecommendationResponseDto;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LocationRecommendationService {

    private final KakaoMapClient kakaoMapClient;

    public LocationRecommendationService(KakaoMapClient kakaoMapClient) {
        this.kakaoMapClient = kakaoMapClient;
    }

    /* 사용자 이름이 들어간 좌표 리스트 처리 */
    public Mono<RecommendationResponseDto> recommendByCategory(
            List<NamedCoordinateDto> coords, String categoryCode) {

        if (coords == null || coords.size() < 2) {
            return Mono.error(new IllegalArgumentException("2개 이상의 좌표값을 입력해야 합니다."));
        }

        // 평균 좌표 계산
        double avgLat = coords.stream().mapToDouble(NamedCoordinateDto::latitude).average().orElseThrow();
        double avgLng = coords.stream().mapToDouble(NamedCoordinateDto::longitude).average().orElseThrow();


        Map<String, String> addressMap = coords.stream().collect(Collectors.toMap(
                NamedCoordinateDto::userName,
                NamedCoordinateDto::address
        ));

        // 사용자 이름 리스트
        List<String> names = coords.stream().map(NamedCoordinateDto::userName).toList();

        return kakaoMapClient.searchPlaces(avgLat, avgLng, 2000, 10, categoryCode) // 장소 10개 추천해줌
                .map(places -> {
                    String title = String.join(", ", names) + "의 추천 장소";
                    return new RecommendationResponseDto(names, places, title, addressMap);
                });
    }

    // 카페
    public Mono<RecommendationResponseDto> recommendCafes(List<NamedCoordinateDto> coords){
        return recommendByCategory(coords,"CE7");

    }

    // 음식점
    public Mono<RecommendationResponseDto> recommendFoods(List<NamedCoordinateDto> coords){
        return recommendByCategory(coords,"FD6");

    }



}
