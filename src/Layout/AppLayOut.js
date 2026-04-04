import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import UserProfileBox from '../Layout/component/UserProfile';
import ToastMessage from '../common/ToastMessage';
import FriendSidebar from './component/FriendSidebar';
import { useDispatch } from 'react-redux';
import {
  fetchFriendsList,
  fetchUserProfile,
  friendsPending,
} from '../features/user/userSlice';
import { fetchCalendarList } from '../features/calendar/calendarSlice';
import { supabase } from '../lib/supabaseClient';

const Container = styled.div`
  margin: 0 auto;
  max-width: 80rem;
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

const IconButton = styled.div`
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
    props.variant === 'filled' ? '#1f1f1f' : '#f4f4f4'};
  color: ${(props) => (props.variant === 'filled' ? '#fff' : '#000')};
`;

const SideMenu = styled.div`
  height: 100vh;
  width: ${(props) => (props.open ? '300px' : '0')};
  position: absolute;
  top: 0;
  right: 0;
  background-color: #f5f6f8;
  overflow-x: hidden;
  transition: width 0.5s ease;
  padding-top: 0;
  z-index: 2;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 36px;
  border: none;
  background: none;
  color: black;
  cursor: pointer;
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

const loadAuthenticatedData = (dispatch) => {
  dispatch(fetchUserProfile());
  dispatch(friendsPending());
  dispatch(fetchFriendsList());
  dispatch(fetchCalendarList());
};

const AppLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      const hasSession = Boolean(session?.access_token);
      setIsAuthenticated(hasSession);

      if (hasSession) {
        loadAuthenticatedData(dispatch);
      }
    };

    syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const hasSession = Boolean(session?.access_token);
      setIsAuthenticated(hasSession);

      if (hasSession) {
        loadAuthenticatedData(dispatch);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return (
    <Container>
      <ToastMessage />
      <Navbar>
        <LeftSection>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo>
              <FontAwesomeIcon icon={faCalendarAlt} />
              MAPLANDAR
            </Logo>
          </Link>
        </LeftSection>

        <RightSection>
          {isAuthenticated ? (
            <ButtonGroup>
              <AlarmIconButton onClick={() => alert('알림 기능은 준비 중입니다.')}>
                <FontAwesomeIcon icon={faBell} />
              </AlarmIconButton>
              <UserBox>
                <UserProfileBox />
              </UserBox>
              <IconButton onClick={() => setMenuOpen(true)}>
                <FontAwesomeIcon icon={faUserFriends} />
                <div>친구창</div>
              </IconButton>
            </ButtonGroup>
          ) : (
            <ButtonGroup>
              <AuthButton variant="outlined" onClick={() => navigate('/login')}>
                Sign
              </AuthButton>
              <AuthButton variant="filled" onClick={() => navigate('/register')}>
                Register
              </AuthButton>
            </ButtonGroup>
          )}
        </RightSection>
      </Navbar>

      <SideMenu open={menuOpen}>
        <CloseButton onClick={() => setMenuOpen(false)}>&times;</CloseButton>
        <FriendSidebar />
      </SideMenu>

      <main>
        <Outlet />
      </main>

      <Footer>
        <FooterInner>
          <FooterColumn>
            <div style={{ fontWeight: 700, fontSize: '20px' }}>MAPLANDAR</div>
            <div style={{ marginTop: '10px' }}>
              <strong>우리의 만남을 더 쉽게, 더 가깝게.</strong>
              <br />
              공유 캘린더로 일정을 효율적으로 관리하고 위치를 기반으로 중간 지점을 추천받아
              <br />
              모두에게 편한 약속 장소를 찾아보세요.
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
        <div style={{ textAlign: 'center', marginTop: '24px', color: '#9ca3af' }}>
          2025 MAPLANDAR. All rights reserved.
        </div>
      </Footer>
    </Container>
  );
};

export default AppLayout;
