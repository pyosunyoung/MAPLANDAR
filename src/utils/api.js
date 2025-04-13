import axios from "axios";

// 상황따라 주소 다름
const LOCAL_BACKEND = process.env.REACT_APP_LOCAL_BACKEND; // env파일에 주소 생성해야 함함
// const PROD_BACKEND = process.env.REACT_APP_PROD_BACKEND;
// const BACKEND_PROXY = process.env.REACT_APP_BACKEND_PROXY;
// console.log("proxy", BACKEND_PROXY);
const api = axios.create({
  baseURL: LOCAL_BACKEND,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
/**
 * console.log all requests and responses
 */

api.interceptors.request.use(
  (config) => {
    // 요청을 보내기 전에 토큰 추가
    const token = sessionStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔹 응답 인터셉터 (Response Interceptor)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // if (!error.response) {
    //   console.error("🚨 [Axios] 서버 응답 없음:", error.message);
    //   alert("서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.");
    //   return Promise.reject("서버에 연결할 수 없습니다.");
    // }

    // const status = error.response.status;

    // switch (status) {
    //   case 401:  // 인증 실패 (로그인 필요)
    //     console.warn("🚨 [Axios] 401 Unauthorized - 인증 만료");
    //     alert("이메일 또는 비밀번호가 올바르지 않습니다.");
    //     localStorage.removeItem("token");
    //     sessionStorage.removeItem("token");
    //     window.location.href = "/login"; // 로그인 페이지로 이동
    //     break;

    //   case 403:  // 접근 권한 없음
    //     console.warn("🚨 [Axios] 403 Forbidden - 접근 권한 없음");
    //     alert("접근 권한이 없습니다.");
    //     break;

    //   case 404:  // 로그인 실패 (사용자 없음)
    //     console.warn("❌ [Axios] 404 Not Found - 존재하지 않는 이메일");
    //     alert("로그인 실패! 존재하지 않는 이메일입니다.");
    //     break;

    //   case 500:  // 서버 오류
    //     console.error("🚨 [Axios] 500 Internal Server Error:", error.response.data);
    //     alert("서버에 문제가 발생했습니다. 나중에 다시 시도해주세요.");
    //     break;

    //     // 백엔드 단에 들어오는 상태코드랑 메시지 들어옴 -> api.js 는 인터셉터가 미리 처리해줌 즉, 공통으로 처리할 부분임
    //   default:
    //     console.error(`🚨 [Axios] ${status} 오류 발생:`, error.response.data);
    //     alert("요청을 처리하는 중 오류가 발생했습니다.");
    // }

    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
