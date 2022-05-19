import React, { useEffect, useRef, useState } from "react";
import { Coord, Layer, TileMap } from "../components";
import useMouse from "mouse-position";
import "antd/dist/antd.css";
import { Space, Button, message } from "antd";
import { Divider } from "antd";
import TextArea from "antd/lib/input/TextArea";
import axios from "axios";

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
  "6285c404f1340f47efb55f47": {
    color: "#3E6587",
    name: "User",
  }, // User
  "6285c408f1340f47efb55f61": {
    color: "#E8C82B",
    name: "Partner",
  }, // Partner
  "6285c400f1340f47efb55f31": {
    color: "#1A54A4",
    name: "Horizon Land",
  }, // Horizon
  "6285c3fbf1340f47efb55f1f": {
    color: "#595B7C",
    name: "Sea",
  }, // Sea
  4: "#ffbd33", // parcels/estates where I have permissions
  5: "#5054D4", // districts
  6: "#563db8", // contributions
  7: "#716C7A", // roads
  8: "#70AC76", // plazas
  9: "#3D3A46", // owned parcel/estate
  10: "#3D3A46", // parcels on sale (we show them as owned parcels)
  11: "#09080A", // unowned pacel/estate
  12: "#CCCCCC", // background
  13: "#E3E3E3", // loading odd
  14: "#0d0b0e", // loading even
});
let hover;

let atlasMock = {};
let selected: Coord[] = [];

