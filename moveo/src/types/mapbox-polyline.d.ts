declare module '@mapbox/polyline' {
  interface PolylineStatic {
    decode(str: string, precision?: number): [number, number][];
    encode(coordinates: [number, number][], precision?: number): string;
  }

  const polyline: PolylineStatic;
  export = polyline;
}


