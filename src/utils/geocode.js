// utils/geocode.js
export const fetchCoordinates = async (address) => {
  const REST_API_KEY = '16ce6c0c3bd345dd72fb1376db1eacb3';
  const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `KakaoAK ${REST_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error('Geocoding failed');
  }

  const data = await response.json();
  if (data.documents && data.documents.length > 0) {
    const { x, y } = data.documents[0];
    return {
      latitude: parseFloat(y),
      longitude: parseFloat(x),
    };
  } else {
    throw new Error('No results found');
  }
};
