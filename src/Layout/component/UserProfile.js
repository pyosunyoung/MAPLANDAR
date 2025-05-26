import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import Dropdown from 'react-bootstrap/Dropdown';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, friendsPending, logout } from '../../features/user/userSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Cookies from 'js-cookie';
const UserTab = styled.div`
  position: relative;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  gap: 0.6rem;
  font-color: black;
  .user-profile-icon {
    color: gray;
    // #6c9466
  }
`;

const UserName = styled.span`
  font-weight: bold;
  font-size : 16px;
  font-color: black;
  
`;

const DropdownToggle = styled.div`
  cursor: pointer;
  
`;

const CustomDropdownMenu = styled.div`
  position: absolute;
  top: 40px;
  left: 0;
  z-index: 1050;
  width: 7.3rem;
  border-radius: 0.7rem;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
`;

const DropdownItem = styled.div`
  width: 100%;
  padding: 0.9rem;
  border-bottom: 1px solid #ccc;
  color: #333;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    background-color: #f1f1f1;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const User = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
const { profile, userRole } = useSelector((state) => state.user);
  const [notificationCount, setNotificationCount] = useState(2);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const cookie = Cookies.get('JSESSIONID');
  console.log("cookie",cookie);
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    const token = Cookies.get('JSESSIONID');
    console.log("cookie",cookie);
    console.log("profile", profile);
  };
  

  const handleLogout = () => {
    console.log("token",cookie);
    dispatch(logout({ cookie, navigate }));
    // navigate("/login"); // 바로 이동
  };
  const handleGoMypage = () => {
    userRole == "USER" ? navigate('/mypage/user') : navigate('/mypage/company')
  }
  return (
    <UserTab>
      <UserProfile>
        <AccountCircleIcon className="user-profile-icon" style={{marginTop:"2px"}} />
        <UserName>{profile?.name || "표선영"}</UserName>

        <DropdownToggle onClick={toggleDropdown}>
          {isDropdownOpen ? (
            <KeyboardArrowUpIcon />
          ) : (
            <KeyboardArrowDownIcon />
          )}
        </DropdownToggle>

        {isDropdownOpen && (
          <CustomDropdownMenu>
            {/* <DropdownItem onClick={handleGoMypage}>
              마이페이지
            </DropdownItem> */}
            <DropdownItem onClick={handleLogout}>
              로그아웃
            </DropdownItem>
          </CustomDropdownMenu>
        )}
      </UserProfile>
    </UserTab>
  );
};

export default User;
