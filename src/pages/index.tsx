import React, { useEffect, useRef, useState } from "react";
import { Coord, Layer, TileMap } from "../components";
import useMouse from "mouse-position";

type AtlasTile = {
  x: number;
  y: number;
  type: number;
  estate_id: number;
  left: number;
  top: number;
  topLeft: number;
};
let atlas: Record<string, AtlasTile> | null = null;
export const COLOR_BY_TYPE = Object.freeze({
  0: "#ff9990", // my parcels
  1: "#ff4053", // my parcels on sale
  2: "#ff9990", // my estates
  3: "#ff4053", // my estates on sale
  4: "#ffbd33", // parcels/estates where I have permissions
  5: "#5054D4", // districts
  6: "#563db8", // contributions
  7: "#716C7A", // roads
  8: "#70AC76", // plazas
  9: "#3D3A46", // owned parcel/estate
  10: "#3D3A46", // parcels on sale (we show them as owned parcels)
  11: "#09080A", // unowned pacel/estate
  12: "#CCCCCC", // background
  13: "#9B9B9B", // loading odd
  14: "#0d0b0e", // loading even
});
let hover;

let atlasMock = {
  "-1,2": {
    type: 5,
    x: -1,
    y: 2,
    owner: "0xa65be351527ebcf8c1707d1e444dac38b41a5faf",
    estate_id: "1186",
  },
  "-1,1": {
    type: 5,
    x: -1,
    y: 1,
    top: 1,
    owner: "0xa65be351527ebcf8c1707d1e444dac38b41a5faf",
    estate_id: "1186",
  },
  "0,1": {
    type: 5,
    x: 0,
    y: 1,
    top: 1,
    left: 1,
    topLeft: 1,
    owner: "0xa65be351527ebcf8c1707d1e444dac38b41a5faf",
    estate_id: "1186",
  },
  "0,2": {
    type: 5,
    x: 0,
    y: 2,
    left: 1,
    owner: "0xa65be351527ebcf8c1707d1e444dac38b41a5faf",
    estate_id: "1186",
  },
};
let timeFlag = 0;
// let firstPos = null;
// let lastPos = null;
let selected: Coord[] = [];

type pos =
  | {
      x: number;
      y: number;
    }
  | any;

