package com.example.maplander_be.dto;

import java.util.List;
import java.util.Map;

public record RecommendationResponseDto(

        List<String> userNames,
        List<PlaceDto> recommendedPlaces,
        String title,
        Map<String, String> userAddresses

)
{}
