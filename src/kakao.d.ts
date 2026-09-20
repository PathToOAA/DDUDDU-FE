declare namespace kakao.maps {
  function load(callback: () => void): void;
  class LatLng { constructor(latitude: number, longitude: number); }
  class LatLngBounds { constructor(); extend(point: LatLng): void; }
  class Map {
    constructor(container: HTMLElement, options: { center: LatLng; level: number });
    setBounds(bounds: LatLngBounds, top?: number, right?: number, bottom?: number, left?: number): void;
    setCenter(point: LatLng): void;
    relayout(): void;
    addControl(control: ZoomControl, position: unknown): void;
  }
  class ZoomControl {}
  const ControlPosition: { RIGHT: unknown };
  class CustomOverlay {
    constructor(options: { map: Map; position: LatLng; content: HTMLElement; yAnchor?: number; zIndex?: number });
    setMap(map: Map | null): void;
  }
  class Polyline {
    constructor(options: { map: Map; path: LatLng[]; strokeColor: string; strokeWeight: number; strokeOpacity: number });
    setMap(map: Map | null): void;
  }
}
