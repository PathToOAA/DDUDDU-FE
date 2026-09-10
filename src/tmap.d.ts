declare namespace Tmapv2 {
  class LatLng {
    constructor(lat: number, lng: number);
  }

  class Map {
    constructor(
      containerId: string,
      options: {
        center: LatLng;
        width: string;
        height: string;
        zoom: number;
        zoomControl: boolean;
        scrollwheel: boolean;
      },
    );

    setCenter(center: LatLng): void;
  }

  class Marker {
    constructor(options: {
      position: LatLng;
      map: Map;
      title?: string;
    });

    addListener(eventName: string, listener: () => void): void;
  }
}
