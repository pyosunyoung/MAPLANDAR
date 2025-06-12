export const userColors = [
  '#f8c291', // userId % 4 === 0 → 연한 오렌지
  '#82ccdd', // userId % 4 === 1 → 연한 블루
  '#b8e994', // userId % 4 === 2 → 연한 그린
  '#d6a2e8', // userId % 4 === 3 → 연한 퍼플
];

export const getUserColor = (userId) => {
  const index = parseInt(userId, 10) % userColors.length;
  return userColors[index];
};