const Home: React.FC = () => {
  const refC = useRef<any>();
  const [isEnabledDrag, setEnabledDrag] = useState<boolean>(true);
  const [isEnabledTop, setEnabledTop] = useState<boolean>(true);
  const [isEnabledLeft, setEnabledLeft] = useState<boolean>(true);
  const [isEnabledTopLeft, setEnabledTopLeft] = useState<boolean>(true);

  const [firstPos, setFirstPos] = useState<any>({});
  const [lastPos, setLastPos] = useState<any>({});

  async function loadTiles() {
    const resp = await fetch("https://api.decentraland.org/v1/tiles");
    const json = await resp.json();
    atlas = json.data as Record<string, AtlasTile>;
  }

  loadTiles().catch(console.error);

  const atlasLayer: any = (x, y) => {
    const id = x + "," + y;
    if (atlasMock !== null && id in atlasMock) {
      const tile = atlasMock[id];
      const color = COLOR_BY_TYPE[tile.type];

      const top = isEnabledTop && !!tile.top;
      const left = isEnabledLeft && !!tile.left;
      const topLeft = isEnabledTopLeft && !!tile.topLeft;
      // console.log({ color, top, left, topLeft });
      return {
        color,
        top,
        left,
        topLeft,
      };
    } else {
      return {
        // tra ve chessboardLayer
        color: (x + y) % 2 === 0 ? COLOR_BY_TYPE[12] : COLOR_BY_TYPE[13],
      };
    }
  };

  const chessboardLayer: Layer = (x, y) => {
    return {
      color: (x + y) % 2 === 0 ? "#00ff00" : "#ff0000",
    };
  };

  const connectedLayer: Layer = (x, y) => {
    const top = x % 5 === 0;
    const left = y % 10 === 0;
    return {
      color: top || left ? "#888888" : "#000000",
      top,
      left,
    };
  };

  const handleHover = (x: number, y: number) => {
    hover = { x, y };
  };

  const isHighlighted = (x: number, y: number) => {
    if (!hover) return false;
    // only highlight a 10x10 area centered around hover coords
    const radius = 1;
    return (
      x > hover.x - radius &&
      x < hover.x + radius &&
      y > hover.y - radius &&
      y < hover.y + radius
    );
  };

  const isValid = () => {
    if (!hover) return false;
    // only valid if it fits in central plaza
    return hover.x >= -50 && hover.x <= 50 && hover.y >= -50 && hover.y <= 50;
  };

  const hoverStrokeLayer: Layer = (x, y) => {
    if (isHighlighted(x, y)) {
      return {
        color: "#99ff90",
        scale: 1,
      };
    }
    return null;
  };

  const hoverFillLayer: Layer = (x, y) => {
    if (isHighlighted(x, y)) {
      return {
        color: "#99ff90",
        scale: 0.9,
      };
    }
    return null;
  };

  const handleOnClick = (x, y) => {
    console.log({ x, y });
    // const id = x + "," + y;
    // console.log(atlasMock[id]);
    if (firstPos?.x && firstPos?.y && lastPos?.x && lastPos?.y) {
      setFirstPos(null);
      setLastPos(null);
    } else {
      if (firstPos?.x && firstPos?.y) {
        setLastPos({
          x,
          y,
        });
      } else {
        setFirstPos({
          x,
          y,
        });
      }
    }
  };

  useEffect(() => {
    console.log({ firstPos, lastPos });
    let xMin = Math.min(firstPos?.x, lastPos?.x);
    let xMax = Math.max(firstPos?.x, lastPos?.x);
    let yMin = Math.min(firstPos?.y, lastPos?.y);
    let yMax = Math.max(firstPos?.y, lastPos?.y);
    const startPointX = xMin;
    const startPointY = yMin;
    selected = [];
    for (let i = 0; i < xMax - xMin + 1; i++) {
      for (let j = 0; j < yMax - yMin + 1; j++) {
        selected.push({ x: startPointX + i, y: startPointY + j });
      }
    }
    console.log(selected);
  }, [firstPos, lastPos]);

  const isSelected = (x: number, y: number) =>
    firstPos?.x === x && firstPos?.y === y;

  const isSelectedGroup = (x: number, y: number) =>
    selected.some((coord) => coord.x === x && coord.y === y);

  const testLayer: Layer = (x, y) => {
    if (isSelectedGroup(x, y)) {
      return {
        color: "#00FF99",
        scale: 0.8,
      };
    }
    if (
      (firstPos?.x === x && firstPos?.y === y) ||
      (lastPos?.x === x && lastPos?.y === y)
    ) {
      return {
        color: "#00ff00",
        scale: 1,
      };
    }
    return null;
  };

  const executeMerge = () => {
    // let mock = {};
    // console.log(selected);
    for (let i = 0; i < selected.length; i++) {
      const id = selected[i].x + "," + selected[i].y;
      // mock = { ...mock, "x,y": { location: selected[i] } };
      atlasMock[id] = { type: 5, x: selected[i].x, y: selected[i].y };
    }
    console.log(atlasMock);
  };

  const executeConnectAll = () => {
    for (let i = 0; i < selected.length; i++) {
      const id = selected[i].x + "," + selected[i].y;
      atlasMock[id] = {
        type: 5,
        x: selected[i].x,
        y: selected[i].y,
        top: 1,
        left: 1,
        topLeft: 1,
      };
    }
  };

  const executeConnectTop = () => {
    for (let i = 0; i < selected.length; i++) {
      const id = selected[i].x + "," + selected[i].y;
      atlasMock[id] = {
        type: 5,
        x: selected[i].x,
        y: selected[i].y,
        top: 1,
      };
    }
  };

  const executeConnectLeft = () => {
    for (let i = 0; i < selected.length; i++) {
      const id = selected[i].x + "," + selected[i].y;
      atlasMock[id] = {
        type: 5,
        x: selected[i].x,
        y: selected[i].y,
        left: 1,
      };
    }
  };

  const executeConnectTopLeftOnly = () => {
    for (let i = 0; i < selected.length; i++) {
      const id = selected[i].x + "," + selected[i].y;
      atlasMock[id] = {
        type: 5,
        x: selected[i].x,
        y: selected[i].y,
        top: 1,
        left: 1,
      };
    }
  };

  const executeDisconnectAll = () => {
    for (let i = 0; i < selected.length; i++) {
      const id = selected[i].x + "," + selected[i].y;
      atlasMock[id] = {
        type: 5,
        x: selected[i].x,
        y: selected[i].y,
      };
    }
  };

  const executeReset = () => {
    for (let i = 0; i < selected.length; i++) {
      const id = selected[i].x + "," + selected[i].y;
      atlasMock[id] = {
        x: selected[i].x,
        y: selected[i].y,
      };
    }
  };

  // const mouse = useMouse(TileMap, {
  //   enterDelay: 100,
  //   leaveDelay: 100,
  // }) as any;

  // useEffect(() => {
  //   if (mouse.isDown) {
  //     console.log(mouse.x);
  //   }
  // }, [mouse]);

  return (
    <div className="">
      <div className="col-12">
        <div className="row">
          <div className="col-11" style={{ height: 800 }}>
            <TileMap
              ref={refC}
              className="atlas"
              layers={[atlasLayer, testLayer, hoverStrokeLayer]}
              onClick={(x, y) => {
                handleOnClick(x, y);
              }}
              onHover={handleHover}
              isDraggable={isEnabledDrag}
              // onPopup={(arg) => {
              //   console.log(arg);
              // }}
              // onChange={(data) => {
              //   console.log(data);
              // }}
            />
          </div>

          <div className="col-1">
            <button onClick={() => executeMerge()}>merge</button>
            <button onClick={() => executeConnectAll()}>connect all</button>
            <button onClick={() => executeConnectTop()}>connect top</button>
            <button onClick={() => executeConnectLeft()}>connect left</button>
            <button onClick={() => executeConnectTopLeftOnly()}>
              connect top left only
            </button>
            <button onClick={() => executeDisconnectAll()}>
              disconnect all
            </button>
            <button onClick={() => executeReset()}>reset all</button>
            <button onClick={() => setEnabledDrag(!isEnabledDrag)}>
              {isEnabledDrag ? <>Disable Drag</> : <>Enable Drag</>}
            </button>
            <button onClick={() => setEnabledTop(!isEnabledTop)}>
              {isEnabledTop ? <>Disable Top</> : <>Enable Top</>}
            </button>
            <button onClick={() => setEnabledLeft(!isEnabledLeft)}>
              {isEnabledLeft ? <>Disable Left</> : <>Enable Left</>}
            </button>
            <button onClick={() => setEnabledTopLeft(!isEnabledTopLeft)}>
              {isEnabledTopLeft ? <>Disable TopLeft</> : <>Enable TopLeft</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
