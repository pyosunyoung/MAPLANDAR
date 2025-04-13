import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBars } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

const Container = styled.div`
  margin: 0 auto;
  max-width: 28rem;
  position: relative;
`;

const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #fff;
  position: relative;
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

const SideMenu = styled.div`
  height: 100vh;
  width: ${(props) => (props.open ? "250px" : "0")};
  position: absolute;
  top: 0;
  left: 0;
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

const BurgerMenu = styled(FontAwesomeIcon)`
  font-size: 30px;
  margin: 20px;
  cursor: pointer;
`;

const AppLayout = ({ authenticate, setAuthenticate }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuList = ["공지사항", "내정보", "매칭", "AI매칭"];

  return (
    <Container>
      <Navbar>
        <BurgerMenu icon={faBars} onClick={() => setMenuOpen(true)} />
        <Link to="/">
          <img
            width={100}
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiMTobnkBhXqT2y97l05H0Yqq30INTslkMwA&s"
            alt=""
          />
        </Link>
        <ButtonGroup>
          {authenticate ? (
            <Button onClick={() => setAuthenticate(false)}>
              <FontAwesomeIcon icon={faUser} />
              <div>로그아웃</div>
            </Button>
          ) : (
            <Button onClick={() => navigate("/login")}>
              <FontAwesomeIcon icon={faUser} />
              <div>로그인</div>
            </Button>
          )}
        </ButtonGroup>
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
    </Container>
  );
};

export default AppLayout;
