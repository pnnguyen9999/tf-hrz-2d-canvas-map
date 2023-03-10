import axios from "axios";
import { Layer } from "components";
import { API_ENDPOINT, API_VIEWING_ENDPOINT } from "constant/api";
import { toast } from "react-toastify";
import axiosService from "services/axiosService";
import _ from "lodash";

export const COLOR_BY_TYPE = Object.freeze({
  "62cbd8345b2984b84bdb6673": {
    color: "#41A9ED",
    name: "User",
  }, // User
  "62cbd8395b2984b84bdb6679": {
    color: "#33398F",
    name: "Partner",
  }, // Partner
  "62cbd8425b2984b84bdb667f": {
    color: "#E89633",
    name: "Horizon Land",
  }, // Horizon
  "62cbd8465b2984b84bdb6685": {
    color: "#595B7C",
    name: "Sea",
  }, // Sea
  "62cbd84d5b2984b84bdb668b": {
    color: "#B3B3B3",
    name: "EmptyLand",
  }, // parcels/estates where I have permissions
});

export type AtlasTile = {
  x: number;
  y: number;
  type: number;
  estate_id: number;
  left: number;
  top: number;
  topLeft: number;
};

interface BasicCoord {
  x: number;
  y: number;
}

export class Atlas {
  public atlasData = {};
  public dataSave = {};
  private isEnabledTop: boolean;
  private isEnabledLeft: boolean;
  private isEnabledTopLeft: boolean;
  private isFreeRectangle: boolean;
  private isEnableColorGrid: boolean;
  private currentHover: BasicCoord;
  private firstPos: BasicCoord;
  private lastPos: BasicCoord;
  private selectedArea: BasicCoord[];

  //   constructor() {
  //     this.dataSave = [];
  //   }

  public parseInfoData = (_atlasData) => {
    // const check =
    //   _.findIndex(Object.assign(this.atlasData), (o) => {
    //     return _.isMatch(o, Object.assign(_atlasData));
    //   }) > -1;
    // console.log(check);
    this.atlasData = { ..._atlasData, ...this.atlasData };
  };

  public parseVisualizeToogle = (
    _isEnabledTop,
    _isEnabledLeft,
    _isEnabledTopLeft,
    _isEnableColorGrid
  ) => {
    this.isEnabledTop = _isEnabledTop;
    this.isEnabledLeft = _isEnabledLeft;
    this.isEnabledTopLeft = _isEnabledTopLeft;
    this.isEnableColorGrid = _isEnableColorGrid;
  };

  public parseDragMode = (_isFreeRectangle) => {
    this.isFreeRectangle = _isFreeRectangle;
  };

  public returnAtlasData = () => this.atlasData;

  public handleHover: any = (x, y) => {
    // console.log({ x, y });
    this.currentHover = {
      x,
      y,
    };
  };

  public onClickAtlas: any = (x, y) => {
    if (
      typeof this.firstPos?.x !== "undefined" &&
      typeof this.firstPos?.y !== "undefined" &&
      typeof this.lastPos?.x !== "undefined" &&
      typeof this.lastPos?.y !== "undefined"
    ) {
      this.firstPos = null;
      this.lastPos = null;
      /* remove selected area if we have first & last position */
      this.processSelectedParcel();
    } else {
      if (
        typeof this.firstPos?.x !== "undefined" &&
        typeof this.firstPos?.y !== "undefined"
      ) {
        if (this.isValidSquare()) {
          this.lastPos = {
            x,
            y,
          };
          this.processSelectedParcel();
        } else {
          this.firstPos = null;
          this.lastPos = null;
        }
      } else {
        this.firstPos = {
          x,
          y,
        };
      }
    }
  };

  private processSelectedParcel = () => {
    let xMin = Math.min(this.firstPos?.x, this.lastPos?.x);
    let xMax = Math.max(this.firstPos?.x, this.lastPos?.x);
    let yMin = Math.min(this.firstPos?.y, this.lastPos?.y);
    let yMax = Math.max(this.firstPos?.y, this.lastPos?.y);
    const startPointX = xMin;
    const startPointY = yMin;
    this.selectedArea = [];
    for (let i = 0; i < xMax - xMin + 1; i++) {
      for (let j = 0; j < yMax - yMin + 1; j++) {
        this.selectedArea.push({ x: startPointX + i, y: startPointY + j });
      }
    }
  };

