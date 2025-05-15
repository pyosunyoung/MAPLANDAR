// RegisterPage.jsx
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { checkEmailAvailability, clearErrors, registerUser } from '../../features/user/userSlice';

const RegisterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  
`;

const Title = styled.h2`
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 40px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 380px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
`;

const CheckButton = styled.button`
  padding: 8px 12px;
  background-color: #eee;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
`;

const Message = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: -8px;
  margin-bottom: 8px;
`;

const SubmitButton = styled.button`
  padding: 10px;
  background-color: #1f1f1f;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top:20px;
  margin-bottom:10px;
`;

const LoginLink = styled.div`
  margin-top: 16px;
  font-size: 13px;
  color: #333;
  text-align: center;

  a {
    color: #000;
    font-weight: bold;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const RegisterPage = () => {
  const {emailmessage, checkEmailError } = useSelector((state) => state.user);
  const [emailCheck, setEmailCheck] = useState(false);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues:{
      email:"",
      password:"",
      confirmPassword:"",
      name:"",
    },
    onSubmit: (values)=>{
      console.log(values);
      dispatch(registerUser({ values, navigate }))
    }
  }) 
  const checkEmail = async () => {
    const email = formik.values.email;

    // 이메일 빈값이거나 형식에 안 맞으면 alert 띄우기
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('이메일 형식에 맞게 입력해주세요.');
      return; // 더 이상 진행하지 않게 return
    }
    const result = await dispatch(checkEmailAvailability(formik.values.email));
    console.log('emailresult', result);
    if (result.payload?.status == 200) {
      // 서버 응답: false면 "존재하지 않는 이메일" = 사용 가능
      setEmailCheck(true);
    } else {
      // true면 "이미 존재하는 이메일" = 사용 불가
      setEmailCheck(false);
    }
  };
  
  useEffect(() => {
    // 페이지 처음 들어올 때 초기화
    setEmailCheck(false);
    dispatch(clearErrors());
  }, []);
  const handleRegister = (e) => {
    e.preventDefault();
    // if (!emailCheck) {
    //   alert('이메일 중복 검사를 먼저 완료해주세요.');
    //   emailInputRef.current?.focus();
    //   return;
    // }
    if(formik.values.password !== formik.values.confirmPassword){
      alert('비밀번호가 일치하지 않습니다.');
      passwordInputRef.current?.focus();
    }
    formik.handleSubmit();
  };

  return (
    <RegisterContainer>
      <Title>회원가입</Title>
      <Form onSubmit={handleRegister}>
        <Label>
          아이디
          <InputRow>
            <Input
              name='email'
              type="text"
              value={formik.values.email}
              onChange={(e) =>{
                setEmailCheck(false);
                formik.handleChange(e);}
              }
              required
              ref={emailInputRef}
            />
            <CheckButton type="button" onClick={checkEmail}>
              중복검사
            </CheckButton>
          </InputRow>
        </Label>
        <Message><div>{emailmessage}</div>
        <div style={{ color: 'red' }}>{checkEmailError}</div></Message>

        <Label>
          비밀번호
          <Input
            name='password'
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            required
            ref={passwordInputRef}
          />
        </Label>

        <Label>
          비밀번호 확인
          <Input
          name='confirmPassword'
            type="password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            required
            ref={passwordInputRef}
          />
        </Label>
        <Label>
          이름
          <Input
            name='name'
            type="text"
            value={formik.values.name}
            onChange={formik.handleChange}
            required
          />
        </Label>

        <SubmitButton type="submit">회원가입</SubmitButton>
      </Form>

      <LoginLink>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </LoginLink>
    </RegisterContainer>
  );
};

export default RegisterPage;
