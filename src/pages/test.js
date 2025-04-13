import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Button } from "react-bootstrap";

const TestPage = () => {
  const [data, setData] = useState("서버 응답 대기 중...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 API 호출 함수
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/test"); // 백엔드 API 호출
      setData(response.data); // 응답 데이터 저장
    } catch (err) {
      console.error("API 요청 실패:", err);
      setError("서버와 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 페이지 로딩 시 자동 호출 (useEffect 사용)
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={6} className="text-center">
          <h2 className="mb-4">Test API 호출</h2>
          {loading ? (
            <p>데이터를 불러오는 중...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <p className="text-success">응답 데이터: {data}</p>
          )}
          <Button variant="primary" onClick={fetchData} disabled={loading}>
            다시 요청하기
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default TestPage;