  private isSelectedGroup = (x: number, y: number) =>
    this.selectedArea?.some((coord) => coord.x === x && coord.y === y);

  private isValidSquare = () => {
    if (!this.currentHover) return false;
    if (!this.isFreeRectangle) {
      if (
        typeof this.firstPos?.x !== "undefined" &&
        typeof this.firstPos?.y !== "undefined" &&
        !(
          typeof this.lastPos?.x !== "undefined" &&
          typeof this.lastPos?.y !== "undefined"
        )
      ) {
        let xMin = Math.min(this.firstPos?.x, this.currentHover?.x);
        let xMax = Math.max(this.firstPos?.x, this.currentHover?.x);
        let yMin = Math.min(this.firstPos?.y, this.currentHover?.y);
        let yMax = Math.max(this.firstPos?.y, this.currentHover?.y);
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
  private isHighlighted = (x: number, y: number) => {
    if (!this.currentHover) return false;

    if (
      typeof this.firstPos?.x !== "undefined" &&
      typeof this.firstPos?.y !== "undefined" &&
      !(
        typeof this.lastPos?.x !== "undefined" &&
        typeof this.lastPos?.y !== "undefined"
      )
    ) {
      let xMin = Math.min(this.firstPos?.x, this.currentHover.x);
      let xMax = Math.max(this.firstPos?.x, this.currentHover.x);
      let yMin = Math.min(this.firstPos?.y, this.currentHover.y);
      let yMax = Math.max(this.firstPos?.y, this.currentHover.y);
      return (
        /**
         * @rotateAroundAxis -> x > 0, y > 0
         */
        (xMin <= x &&
          x <= this.currentHover.x &&
          yMin <= y &&
          y <= this.currentHover.y) ||
        /**
         * @rotateAroundAxis -> x > 0, y < 0
         */
        (xMin <= x &&
          x <= this.currentHover.x &&
          yMax >= y &&
          y >= this.currentHover.y) ||
        /**
         * @rotateAroundAxis -> x < 0, y > 0
         */
        (xMax >= x &&
          x >= this.currentHover.x &&
          yMin <= y &&
          y <= this.currentHover.y) ||
        /**
         * @rotateAroundAxis -> x < 0, y < 0
         */
        (xMax >= x &&
          x >= this.currentHover.x &&
          yMax >= y &&
          y >= this.currentHover.y)
      );
    } else {
      return this.currentHover.x === x && this.currentHover.y === y;
    }
  };

  public renderAtlasLayer: Layer = (x, y) => {
    const id = x + "," + y;
    if (this.atlasData !== null && id in this.atlasData) {
      const tile = this.atlasData[id];
      const color = this.atlasData[id]?.type
        ? COLOR_BY_TYPE[tile?.type]?.color
        : COLOR_BY_TYPE[12];

      const top = this.isEnabledTop && !!tile.top;
      const left = this.isEnabledLeft && !!tile.left;
      const topLeft = this.isEnabledTopLeft && !!tile.topLeft;
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

  public renderHoverLayer: Layer = (x, y) => {
    if (this.isHighlighted(x, y)) {
      return {
        color: this.isValidSquare() ? "#8A8DD4" : "#ff2200",
        scale: 1,
      };
    }
    return null;
  };

  public renderSelectedLayer: Layer = (x, y) => {
    /**
     * draw a selected group
     */
    if (this.isSelectedGroup(x, y)) {
      return {
        color: "#212356",
        scale: 1,
      };
    }
    //     /**
    //      * draw 2 points firstPos & lastPos
    //      */
    if (
      (this.firstPos?.x === x && this.firstPos?.y === y) ||
      (this.lastPos?.x === x && this.lastPos?.y === y)
    ) {
      return {
        color: "#8A8DD4",
        scale: 1,
      };
    }
    return null;
  };

  public renderColorAreaLayer: Layer = (x, y) => {
    if (this.isEnableColorGrid) {
      return {
        scale: 1.2,
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
        scale: 1,
        color: (x + y) % 2 === 0 ? COLOR_BY_TYPE[12] : COLOR_BY_TYPE[13],
      };
    }
  };

  public executeMerge = (): void => {
    let checkTop;
    let checkLeft;
    let checkTopLeft;
    for (let i = 0; i < this.selectedArea.length; i++) {
      const id = this.selectedArea[i].x + "," + this.selectedArea[i].y;

      checkTop = this.selectedArea.find(
        (e) =>
          e.x === this.selectedArea[i].x && e.y === this.selectedArea[i].y + 1
      );
      checkLeft = this.selectedArea.find(
        (e) =>
          e.x === this.selectedArea[i].x - 1 && e.y === this.selectedArea[i].y
      );
      checkTopLeft = this.selectedArea.find(
        (e) =>
          e.x === this.selectedArea[i].x - 1 &&
          e.y === this.selectedArea[i].y + 1
      );

      const obj = {
        type: this.atlasData[id].type || "62cbd84d5b2984b84bdb668b",
        x: this.selectedArea[i].x,
        y: this.selectedArea[i].y,
        top: !!checkTop,
        left: !!checkLeft,
        topLeft: !!checkTopLeft,
      };
      this.dataSave[id] = {
        ...this.dataSave[id],
        ...obj,
      };
      this.atlasData[id] = {
        ...this.atlasData[id],
        ...obj,
      };
    }
  };

  public executeCreateGrid = (): void => {
    for (let i = 0; i < this.selectedArea.length; i++) {
      const id = this.selectedArea[i].x + "," + this.selectedArea[i].y;
      const obj = {
        type: this.atlasData[id].type || "62cbd84d5b2984b84bdb668b",
        x: this.selectedArea[i].x,
        y: this.selectedArea[i].y,
        top: 0,
        left: 0,
        topLeft: 0,
      };
      this.dataSave[id] = {
        ...this.dataSave[id],
        ...obj,
      };
      this.atlasData[id] = {
        ...this.atlasData[id],
        ...obj,
      };
    }
  };

  public executeConnectAll = (): void => {
    for (let i = 0; i < this.selectedArea.length; i++) {
      const id = this.selectedArea[i].x + "," + this.selectedArea[i].y;
      const obj = {
        type: this.atlasData[id].type || "62cbd84d5b2984b84bdb668b",
        x: this.selectedArea[i].x,
        y: this.selectedArea[i].y,
        top: 1,
        left: 1,
        topLeft: 1,
      };
      this.dataSave[id] = {
        ...this.dataSave[id],
        ...obj,
      };
      this.atlasData[id] = {
        ...this.atlasData[id],
        ...obj,
      };
    }
  };

  public executeConnectTop = (): void => {
    for (let i = 0; i < this.selectedArea.length; i++) {
      const id = this.selectedArea[i].x + "," + this.selectedArea[i].y;
      const obj = {
        type: this.atlasData[id].type || "62cbd84d5b2984b84bdb668b",
        x: this.selectedArea[i].x,
        y: this.selectedArea[i].y,
        top: 1,
        left: 0,
        topLeft: 0,
      };
      this.dataSave[id] = {
        ...this.dataSave[id],
        ...obj,
      };
      this.atlasData[id] = {
        ...this.atlasData[id],
        ...obj,
      };
    }
  };

  public executeConnectLeft = (): void => {
    for (let i = 0; i < this.selectedArea.length; i++) {
      const id = this.selectedArea[i].x + "," + this.selectedArea[i].y;
      const obj = {
        type: this.atlasData[id].type || "62cbd84d5b2984b84bdb668b",
        x: this.selectedArea[i].x,
        y: this.selectedArea[i].y,
        top: 0,
        left: 1,
        topLeft: 0,
      };
      this.dataSave[id] = {
        ...this.dataSave[id],
        ...obj,
      };
      this.atlasData[id] = {
        ...this.atlasData[id],
        ...obj,
      };
    }
  };

  public executeConnectTopLeftOnly = (): void => {
    for (let i = 0; i < this.selectedArea.length; i++) {
      const id = this.selectedArea[i].x + "," + this.selectedArea[i].y;
      const obj = {
        type: this.atlasData[id].type || "62cbd84d5b2984b84bdb668b",
        x: this.selectedArea[i].x,
        y: this.selectedArea[i].y,
        top: 1,
        left: 1,
        topLeft: 0,
      };
      this.dataSave[id] = {
        ...this.dataSave[id],
        ...obj,
      };
      this.atlasData[id] = {
        ...this.atlasData[id],
        ...obj,
      };
    }
  };

  public setLandType = (type: string) => {
    switch (type) {
      case "user": {
        for (let i = 0; i < this.selectedArea.length; i++) {
          const id = this.selectedArea[i].x + "," + this.selectedArea[i].y;
          this.atlasData[id] = {
            ...this.atlasData[id],
            type: "62cbd8345b2984b84bdb6673",
          };
          this.dataSave[id] = {
            ...this.atlasData[id],
            type: "62cbd8345b2984b84bdb6673",
          };
        }
        break;
      }
      case "partner": {
        for (let i = 0; i < this.selectedArea.length; i++) {
          const id = this.selectedArea[i].x + "," + this.selectedArea[i].y;
          this.atlasData[id] = {
            ...this.atlasData[id],
            type: "62cbd8395b2984b84bdb6679",
          };
          this.dataSave[id] = {
            ...this.atlasData[id],
            type: "62cbd8395b2984b84bdb6679",
          };
        }
        break;
      }
      case "horizon": {
        for (let i = 0; i < this.selectedArea.length; i++) {
          const id = this.selectedArea[i].x + "," + this.selectedArea[i].y;
          this.atlasData[id] = {
            ...this.atlasData[id],
            type: "62cbd8425b2984b84bdb667f",
          };
          this.dataSave[id] = {
            ...this.atlasData[id],
            type: "62cbd8425b2984b84bdb667f",
          };
        }
        break;
      }
      case "sea": {
        for (let i = 0; i < this.selectedArea.length; i++) {
          const id = this.selectedArea[i].x + "," + this.selectedArea[i].y;
          this.atlasData[id] = {
            ...this.atlasData[id],
            type: "62cbd8465b2984b84bdb6685",
          };
          this.dataSave[id] = {
            ...this.atlasData[id],
            type: "62cbd8465b2984b84bdb6685",
          };
        }
        break;
      }
      default:
      case "emptyland": {
        for (let i = 0; i < this.selectedArea.length; i++) {
          const id = this.selectedArea[i].x + "," + this.selectedArea[i].y;
          this.atlasData[id] = {
            ...this.atlasData[id],
            type: "62cbd84d5b2984b84bdb668b",
          };
          this.dataSave[id] = {
            ...this.atlasData[id],
            type: "62cbd84d5b2984b84bdb668b",
          };
        }
        break;
      }
    }
  };

  public async saveTiles() {
    let that = this;
    let dataProcess = { ...this.dataSave };
    let dataSend = {
      data: this.dataSave,
    };
    async function asyncGetRightLand() {
      let dataArray: any = Object.entries(dataProcess);
      let xArr = [];
      let yArr = [];
      for (const data of dataArray) {
        xArr.push(data[1].x);
        yArr.push(data[1].y);
      }
      const xMin = _.min(xArr);
      const xMax = _.max(xArr);
      const yMin = _.min(yArr);
      const yMax = _.max(yArr);
      console.log({ xMin, yMin, xMax, yMax });
      await axios
        .get(
          `${API_VIEWING_ENDPOINT}/lands?start=${xMin},${yMax}&end=${xMax},${yMin}`
        )
        .then(async (res: any) => {
          that.atlasData = { ...that.atlasData, ...res.data.data };
        });
    }

    await axiosService
      .post(`${API_ENDPOINT}/lands`, dataSend)
      .then(async (res: any) => {
        if (res.data.status) {
          toast.info(res.data.message);
          this.dataSave = {};
        } else {
          this.dataSave = {};
          await asyncGetRightLand();
          toast.error(res.data.message);
        }
      });
  }
}
