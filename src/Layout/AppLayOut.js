import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faBars,
  faBell,
  faUserFriends,
} from '@fortawesome/free-solid-svg-icons';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons'; // 추가
import styled from 'styled-components';
import UserProfileBox from '../Layout/component/UserProfile'
import ToastMessage from '../common/ToastMessage';
const Container = styled.div`
  margin: 0 auto;
  max-width: 70rem;
  position: relative;
`;
const Logo = styled.div`
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  gap: 10px;
  color: black;
  text-decoration: none;
`;
const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #fff;
  position: relative;
  border-bottom: 1px solid #e5e7eb;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
`;

const Button = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  font-size: 14px;

  svg {
    font-size: 24px;
    margin-bottom: 5px;
  }
`;
const AlarmIconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AuthButton = styled.button`
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  background-color: ${(props) =>
    props.variant === 'filled' ? '#1F1F1F' : '#F4F4F4'};
  color: ${(props) => (props.variant === 'filled' ? '#fff' : '#000')};
`;
const SideMenu = styled.div`
  height: 100vh;
  width: ${(props) => (props.open ? '250px' : '0')};
  position: absolute;
  top: 0;
  right: 0;
  background-color: rgb(189, 42, 42);
  overflow-x: hidden;
  transition: width 0.5s ease;
  padding-top: 60px;
  z-index: 2;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 36px;
  border: none;
  background: none;
  color: white;
  cursor: pointer;
`;

const SideMenuList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 20px;

  button {
    margin: 5px;
    border: none;
    background: none;
    width: 120px;
    color: white;
    cursor: pointer;
    transition: 0.3s;

    &:hover {
      background-color: black;
      border-radius: 3px;
    }
  }
`;
const UserBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter';
  font-size: 14px;
  
`;
const Footer = styled.footer`
  border-top: 1px solid #e5e7eb;
  color: black;
  padding: 48px 16px;
  margin-top: 80px;
  font-family: 'Inter';
  font-size: 13px;
`;

const FooterInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const FooterColumn = styled.div`
  min-width: 180px;
  margin-bottom: 24px;
`;

const BurgerMenu = styled(FontAwesomeIcon)`
  font-size: 30px;
  margin: 20px;
  cursor: pointer;
`;

const AppLayout = ({  setAuthenticate }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuList = ['공지사항', '내정보', '매칭', 'AI매칭'];
  const authenticate = false;
  return (
    <Container>
      <ToastMessage/>
      <Navbar>
        {/* 왼쪽: 로고 */}
        <LeftSection>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo>
              <FontAwesomeIcon icon={faCalendarAlt} />
              MAPLANDAR
            </Logo>
          </Link>
        </LeftSection>

        {/* 오른쪽: 로그인 / 햄버거 */}
        <RightSection>
          {authenticate ? (
            <>
              <ButtonGroup>
                
                <AlarmIconButton onClick={() => alert('알림창 열기')}>
                <FontAwesomeIcon icon={faBell} />
                </AlarmIconButton>
                <UserBox>
        <UserProfileBox />
        
      </UserBox>
                <Button onClick={() => setMenuOpen(true)}>
                  <FontAwesomeIcon icon={faUserFriends} />
                  <div>친구창</div>
                </Button>
              </ButtonGroup>
            </>
          ) : (
            <ButtonGroup>
              <AuthButton variant="outlined" onClick={() => navigate('/login')}>
                Sign
              </AuthButton>
              <AuthButton
                variant="filled"
                onClick={() => navigate('/register')}
              >
                Register
              </AuthButton>
            </ButtonGroup>
          )}
        </RightSection>
      </Navbar>

      <SideMenu open={menuOpen}>
        <CloseButton onClick={() => setMenuOpen(false)}>&times;</CloseButton>
        <SideMenuList>
          {menuList.map((menu, index) => (
            <button key={index}>{menu}</button>
          ))}
        </SideMenuList>
      </SideMenu>

      <main>
        <Outlet />
      </main>
      <Footer>
        <FooterInner>
          <FooterColumn>
            <div style={{ fontWeight: 700, fontSize: '20px' }}>MAPLANDAR</div>
            <div style={{ marginTop: '10px' }}>
              청년-기업 실무 교류를 위한 단기 프로젝트 매칭 플랫폼으로,
              학생들에게는 실무 경험을<br></br>
              기업에게는 인재 발굴의 기회를 제공합니다.
            </div>
          </FooterColumn>
          <FooterColumn>
            <div style={{ fontWeight: 600, color: '#fff' }}>서비스</div>
            <div>프로젝트 찾기</div>
            <div>프로젝트 등록</div>
            <div>이용 가이드</div>
          </FooterColumn>
          <FooterColumn>
            <div style={{ fontWeight: 600, color: '#fff' }}>회사 소개</div>
            <div>소개</div>
            <div>공지사항</div>
            <div>연락처</div>
          </FooterColumn>
          <FooterColumn>
            <div style={{ fontWeight: 600, color: '#fff' }}>고객센터</div>
            <div>이용약관</div>
            <div>개인정보처리방침</div>
            <div>FAQ</div>
          </FooterColumn>
        </FooterInner>
        <div
          style={{ textAlign: 'center', marginTop: '24px', color: '#9CA3AF' }}
        >
          © 2025 MAPLANDAR. All rights reserved.
        </div>
      </Footer>
    </Container>
  );
};

export default AppLayout;
