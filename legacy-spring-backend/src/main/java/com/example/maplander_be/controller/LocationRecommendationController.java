package com.example.maplander_be.controller;


import com.example.maplander_be.dto.NamedCoordinateDto;

import com.example.maplander_be.dto.RecommendationResponseDto;
import com.example.maplander_be.service.LocationRecommendationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/locations/recommend")
public class LocationRecommendationController {

    private final LocationRecommendationService svc;

    public LocationRecommendationController(LocationRecommendationService svc) {
        this.svc = svc;
    }


    /*  장소 추천 - 카페  */
    @PostMapping("/cafes")
    public Mono<RecommendationResponseDto> recommendCafes(

            @RequestBody @Valid @Size(min = 2)
            List<NamedCoordinateDto> coordinates) {

        return svc.recommendCafes(coordinates);

    }

    /*  장소 추천 - 음식점  */
    @PostMapping("/foods")
    public Mono<RecommendationResponseDto> recommendFoods(

            @RequestBody @Valid @Size(min = 2)
            List<NamedCoordinateDto> coordinates){

        return svc.recommendFoods(coordinates);
    }


}
