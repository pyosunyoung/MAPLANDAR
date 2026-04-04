package com.example.maplander_be.domain;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Schedule")


public class Schedule {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Integer scheduleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private ListOfGroup group;

    @Column(name = "creator_id", nullable = false)
    private Integer creatorId;

    @Column(name = "title", length = 100, nullable = false)
    private String title;

    @Column(name = "start_datetime", nullable = false)
    private LocalDateTime startDatetime;

    @Column(name = "end_datetime", nullable = false)
    private LocalDateTime endDatetime;

    @Column(name = "description")
    private String description;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "address", length = 255, nullable = false)
    private String address; // Schedule에 입력 장소 이름

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();


    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    protected Schedule() { /* JPA용 */ }

    public Schedule(ListOfGroup group, Integer creatorId, String title,
                    LocalDateTime startDatetime, LocalDateTime endDatetime,
                    String description, Double latitude, Double longitude, String address) {
        this.group = group;
        this.creatorId = creatorId;
        this.title = title;
        this.startDatetime = startDatetime;
        this.endDatetime = endDatetime;
        this.description = description;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
    }

    // getter / setter

    // getter
    public Integer getScheduleId() { return scheduleId; }
    public ListOfGroup getGroup() { return group; }
    public Integer getCreatorId() { return creatorId; }
    public String getTitle() { return title; }
    public LocalDateTime getStartDatetime() { return startDatetime; }
    public LocalDateTime getEndDatetime() { return endDatetime; }
    public String getDescription() { return description; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public String getAddress(){return address;}
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // setter
    public void setTitle(String title) { this.title = title; }
    public void setStartDatetime(LocalDateTime startDatetime) { this.startDatetime = startDatetime; }
    public void setEndDatetime(LocalDateTime endDatetime) { this.endDatetime = endDatetime; }
    public void setDescription(String description) { this.description = description; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public void setAddress(String address){this.address = address; }

}
