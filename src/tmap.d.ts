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
    fitBounds(bounds: LatLngBounds): void;
    destroy(): void;
  }

  class Marker {
    constructor(options: {
      position: LatLng;
      map: Map;
      title?: string;
      iconHTML?: string;
      iconSize?: Size;
    });

    setMap(map: Map | null): void;
    addListener(eventName: string, listener: () => void): void;
  }
}

declare namespace Tmapv2 {
  class LatLngBounds {
    constructor();
    extend(point: LatLng): void;
  }
  class Polyline {
    constructor(options: { map: Map; path: LatLng[]; strokeColor: string; strokeWeight: number; strokeOpacity: number });
    setMap(map: Map | null): void;
  }
}
declare namespace Tmapv2 { class Size { constructor(width: number, height: number); } }
