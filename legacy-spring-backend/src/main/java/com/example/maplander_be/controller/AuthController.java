package com.example.maplander_be.controller;


import com.example.maplander_be.domain.User;
import com.example.maplander_be.dto.*;
import com.example.maplander_be.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {


    private final UserService userService;
    public AuthController(UserService svc){
        this.userService = svc;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDto> register(
            @Valid @RequestBody RegisterDto dto){

        User user = userService.register(dto);
        RegisterResponseDto resp = new RegisterResponseDto(

                user.getEmail(), user.getName()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)  // 201 Created(성공 응답)
                .body(resp);

    }

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @RequestBody LoginDto dto,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        User user = userService.login(dto.email(), dto.password());

        // 기존 세션이 있으면 무효화
        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }

        // 새로운 세션 생성
        HttpSession newSession = request.getSession(true);
        newSession.setAttribute("LOGIN_USER", user.getUserId());


//        // 수동 세션 쿠키 내려주기
//        Cookie sessionCookie = new Cookie("JSESSIONID", newSession.getId());
//        sessionCookie.setHttpOnly(true);
//        sessionCookie.setSecure(false);
//        sessionCookie.setPath("/");
//        sessionCookie.setMaxAge(60 * 60);    // 1시간 유지
//        sessionCookie.setAttribute("SameSite", "None");
//        response.addCookie(sessionCookie);

        return ResponseEntity.ok("로그인 성공");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response) {

        HttpSession session = request.getSession(false);
        if (session != null){
            session.invalidate();
        }

//        //  클라이언트 쿠키 제거
//        Cookie clearCookie = new Cookie("JSESSIONID", null);
//        clearCookie.setPath("/");
//        clearCookie.setMaxAge(0);
//        response.addCookie(clearCookie);

        // JSESSIONID 쿠키 삭제
        Cookie clear = new Cookie("JSESSIONID", "");
        clear.setMaxAge(0);
        clear.setPath("/"); // 삭제 쿠키에도 동일한 경로 지정해야 함
        clear.setHttpOnly(true);
        clear.setSecure(false);
        response.addCookie(clear);

        return ResponseEntity.ok("로그아웃 성공");
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponseDto<UserInfoDto>> me(HttpServletRequest request) {
        // 리턴 타입 String → ApiResponseDto<UserInfoDto>으로 변경함

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("LOGIN_USER") == null) {

            ApiResponseDto<UserInfoDto> err = new ApiResponseDto<>(401,null, "로그인 필요함");
            return ResponseEntity.status(401).body(err);

        }

        Integer userId = (Integer) session.getAttribute("LOGIN_USER");
        User user = userService.findById(userId);

        UserInfoDto info = new UserInfoDto(
                user.getUserId(),
                user.getEmail(),
                user.getName()
        );
        ApiResponseDto<UserInfoDto> resp = new ApiResponseDto<>(200,info,"조회성공");
        return ResponseEntity.ok(resp);

    }


    @GetMapping("/check-email")
    public ResponseEntity<EmailCheckResponse> checkEmail(@RequestParam String email) {
        boolean available = userService.isEmailAvailable(email);

        String message = available
                ? "사용 가능한 이메일입니다."
                : "이미 사용 중인 이메일입니다.";


        return ResponseEntity
                .ok(new EmailCheckResponse(available, message));
    }


    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }


}
