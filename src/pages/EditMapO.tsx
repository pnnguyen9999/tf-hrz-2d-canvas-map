/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Divider, Space } from "antd";
import axios from "axios";
import { Atlas, AtlasTile, COLOR_BY_TYPE } from "classes/atlas";
import { Coord, TileMap } from "components";
import React, { useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import LoadingOverlay from "react-loading-overlay";
import { useSearchParams } from "react-router-dom";
import { API_ENDPOINT, API_VIEWING_ENDPOINT } from "constant/api";

type DragData = {
  center: Coord;
  nw: Coord;
  se: Coord;
  zoom: number;
};
const limitWMap = 274;
export default function EditMapO() {
  //   let atlasCreate = new Atlas();
  const [atlasCreate, setAtlasCreate] = useState<Atlas>(new Atlas());
  const [isReady, setReady] = useState<boolean>(false);
  const [isEnabledDrag, setEnabledDrag] = useState<boolean>(true);
  const [isEnabledTop, setEnabledTop] = useState<boolean>(true);
  const [isEnabledLeft, setEnabledLeft] = useState<boolean>(true);
  const [isEnabledTopLeft, setEnabledTopLeft] = useState<boolean>(true);
  const [isFreeRectangle, setFreeRectangle] = useState<boolean>(true);
  const [isEnableColorGrid, setEnableColorGrid] = useState<boolean>(true);
  const [dragMapData, setDragMapData] = useState<DragData>();
  const [currentHover, setCurrentHover] = useState<any>();
  const [currentPopupData, setCurrentPopupData] = useState<any>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [initCenter, setInitCenter] = useState<any>({
    centerPointX: 0,
    centerPointY: 0,
  });
  const [dataMapSumary, setDataMapSumary] = useState<any>();
  const refMap = useRef<any>();

  useEffect(() => {
    async function loadMap() {
      await axios.get(`${API_ENDPOINT}/lands/summary`).then((res: any) => {
        console.log(res.data.data);
        setDataMapSumary(res.data.data);
      });
      await axios
        .get(
          `${API_VIEWING_ENDPOINT}/lands?start=-${
            limitWMap + 1
          },${limitWMap}&end=${limitWMap},-${limitWMap + 1}`
        )
        .then(async (res: any) => {
          await atlasCreate.parseInfoData(
            res.data.data as Record<string, AtlasTile>
          );
          setReady(true);
          console.log("loaded");
        });
    }
    loadMap();
  }, [atlasCreate]);

  useEffect(() => {
    if (isReady) {
      if (searchParams.get("centerPointX")) {
        setInitCenter({
          centerPointX: parseInt(searchParams.get("centerPointX")),
          centerPointY: parseInt(searchParams.get("centerPointY")),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  useEffect(() => {
    if (isReady) {
      atlasCreate.parseVisualizeToogle(
        isEnabledTop,
        isEnabledLeft,
        isEnabledTopLeft,
        isEnableColorGrid
      );
    }
  }, [
    isReady,
    isEnabledLeft,
    isEnabledTop,
    isEnabledTopLeft,
    atlasCreate,
    isEnableColorGrid,
  ]);

  useEffect(() => {
    if (isReady) {
      atlasCreate.parseDragMode(isFreeRectangle);
    }
  }, [isReady, atlasCreate, isFreeRectangle]);

  return (
    <>
      <div>
        <div className="col-12">
          <div className="row">
            <div
              className="titlemap-area col-8 p-0"
              style={{ height: "100vh" }}
            >
              <div className="col-12 container mt-2">
                <div className="row my-2">
                  <div className="col-md-2 col-6">
                    <div className="d-flex align-items-center">
                      <div className="land-color" />
                      <div className="land-info d-flex flex-column land-name">
                        <div>Total Land</div>
                        <div>({dataMapSumary?.totalLand})</div>
                      </div>
                    </div>
                  </div>
                  {dataMapSumary?.summary.map((obj: any) => (
                    <div className="col-md-2 col-6">
                      <div className="d-flex align-items-center">
                        <div
                          className="land-color"
                          style={{
                            backgroundColor: COLOR_BY_TYPE[obj.id].color,
                          }}
                        />
                        <div className="land-info d-flex flex-column land-name">
                          <div>{obj.type}</div>
                          <div>
                            ({obj.percent}%&nbsp;-&nbsp;{obj.land})
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {!isReady && (
                <div className="p-5">
                  <LoadingOverlay
                    active={!isReady}
                    spinner
                    text="Loading map data..."
                  ></LoadingOverlay>
                </div>
              )}
              {isReady && atlasCreate.returnAtlasData() && (
                <>
                  {atlasCreate.returnAtlasData()[
                    `${currentPopupData?.x},${currentPopupData?.y}`
                  ] && (
                    <div
                      className="popup-parcel"
                      style={{
                        left: currentPopupData?.top + 30,
                        top: currentPopupData?.left - 100,
                      }}
                    >
                      _id:{" "}
                      {
                        atlasCreate.returnAtlasData()[
                          `${currentPopupData?.x},${currentPopupData?.y}`
                        ]?._id
                      }
                      <div>
                        type:{" "}
                        {
                          COLOR_BY_TYPE[
                            atlasCreate.returnAtlasData()[
                              `${currentPopupData?.x},${currentPopupData?.y}`
                            ]?.type
                          ]?.name
                        }
                      </div>
                    </div>
                  )}
                  <TileMap
                    ref={refMap}
                    className="atlas"
                    layers={[
                      atlasCreate.renderColorAreaLayer,
                      atlasCreate.renderAtlasLayer,
                      atlasCreate.renderHoverLayer,
                      atlasCreate.renderSelectedLayer,
                    ]}
                    onChange={(data) => {
                      setDragMapData(data);
                      const centerPointX = (data.se.x +
                        Math.round((dragMapData.nw.x - data.se.x) / 2)) as any;
                      const centerPointY = (data.se.y +
                        Math.round((dragMapData.nw.y - data.se.y) / 2)) as any;
                      setSearchParams({ centerPointX, centerPointY });
                    }}
                    onHover={(x, y) => {
                      atlasCreate.handleHover(x, y);
                      setCurrentHover({ x, y });
                    }}
                    onClick={atlasCreate.onClickAtlas}
                    onPopup={(arg) => {
                      setCurrentPopupData(arg);
                    }}
                    isDraggable={isEnabledDrag}
                    x={initCenter.centerPointX}
                    y={initCenter.centerPointY}
                  />
                </>
              )}
            </div>
            <div className="col-4">
              <div className="col-12">
                <div className="row">
                  <div className="col-6">
                    <Divider orientation="left">Drag Mode</Divider>
                    <Space size={10} wrap>
                      <Button
                        onClick={() => setFreeRectangle(!isFreeRectangle)}
                      >
                        Current mode:&nbsp;{" "}
                        {isFreeRectangle ? <>Reactagle</> : <>Square</>}
                      </Button>
                    </Space>
                    <Divider orientation="left">Tool Box</Divider>
                    <Space size={10} wrap>
                      <Button
                        onClick={async () => {
                          await atlasCreate.executeMerge();
                          // setAtlasRender(atlasCreate.renderAtlasLayer);
                        }}
                      >
                        Merge
                      </Button>
                      <Button onClick={() => atlasCreate.executeCreateGrid()}>
                        Create grid (Disconnect)
                      </Button>
                      <Button onClick={() => atlasCreate.executeConnectAll()}>
                        Connect all
                      </Button>
                      <Button onClick={() => atlasCreate.executeConnectTop()}>
                        Disconnect Left
                      </Button>
                      <Button onClick={() => atlasCreate.executeConnectLeft()}>
                        Disconnect Top
                      </Button>
                      <Button
                        onClick={() => atlasCreate.executeConnectTopLeftOnly()}
                      >
                        Connect Top Left
                      </Button>
                    </Space>
                    <Divider orientation="left">Map Interaction</Divider>
                    <Space size={10} wrap>
                      <Button
                        type="primary"
                        danger={isEnabledDrag}
                        onClick={() => setEnabledDrag(!isEnabledDrag)}
                      >
                        {isEnabledDrag ? <>Disable Drag</> : <>Enable Drag</>}
                      </Button>
                    </Space>
                    <Divider orientation="left">Visualize</Divider>
                    <Space size={10} wrap>
                      <Button
                        onClick={() => setEnableColorGrid(!isEnableColorGrid)}
                      >
                        {isEnableColorGrid ? (
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
                    <Button
                      type="primary"
                      onClick={async () => {
                        atlasCreate.saveTiles();
                        await axios
                          .get(
                            `https://dev-api-admin.horizonland.app/api/lands/summary`
                          )
                          .then((res: any) => {
                            console.log(res.data.data);
                            setDataMapSumary(res.data.data);
                          });
                      }}
                    >
                      Save Map
                    </Button>
                  </div>
                  <div className="col-6">
                    <Divider orientation="left">Land Types</Divider>
                    <Space size={10} wrap>
                      <Button
                        onClick={() => atlasCreate.setLandType("emptyland")}
                      >
                        Set to Empty Land
                      </Button>
                      <Button onClick={() => atlasCreate.setLandType("user")}>
                        Set to User's Land
                      </Button>
                      <Button
                        onClick={() => atlasCreate.setLandType("partner")}
                      >
                        Set to Partner's Land
                      </Button>
                      <Button
                        onClick={() => atlasCreate.setLandType("horizon")}
                      >
                        Set to Horizon's Land
                      </Button>
                      <Button onClick={() => atlasCreate.setLandType("sea")}>
                        Set to Sea's Land
                      </Button>
                    </Space>
                    <Divider orientation="left">Parcel Info</Divider>
                    {isReady && atlasCreate.returnAtlasData() && (
                      <div>
                        [{currentHover?.x}, {currentHover?.y}]
                        <div style={{ wordWrap: "break-word" }}>
                          {JSON.stringify(
                            atlasCreate.returnAtlasData()[
                              `${currentHover?.x},${currentHover?.y}`
                            ]
                          )}
                          <div>
                            Land Type:&nbsp;
                            {
                              COLOR_BY_TYPE[
                                atlasCreate.returnAtlasData()[
                                  `${currentHover?.x},${currentHover?.y}`
                                ]?.type
                              ]?.name
                            }
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
