import React, { useEffect, useRef, useState } from "react";
import { Coord, Layer, TileMap } from "../components";
import useMouse from "mouse-position";
import { Space, Button } from "antd";
import { Divider } from "antd";
import TextArea from "antd/lib/input/TextArea";
import axios from "axios";
import axiosService from "services/axiosService";
import { toast } from "react-toastify";
import _ from "lodash";
import { API_ENDPOINT } from "constant/api";

type AtlasTile = {
  x: number;
  y: number;
  type: number;
  estate_id: number;
  left: number;
  top: number;
  topLeft: number;
};

export const COLOR_BY_TYPE = Object.freeze({
  "62875eab7aad92b518bfec76": {
    color: "#3E6587",
    name: "User",
  }, // User
  "62875eaf7aad92b518bfec88": {
    color: "#C4A923",
    name: "Partner",
  }, // Partner
  "62875eeb7aad92b518bfec9e": {
    color: "#1A54A4",
    name: "Horizon Land",
  }, // Horizon
  "62875efc7aad92b518bfecb8": {
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
let atlasStock = {};
let atlasAdd = {};

let selected: Coord[] = [];

const EditMap: React.FC = () => {
  const refC = useRef<any>();
  const [isEnabledDrag, setEnabledDrag] = useState<boolean>(true);
  const [isEnabledTop, setEnabledTop] = useState<boolean>(true);
  const [isEnabledLeft, setEnabledLeft] = useState<boolean>(true);
  const [isEnabledTopLeft, setEnabledTopLeft] = useState<boolean>(true);

  const [currentPopupData, setCurrentPopupData] = useState<any>();

  // first & last position of selected group
  const [firstPos, setFirstPos] = useState<any>({});
  const [lastPos, setLastPos] = useState<any>({});

  const [isFreeRectangle, setFreeRectangle] = useState<boolean>(true);

  const [currentParcel, setCurrentParcel] = useState<any>({});
  const [isEnableDebugMode, setEnableDebugMode] = useState<boolean>(true);

  const [enableColorGrid, setEnableColorGrid] = useState<boolean>(true);

  async function loadTiles() {
    await axios.get(`${API_ENDPOINT}/lands`).then((res: any) => {
      atlasMock = res.data.data as Record<string, AtlasTile>;
      // atlasStock = { ...res.data.data } as Record<string, AtlasTile>;
      // console.log(atlasMock);
    });
  }

  useEffect(() => {
    loadTiles().catch(console.error);
  }, []);

  async function saveTiles() {
    // let atlasData = Object.entries(atlasMock);
    // let stockData = Object.entries(atlasStock);
    // // console.log({ atlasData, stockData });
    // // console.log(_.differenceWith(atlasData, stockData, _.isEqual));
    // const atlasSend = Object.fromEntries(
    //   _.differenceWith(atlasData, stockData, _.isEqual)
    // );
    // let dataSend = {
    //   data: atlasSend,
    // };
    console.log(atlasAdd);
    let dataSend = {
      data: atlasAdd,
    };
    await axiosService
      .post(`${API_ENDPOINT}/lands`, dataSend)
      .then((res: any) => {
        if (res.status === 200) {
          // message.info(res.data.message);
          toast.info(res.data.message);
          loadTiles().catch(console.error);
          atlasAdd = {};
        } else {
          toast.error("save failed");
        }
      });
  }
  const areaLayer: any = (x, y) => {
    if (enableColorGrid) {
      return {
        scale: 1.1,
        color:
          y > 0 && x < 0
            ? "#FF56CC"
            : y > 0 && x >= 0
            ? "#8CFF56"
            : x >= 0 && y <= 0
            ? "#FF7556"
            : y <= 0 && x < 0
            ? "#56A5FF"
            : "#fff",
      };
    } else {
      return {
        // tra ve chessboardLayer
        // scale: 1,
        // color: (x + y) % 2 === 0 ? COLOR_BY_TYPE[12] : COLOR_BY_TYPE[13],
      };
    }
  };
  const atlasLayer: any = (x, y) => {
    const id = x + "," + y;
    if (atlasMock !== null && id in atlasMock) {
      const tile = atlasMock[id];
      const color = atlasMock[id]?.type
        ? COLOR_BY_TYPE[tile?.type]?.color
        : COLOR_BY_TYPE[12];

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
        scale: 1,
        color: (x + y) % 2 === 0 ? COLOR_BY_TYPE[12] : COLOR_BY_TYPE[13],
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
    for (let i = 0; i < selected.length; i++) {
      const id = selected[i].x + "," + selected[i].y;
      atlasAdd[id] = {
        ...atlasAdd[id],
        type: atlasMock[id].type || "62875efc7aad92b518bfecb8",
        x: selected[i].x,
        y: selected[i].y,
        top: 0,
        left: 0,
        topLeft: 0,
      };
      atlasMock[id] = {
        ...atlasMock[id],
        type: atlasMock[id].type || "62875efc7aad92b518bfecb8",
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
      atlasAdd[id] = {
        ...atlasAdd[id],
        type: atlasMock[id].type || "62875efc7aad92b518bfecb8",
        x: selected[i].x,
        y: selected[i].y,
        top: 1,
        left: 1,
        topLeft: 1,
      };
      atlasMock[id] = {
        ...atlasMock[id],
        type: atlasMock[id].type || "62875efc7aad92b518bfecb8",
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
      atlasAdd[id] = {
        ...atlasAdd[id],
        type: atlasMock[id].type || "62875efc7aad92b518bfecb8",
        x: selected[i].x,
        y: selected[i].y,
        top: 1,
        left: 0,
        topLeft: 0,
      };
      atlasMock[id] = {
        ...atlasMock[id],
        type: atlasMock[id].type || "62875efc7aad92b518bfecb8",
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
      atlasAdd[id] = {
        ...atlasAdd[id],
        type: atlasMock[id].type || "62875efc7aad92b518bfecb8",
        x: selected[i].x,
        y: selected[i].y,
        left: 1,
        top: 0,
        topLeft: 0,
      };
      atlasMock[id] = {
        ...atlasMock[id],
        type: atlasMock[id].type || "62875efc7aad92b518bfecb8",
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
      atlasAdd[id] = {
        ...atlasAdd[id],
        type: atlasMock[id].type || "62875efc7aad92b518bfecb8",
        x: selected[i].x,
        y: selected[i].y,
        top: 1,
        left: 1,
        topLeft: 0,
      };
      atlasMock[id] = {
        ...atlasMock[id],
        type: atlasMock[id].type || "62875efc7aad92b518bfecb8",
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
      atlasAdd[id] = {
        ...atlasAdd[id],
        type: atlasMock[id].type || "62875efc7aad92b518bfecb8",
        x: selected[i].x,
        y: selected[i].y,
        top: 0,
        left: 0,
        topLeft: 0,
      };
      atlasMock[id] = {
        ...atlasMock[id],
        type: atlasMock[id].type || "62875efc7aad92b518bfecb8",
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
      atlasAdd[id] = {
        ...atlasAdd[id],
        type: atlasMock[id].type || "62875efc7aad92b518bfecb8",
        x: selected[i].x,
        y: selected[i].y,
      };
      atlasMock[id] = {
        ...atlasMock[id],
        type: atlasMock[id].type || "62875efc7aad92b518bfecb8",
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
      atlasAdd[id] = {
        ...atlasAdd[id],
        type: "62875efc7aad92b518bfecb8",
        x: selected[i].x,
        y: selected[i].y,
        top: !!checkTop ? 1 : 0,
        left: !!checkLeft ? 1 : 0,
        topLeft: !!checkTopLeft ? 1 : 0,
      };
      atlasMock[id] = {
        ...atlasMock[id],
        type: "62875efc7aad92b518bfecb8",
        x: selected[i].x,
        y: selected[i].y,
        top: !!checkTop ? 1 : 0,
        left: !!checkLeft ? 1 : 0,
        topLeft: !!checkTopLeft ? 1 : 0,
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
            type: "62875eab7aad92b518bfec76",
          };
          atlasAdd[id] = {
            ...atlasAdd[id],
            type: "62875eab7aad92b518bfec76",
          };
        }
        break;
      }
      case "partner": {
        for (let i = 0; i < selected.length; i++) {
          const id = selected[i].x + "," + selected[i].y;
          atlasMock[id] = {
            ...atlasMock[id],
            type: "62875eaf7aad92b518bfec88",
          };
          atlasAdd[id] = {
            ...atlasAdd[id],
            type: "62875eaf7aad92b518bfec88",
          };
        }
        break;
      }
      case "horizon": {
        for (let i = 0; i < selected.length; i++) {
          const id = selected[i].x + "," + selected[i].y;
          atlasMock[id] = {
            ...atlasMock[id],
            type: "62875eeb7aad92b518bfec9e",
          };
          atlasAdd[id] = {
            ...atlasAdd[id],
            type: "62875eeb7aad92b518bfec9e",
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
            type: "62875efc7aad92b518bfecb8",
          };
          atlasAdd[id] = {
            ...atlasAdd[id],
            type: "62875efc7aad92b518bfecb8",
          };
        }
        break;
      }
    }
  };

  useEffect(() => {
    // console.log(currentPopupData);
  }, [currentPopupData]);

  return (
    <div className="edit-map">
      <div className="col-12 pl-0">
        <div className="row">
          <div className="titlemap-area col-8 p-0" style={{ height: "100vh" }}>
            {atlasMock[`${currentPopupData?.x},${currentPopupData?.y}`] && (
              <div
                className="popup-parcel"
                style={{
                  left: currentPopupData?.top + 20,
                  top: currentPopupData?.left - 80,
                }}
              >
                _id:{" "}
                {
                  atlasMock[`${currentPopupData?.x},${currentPopupData?.y}`]
                    ?._id
                }
                <div>
                  type:{" "}
                  {
                    COLOR_BY_TYPE[
                      atlasMock[`${currentPopupData.x},${currentPopupData.y}`]
                        ?.type
                    ]?.name
                  }
                </div>
              </div>
            )}

            <TileMap
              ref={refC}
              className="atlas"
              layers={[areaLayer, atlasLayer, selectedLayer, hoverStrokeLayer]}
              onClick={(x, y) => {
                handleOnClick(x, y);
              }}
              onHover={handleHover}
              isDraggable={isEnabledDrag}
              onPopup={(arg) => {
                // console.log(arg);
                setCurrentPopupData(arg);
              }}
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
                    <Button onClick={() => executeMergeAll()}>Merge</Button>
                    <Button onClick={() => executeMerge()}>Create grid</Button>
                    <Button onClick={() => executeConnectAll()}>
                      Connect all
                    </Button>
                    <Button onClick={() => executeConnectTop()}>
                      Disconnect left
                    </Button>
                    <Button onClick={() => executeConnectLeft()}>
                      Disconnect top
                    </Button>
                    <Button onClick={() => executeConnectTopLeftOnly()}>
                      Disconnect top left
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
                    <Button
                      onClick={() => setEnableColorGrid(!enableColorGrid)}
                    >
                      {enableColorGrid ? (
                        <>Disable Area Color</>
                      ) : (
                        <>Enable Area Color</>
                      )}
                    </Button>
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
                  <Divider orientation="left">Parcel Info</Divider>
                  {/* <Space size={10}>
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
                  </Space> */}
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

export default EditMap;
