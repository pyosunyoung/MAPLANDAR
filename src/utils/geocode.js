export const fetchCoordinates = (address) =>
  new Promise((resolve, reject) => {
    const { kakao } = window;

    if (!address?.trim()) {
      reject(new Error('Address is required.'));
      return;
    }

    if (!kakao?.maps?.load) {
      reject(new Error('Kakao Maps SDK is not loaded.'));
      return;
    }

    kakao.maps.load(() => {
      if (!kakao.maps.services?.Geocoder) {
        reject(new Error('Kakao geocoder is unavailable.'));
        return;
      }

      const geocoder = new kakao.maps.services.Geocoder();

      geocoder.addressSearch(address, (result, status) => {
        if (status !== kakao.maps.services.Status.OK || !result?.length) {
          reject(new Error('No results found.'));
          return;
        }

        resolve({
          latitude: parseFloat(result[0].y),
          longitude: parseFloat(result[0].x),
        });
      });
    });
  });
