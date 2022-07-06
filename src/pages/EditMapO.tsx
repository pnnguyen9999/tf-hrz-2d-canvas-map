/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Divider, Space } from "antd";
import axios from "axios";
import { Atlas, AtlasTile, COLOR_BY_TYPE } from "classes/atlas";
import { Coord, TileMap } from "components";
import React, { useEffect, useState } from "react";
import _ from "lodash";

type Props = {};
type DragData = {
  center: Coord;
  nw: Coord;
  se: Coord;
  zoom: number;
};

export default function EditMapO({}: Props) {
  //   let atlasCreate = new Atlas();
  const [atlasCreate, setAtlasCreate] = useState<Atlas>(new Atlas());
  const [isReady, setReady] = useState<boolean>(false);
  const [isEnabledTop, setEnabledTop] = useState<boolean>(true);
  const [isEnabledLeft, setEnabledLeft] = useState<boolean>(true);
  const [isEnabledTopLeft, setEnabledTopLeft] = useState<boolean>(true);
  const [isFreeRectangle, setFreeRectangle] = useState<boolean>(true);
  const [dragMapData, setDragMapData] = useState<DragData>();
  const [dataMapFromAPI, setDataMapFromAPI] = useState<
    Record<string, AtlasTile> | any
  >();
  const [currentHover, setCurrentHover] = useState<any>();
  const [currentPopupData, setCurrentPopupData] = useState<any>();
  const [tilesMap, setTilesMap] = useState<any>();
  const [atlasRender, setAtlasRender] = useState<any>();

  useEffect(() => {
    async function loadMap() {
      await axios
        .get(
          dragMapData
            ? `https://api-dev-map-viewing.horizonland.app/api/lands?start=${dragMapData?.nw?.x},${dragMapData?.nw?.y}&end=${dragMapData?.se?.x},${dragMapData?.se?.y}`
            : `https://api-dev-map-viewing.horizonland.app/api/lands?start=-15,15&end=15,-15`
        )
        .then(async (res: any) => {
          console.log("loaded");
          await atlasCreate.parseInfoData(
            res.data.data as Record<string, AtlasTile>
          );
          setDataMapFromAPI(res.data.data as Record<string, AtlasTile>);
          setReady(true);
        });
    }
    loadMap();
  }, [atlasCreate, dragMapData]);

  useEffect(() => {
    if (isReady) {
      atlasCreate.parseVisualizeToogle(
        isEnabledTop,
        isEnabledLeft,
        isEnabledTopLeft
      );
    }
  }, [isReady, isEnabledLeft, isEnabledTop, isEnabledTopLeft, atlasCreate]);

  useEffect(() => {
    if (isReady) {
      atlasCreate.parseDragMode(isFreeRectangle);
    }
  }, [isReady, atlasCreate, isFreeRectangle]);

  return (
    <div>
      <div className="col-12">
        <div className="row">
          <div className="titlemap-area col-8 p-0" style={{ height: "100vh" }}>
            {isReady && (
              <>
                {dataMapFromAPI[
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
                      dataMapFromAPI[
                        `${currentPopupData?.x},${currentPopupData?.y}`
                      ]?._id
                    }
                    <div>
                      type:{" "}
                      {
                        COLOR_BY_TYPE[
                          dataMapFromAPI[
                            `${currentPopupData?.x},${currentPopupData?.y}`
                          ]?.type
                        ]?.name
                      }
                    </div>
                  </div>
                )}
                <TileMap
                  className="atlas"
                  layers={[
                    atlasCreate.renderColorAreaLayer,
                    atlasCreate.renderAtlasLayer,
                    atlasCreate.renderHoverLayer,
                    atlasCreate.renderSelectedLayer,
                  ]}
                  onChange={(data) => {
                    setDragMapData(data);
                  }}
                  onHover={(x, y) => {
                    atlasCreate.handleHover(x, y);
                    setCurrentHover({ x, y });
                  }}
                  onClick={atlasCreate.onClickAtlas}
                  onPopup={(arg) => {
                    setCurrentPopupData(arg);
                  }}
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
                    <Button onClick={() => setFreeRectangle(!isFreeRectangle)}>
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
                    {/*
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
                    <Button onClick={() => executeReset()}>Reset all</Button> */}
                  </Space>
                  <Divider orientation="left">Map Interaction</Divider>
                  <Space size={10} wrap>
                    {/* <Button onClick={() => setEnabledDrag(!isEnabledDrag)}>
                      {isEnabledDrag ? <>Disable Drag</> : <>Enable Drag</>}
                    </Button> */}
                  </Space>
                  <Divider orientation="left">Visualize</Divider>
                  <Space size={10} wrap>
                    {/* <Button
                      onClick={() => setEnableColorGrid(!enableColorGrid)}
                    >
                      {enableColorGrid ? (
                        <>Disable Area Color</>
                      ) : (
                        <>Enable Area Color</>
                      )}
                    </Button> */}
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
                    onClick={() => {
                      atlasCreate.saveTiles();
                    }}
                  >
                    Save Map
                  </Button>
                </div>
                <div className="col-6">
                  <Divider orientation="left">Land Types</Divider>
                  <Space size={10} wrap>
                    {/* <Button onClick={() => setLandType("emptyland")}>
                      Set to Empty Land
                    </Button>
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
                    </Button> */}
                  </Space>
                  <Divider orientation="left">Parcel Info</Divider>
                  {isReady && (
                    <div>
                      [{currentHover?.x}, {currentHover?.y}]
                      <div style={{ wordWrap: "break-word" }}>
                        {JSON.stringify(
                          dataMapFromAPI[
                            `${currentHover?.x},${currentHover?.y}`
                          ]
                        )}
                        <div>
                          Land Type:&nbsp;
                          {
                            COLOR_BY_TYPE[
                              dataMapFromAPI[
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
  );
}
