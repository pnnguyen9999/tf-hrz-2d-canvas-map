export { ResizableTileMap as TileMap } from "./TileMap/ResizableTileMap";
// export { Props as TileMapProps } from "./TileMap/TileMap.types";
// export { Layer, Coord } from "./lib/common";
export { renderMap } from "./render/map";
export { renderTile } from "./render/tile";
export type Tile = {
  color: string;
  top?: boolean;
  left?: boolean;
  topLeft?: boolean;
  scale?: number;
};

export type Coord = {
  x: number;
  y: number;
};

export type Layer = (x: number, y: number) => Tile | null;
