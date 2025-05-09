// LoginPage.jsx
import React, { useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { loginWithEmail } from '../../features/user/userSlice';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
`;

const Logo = styled.div`
  font-size: 32px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 48px;
  margin-bottom: 32px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 380px;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-weight: 500;
  color: #333;

`;

const Input = styled.input`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-top: 4px;
`;

const LoginButton = styled.button`
  margin-top: 24px;
  padding: 10px;
  background-color: #1f1f1f;
  color: white;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;

const RegisterText = styled.div`
  margin-top: 16px;
  font-size: 13px;
  color: #333;

  a {
    color: #000;
    font-weight: bold;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("로그인 시도:", email, password);
    dispatch(loginWithEmail({email, password, navigate}))
  };

  return (
    <LoginContainer>
      <Logo>
        <FontAwesomeIcon icon={faCalendarAlt} />
        MAPLANDAR
      </Logo>
      
      <Title><strong>로그인</strong></Title>
      
      <Form onSubmit={handleSubmit}>
        <Label>
          아이디
          <Input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Label>
        <Label>
          비밀번호
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Label>
        <LoginButton type="submit">로그인</LoginButton>
      </Form>
      <RegisterText>
        계정이 없다면? <Link to="/register">회원가입</Link>
      </RegisterText>
    </LoginContainer>
  );
};

export default LoginPage;