const Home: React.FC = () => {
  const refC = useRef<any>();
  const [isEnabledDrag, setEnabledDrag] = useState<boolean>(true);
  const [isEnabledTop, setEnabledTop] = useState<boolean>(true);
  const [isEnabledLeft, setEnabledLeft] = useState<boolean>(true);
  const [isEnabledTopLeft, setEnabledTopLeft] = useState<boolean>(true);

  // first & last position of selected group
  const [firstPos, setFirstPos] = useState<any>({});
  const [lastPos, setLastPos] = useState<any>({});

  const [isFreeRectangle, setFreeRectangle] = useState<boolean>(true);

  const [currentParcel, setCurrentParcel] = useState<any>({});
  const [isEnableDebugMode, setEnableDebugMode] = useState<boolean>(true);

  async function loadTiles() {
    const resp = await fetch("http://68.183.231.255:12000/api/lands");
    const json = await resp.json();
    atlasMock = json.data as Record<string, AtlasTile>;
  }

  useEffect(() => {
    loadTiles().catch(console.error);
  }, []);

  async function saveTiles() {
    let dataSend = {
      data: atlasMock,
    };
    const res = await axios
      .post(`http://68.183.231.255:12000/api/lands`, dataSend)
      .then((res: any) => {
        if (res.status === 200) {
          message.success("save success");
          loadTiles().catch(console.error);
        } else {
          message.warn("save failed");
        }
      });
  }

  const atlasLayer: any = (x, y) => {
    const id = x + "," + y;
    if (atlasMock !== null && id in atlasMock) {
      const tile = atlasMock[id];
      const color = COLOR_BY_TYPE[tile?.type].color;

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
        color:
          x === 0 || y === 0
            ? COLOR_BY_TYPE[10]
            : (x + y) % 2 === 0
            ? COLOR_BY_TYPE[12]
            : COLOR_BY_TYPE[13],
      };
    }
  };

  const handleHover = (x: number, y: number) => {
    hover = { x, y };
    if (isEnableDebugMode) {
      setCurrentParcel({ x, y });
    }
  };

  const isHighlighted = (x: number, y: number) => {
    if (!hover) return false;

    if (
      typeof firstPos?.x !== "undefined" &&
      typeof firstPos?.y !== "undefined" &&
      !(typeof lastPos?.x !== "undefined" && typeof lastPos?.y !== "undefined")
    ) {
      let xMin = Math.min(firstPos?.x, hover.x);
      let xMax = Math.max(firstPos?.x, hover.x);
      let yMin = Math.min(firstPos?.y, hover.y);
      let yMax = Math.max(firstPos?.y, hover.y);
      return (
        /**
         * @rotateAroundAxis -> x > 0, y > 0
         */
        (xMin <= x && x <= hover.x && yMin <= y && y <= hover.y) ||
        /**
         * @rotateAroundAxis -> x > 0, y < 0
         */
        (xMin <= x && x <= hover.x && yMax >= y && y >= hover.y) ||
        /**
         * @rotateAroundAxis -> x < 0, y > 0
         */
        (xMax >= x && x >= hover.x && yMin <= y && y <= hover.y) ||
        /**
         * @rotateAroundAxis -> x < 0, y < 0
         */
        (xMax >= x && x >= hover.x && yMax >= y && y >= hover.y)
      );
    } else {
      return hover.x === x && hover.y === y;
    }
    // only highlight a 10x10 area centered around hover coords
    // const radius = 1;
    // return (
    //   x > hover.x - radius &&
    //   x < hover.x + radius &&
    //   y > hover.y - radius &&
    //   y < hover.y + radius
    // );
  };

  const isValidSquare = () => {
    if (!hover) return false;
    if (!isFreeRectangle) {
      if (
        typeof firstPos?.x !== "undefined" &&
        typeof firstPos?.y !== "undefined" &&
        !(
          typeof lastPos?.x !== "undefined" && typeof lastPos?.y !== "undefined"
        )
      ) {
        let xMin = Math.min(firstPos?.x, hover.x);
        let xMax = Math.max(firstPos?.x, hover.x);
        let yMin = Math.min(firstPos?.y, hover.y);
        let yMax = Math.max(firstPos?.y, hover.y);
        return (
          Math.abs(xMax - xMin) < 5 &&
          Math.abs(yMin - yMax) < 5 &&
          Math.abs(xMax - xMin) === Math.abs(yMin - yMax)
        );
      }
    } else {
      return true;
    }
  };

  const hoverStrokeLayer: Layer = (x, y) => {
    if (isHighlighted(x, y)) {
      return {
        color: isValidSquare() ? "#8A8DD4" : "#ff2200",
        scale: 1,
      };
    }
    return null;
  };

  const handleOnClick = (x, y) => {
    console.log({ x, y });
    // const id = x + "," + y;
    // console.log(atlasMock[id]);
    if (
      typeof firstPos?.x !== "undefined" &&
      typeof firstPos?.y !== "undefined" &&
      typeof lastPos?.x !== "undefined" &&
      typeof lastPos?.y !== "undefined"
    ) {
      setFirstPos(null);
      setLastPos(null);
    } else {
      if (
        typeof firstPos?.x !== "undefined" &&
        typeof firstPos?.y !== "undefined"
      ) {
        if (isValidSquare()) {
          setLastPos({
            x,
            y,
          });
        } else {
          setFirstPos(null);
          setLastPos(null);
        }
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
    console.log({ xMin, yMin });
    selected = [];
    for (let i = 0; i < xMax - xMin + 1; i++) {
      for (let j = 0; j < yMax - yMin + 1; j++) {
        selected.push({ x: startPointX + i, y: startPointY + j });
      }
    }
    // setFirstPos(null);
    // setLastPos(null);
    console.log(selected);
  }, [firstPos, lastPos]);

  const isSelectedGroup = (x: number, y: number) =>
    selected.some((coord) => coord.x === x && coord.y === y);

  const selectedLayer: Layer = (x, y) => {
    /**
     * draw a selected group
     */
    if (isSelectedGroup(x, y)) {
      return {
        color: "#212356",
        scale: 1,
      };
    }
    /**
     * draw 2 points firstPos & lastPos
     */
    if (
      (firstPos?.x === x && firstPos?.y === y) ||
      (lastPos?.x === x && lastPos?.y === y)
    ) {
      return {
        color: "#8A8DD4",
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
      atlasMock[id] = {
        ...atlasMock[id],
        type: "6285c3fbf1340f47efb55f1f",
        x: selected[i].x,
        y: selected[i].y,
        top: 0,
        left: 0,
        topLeft: 0,
      };
    }
    console.log(atlasMock);
  };

  const executeConnectAll = () => {
    for (let i = 0; i < selected.length; i++) {
      const id = selected[i].x + "," + selected[i].y;
      atlasMock[id] = {
        ...atlasMock[id],
        type: "6285c3fbf1340f47efb55f1f",
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
        ...atlasMock[id],
        type: "6285c3fbf1340f47efb55f1f",
        x: selected[i].x,
        y: selected[i].y,
        top: 1,
        left: 0,
        topLeft: 0,
      };
    }
  };

  const executeConnectLeft = () => {
    for (let i = 0; i < selected.length; i++) {
      const id = selected[i].x + "," + selected[i].y;
      atlasMock[id] = {
        ...atlasMock[id],
        type: "6285c3fbf1340f47efb55f1f",
        x: selected[i].x,
        y: selected[i].y,
        left: 1,
        top: 0,
        topLeft: 0,
      };
    }
  };

  const executeConnectTopLeftOnly = () => {
    for (let i = 0; i < selected.length; i++) {
      const id = selected[i].x + "," + selected[i].y;
      atlasMock[id] = {
        ...atlasMock[id],
        type: "6285c3fbf1340f47efb55f1f",
        x: selected[i].x,
        y: selected[i].y,
        top: 1,
        left: 1,
        topLeft: 0,
      };
    }
  };

  const executeDisconnectAll = () => {
    for (let i = 0; i < selected.length; i++) {
      const id = selected[i].x + "," + selected[i].y;
      atlasMock[id] = {
        ...atlasMock[id],
        type: "6285c3fbf1340f47efb55f1f",
        x: selected[i].x,
        y: selected[i].y,
        top: 0,
        left: 0,
        topLeft: 0,
      };
    }
  };

  const executeReset = () => {
    for (let i = 0; i < selected.length; i++) {
      const id = selected[i].x + "," + selected[i].y;
      atlasMock[id] = {
        ...atlasMock[id]?._id,
        x: selected[i].x,
        y: selected[i].y,
      };
    }
  };

  const executeMergeAll = () => {
    console.log(selected);
    let checkTop;
    let checkLeft;
    let checkTopLeft;
    for (let i = 0; i < selected.length; i++) {
      const id = selected[i].x + "," + selected[i].y;
      checkTop = selected.find(
        (e) => e.x == selected[i].x && e.y == selected[i].y + 1
      );
      checkLeft = selected.find(
        (e) => e.x == selected[i].x - 1 && e.y == selected[i].y
      );
      checkTopLeft = selected.find(
        (e) => e.x == selected[i].x - 1 && e.y == selected[i].y + 1
      );
      atlasMock[id] = {
        ...atlasMock[id],
        x: selected[i].x,
        y: selected[i].y,
        top: !!checkTop ? 1 : 0,
        left: !!checkLeft ? 1 : 0,
        topLeft: !!checkTopLeft ? 1 : 0,
        type: "6285c3fbf1340f47efb55f1f",
      };
    }
  };

  const setLandType = (type: string) => {
    switch (type) {
      case "user": {
        for (let i = 0; i < selected.length; i++) {
          const id = selected[i].x + "," + selected[i].y;
          atlasMock[id] = {
            ...atlasMock[id],
            type: "6285c404f1340f47efb55f47",
          };
        }
        break;
      }
      case "partner": {
        for (let i = 0; i < selected.length; i++) {
          const id = selected[i].x + "," + selected[i].y;
          atlasMock[id] = {
            ...atlasMock[id],
            type: "6285c408f1340f47efb55f61",
          };
        }
        break;
      }
      case "horizon": {
        for (let i = 0; i < selected.length; i++) {
          const id = selected[i].x + "," + selected[i].y;
          atlasMock[id] = {
            ...atlasMock[id],
            type: "6285c400f1340f47efb55f31",
          };
        }
        break;
      }
      default:
      case "sea": {
        for (let i = 0; i < selected.length; i++) {
          const id = selected[i].x + "," + selected[i].y;
          atlasMock[id] = {
            ...atlasMock[id],
            type: "6285c3fbf1340f47efb55f1f",
          };
        }
        break;
      }
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
      <div className="col-12 pl-0">
        <div className="row">
          <div className="col-8 p-0" style={{ height: "100vh" }}>
            <TileMap
              ref={refC}
              className="atlas"
              layers={[atlasLayer, selectedLayer, hoverStrokeLayer]}
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

          <div className="col-4">
            <div className="col-12">
              <div className="row">
                <div className="col-6">
                  <Divider orientation="left">Drag Mode</Divider>
                  <Space size={10} wrap>
                    <Button onClick={() => setFreeRectangle(!isFreeRectangle)}>
                      Current mode:&nbsp;{" "}
                      {isFreeRectangle ? <>Reactagle</> : <>Square</>}
                    </Button>
                  </Space>
                  <Divider orientation="left">Tool Box</Divider>
                  <Space size={10} wrap>
                    <Button onClick={() => executeMergeAll()}>
                      Merge all [&nbsp;]
                    </Button>
                    <Button onClick={() => executeMerge()}>
                      Merge grid [+]
                    </Button>
                    <Button onClick={() => executeConnectAll()}>
                      Connect all
                    </Button>
                    <Button onClick={() => executeConnectTop()}>
                      Connect top
                    </Button>
                    <Button onClick={() => executeConnectLeft()}>
                      Connect left
                    </Button>
                    <Button onClick={() => executeConnectTopLeftOnly()}>
                      Connect top left only
                    </Button>
                    <Button onClick={() => executeDisconnectAll()}>
                      Disconnect all
                    </Button>
                    <Button onClick={() => executeReset()}>Reset all</Button>
                  </Space>
                  <Divider orientation="left">Map Interaction</Divider>
                  <Space size={10} wrap>
                    <Button onClick={() => setEnabledDrag(!isEnabledDrag)}>
                      {isEnabledDrag ? <>Disable Drag</> : <>Enable Drag</>}
                    </Button>
                  </Space>
                  <Divider orientation="left">Visualize</Divider>
                  <Space size={10} wrap>
                    <Button onClick={() => setEnabledTop(!isEnabledTop)}>
                      {isEnabledTop ? <>Disable Top</> : <>Enable Top</>}
                    </Button>
                    <Button onClick={() => setEnabledLeft(!isEnabledLeft)}>
                      {isEnabledLeft ? <>Disable Left</> : <>Enable Left</>}
                    </Button>
                    <Button
                      onClick={() => setEnabledTopLeft(!isEnabledTopLeft)}
                    >
                      {isEnabledTopLeft ? (
                        <>Disable TopLeft</>
                      ) : (
                        <>Enable TopLeft</>
                      )}
                    </Button>
                  </Space>
                  <Divider orientation="left">Data Interaction</Divider>
                  <Button type="primary" onClick={() => saveTiles()}>
                    Save Map
                  </Button>
                </div>
                <div className="col-6">
                  <Divider orientation="left">Land Types</Divider>
                  <Space size={10} wrap>
                    <Button onClick={() => setLandType("user")}>
                      Set to User's Land
                    </Button>
                    <Button onClick={() => setLandType("partner")}>
                      Set to Partner's Land
                    </Button>
                    <Button onClick={() => setLandType("horizon")}>
                      Set to Horizon's Land
                    </Button>
                    <Button onClick={() => setLandType("sea")}>
                      Set to Sea's Land
                    </Button>
                  </Space>
                  <Divider orientation="left">Debug Mode</Divider>
                  <Space size={10}>
                    <Button
                      danger
                      onClick={() => setEnableDebugMode(!isEnableDebugMode)}
                    >
                      {isEnableDebugMode ? (
                        <>Disable Debug</>
                      ) : (
                        <>Enable Debug</>
                      )}
                    </Button>
                  </Space>
                  <div>
                    [{currentParcel.x}, {currentParcel.y}]
                    <div style={{ wordWrap: "break-word" }}>
                      {JSON.stringify(
                        atlasMock[`${currentParcel.x},${currentParcel.y}`]
                      )}
                      <div>
                        Land Type:&nbsp;
                        {
                          COLOR_BY_TYPE[
                            atlasMock[`${currentParcel.x},${currentParcel.y}`]
                              ?.type
                          ]?.name
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
