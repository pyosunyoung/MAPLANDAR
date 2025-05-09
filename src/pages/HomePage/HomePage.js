import React from "react";
import styled from "styled-components";

const Container = styled.div`
  
  max-width: 1200px;
  margin: 0 auto;
`;

const TitleSection = styled.section`
  display: flex;
  flex-direction: column;         
  justify-content: center;        
  align-items: center;            
  text-align: center;
  margin-bottom: 2rem;
  background-color: #f9fafb;
  height:400px
`;

const MainTitle = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const SubTitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;

  button {
    padding: 10px 20px;
    font-size: 1rem;
    border-radius: 8px;
    border: 1px solid black;
    cursor: pointer;
    
  }

  .create {
    background-color: #e0e0e0;
    color: black;
  }

  .search {
    background-color: black;
    color: white;
  }
`;

const GroupSection = styled.section`
  margin-top: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const GroupGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
`;

const GroupCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;

  h3 {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    img {
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }

    span {
      font-size: 0.9rem;
      color: #666;
    }
  }
`;
const HomePage = () => {
  const dummyGroups = [
    "솟빛중 3-4",
    "구름톤",
    "금곡초",
    "연구실",
    "백석대 녀석들",
    "반송고 3-9",
  ];
  return (
    <Container>
    <TitleSection>
      <MainTitle>공유 캘린더</MainTitle>
      <SubTitle>일정을 공유하고 약속을 잡으세요</SubTitle>
      <ButtonGroup>
        <button className="create">캘린더 생성</button>
        <button className="search">약속장소 찾기</button>
      </ButtonGroup>
    </TitleSection>

    <GroupSection>
      <SectionTitle>소속 그룹</SectionTitle>
      <GroupGrid>
        {dummyGroups.map((name, idx) => (
          <GroupCard key={idx}>
            <h4><strong>“{name}”</strong></h4>
            <div className="user-info">
              <img
                src="https://i.pravatar.cc/24"
                alt="avatar"
              />
              <div>
                <div>Title</div>
                <span>Description</span>
              </div>
            </div>
          </GroupCard>
        ))}
      </GroupGrid>
    </GroupSection>
  </Container>
);
};

export default HomePage