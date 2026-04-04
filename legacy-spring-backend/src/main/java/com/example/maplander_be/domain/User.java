package com.example.maplander_be.domain;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "User")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;


    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "user_password", nullable = false)
    private String password;

    @Column(name = "user_email", nullable = false, unique = true)
    private String email;

    protected User() {}

    public User(String name,String password, String email) {

        this.name = name;
        this.password = password;
        this.email    = email;
    }



}
