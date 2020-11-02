import moment from "moment";
import "lodash";

/**
 * 観測所種類の番号マップ
 * 観測所タイプシンボル(string): 観測所タイプ(int)
 */
export const TYPES = {
  RAIN: 1,
  WATER: 4,
  DAM: 7
};

export const TYPES_INDEX = {
  1: "RAIN",
  4: "WATER",
  7: "DAM"
};

/**
 * 観測所種類名（漢字）マップ
 * 観測所タイプ(int): 名所(string)
 */
export const TYPE_NAMES = {
  [TYPES.RAIN]: "雨量",
  [TYPES.WATER]: "水位",
  [TYPES.DAM]: "ダム"
};

/**
 * 観測所種類別グラフ要素色マップ
 * 観測所種類別グラフ要素毎に実測、予測の色初期値
 */
export const COLORS = {
  [TYPES.WATER]: {
    levels: {
      MEASURED: "#01163F",
      FORECAST: "#3734dc"
    }
  },
  [TYPES.RAIN]: {
    levels: {
      MEASURED: "#1C344C",
      FORECAST: "#1C344C"
    },
    totals: {
      MEASURED: "#91C46C",
      FORECAST: "#91C46C"
    },
    STRONG: {
      MEASURED: "#1C344C",
      FORECAST: "#1C344C"
    }
  },
  [TYPES.DAM]: {
    levels: {
      MEASURED: "#01163F",
      FORECAST: "#3734dc"
    },
    qinAlls: {
      MEASURED: "#91C46C",
      FORECAST: "#91C46C"
    },
    qoutAlls: {
      MEASURED: "RED",
      FORECAST: "RED"
    }
  }
};

/**
 * 観測所種類別グラフ要素の識別マップ
 */
export const GRAPH_ITEM_NAME = {
  [TYPES.WATER]: Object.keys(COLORS[TYPES.WATER]),
  [TYPES.RAIN]: Object.keys(COLORS[TYPES.RAIN]),
  [TYPES.DAM]: Object.keys(COLORS[TYPES.DAM])
};

/**
 * 入出力日時フォーマット
 */
export const DATE_FORMAT = {
  IN: "YYYYMMDDHHmm",
  OUT: "YYYY/MM/DD HH:mm"
};

/**
 * 観測所種類別要素データの登録キーと取得キーマップ
 */
const LEVEL_LIST = {
  [TYPES.WATER]: [["levels", "value"]],
  [TYPES.RAIN]: [
    ["levels", "min10"],
    ["totals", "total"]
  ],
  [TYPES.DAM]: [
    ["levels", "level"],
    ["qinAlls", "Qin_all"],
    ["qoutAlls", "Qout_all"]
  ]
};

const BORDER_WIDTH = 2;
const DASH_WIDTH = 3;
const BORDER_DASH = [10, 5];

const BASE_SET_LINE = {
  type: "line",
  yAxisID: "level",
  xAxisID: "data",
  unit: "m",
  fill: false,
  borderWidth: BORDER_WIDTH,
  pointBackgroundColor: "white",
  pointRadius: 2,
  pointHitRadius: 0,
  lineTension: 0,
  data: [],
  spanGaps: true
};

/**
 * 観測所種類別グラフ要素基本設定マップ
 */
const DATA_SET_LIST = {
  [TYPES.WATER]: {
    [GRAPH_ITEM_NAME[TYPES.WATER][0]]: Object.assign(
      _.cloneDeep(BASE_SET_LINE),
      { label: "水位" }
    )
  },
  [TYPES.RAIN]: {
    [GRAPH_ITEM_NAME[TYPES.RAIN][0]]: Object.assign(
      _.cloneDeep(BASE_SET_LINE),
      { label: "雨量" }
    ),
    [GRAPH_ITEM_NAME[TYPES.RAIN][1]]: Object.assign(
      _.cloneDeep(BASE_SET_LINE),
      { label: "累計雨量" }
    )
  },
  [TYPES.DAM]: {
    [GRAPH_ITEM_NAME[TYPES.DAM][0]]: Object.assign(_.cloneDeep(BASE_SET_LINE), {
      label: "貯水位"
    }),
    [GRAPH_ITEM_NAME[TYPES.DAM][1]]: Object.assign(_.cloneDeep(BASE_SET_LINE), {
      label: "流入量",
      yAxisID: "qAll",
      unit: "m3/s"
    }),
    [GRAPH_ITEM_NAME[TYPES.DAM][2]]: Object.assign(_.cloneDeep(BASE_SET_LINE), {
      label: "放流量",
      yAxisID: "qAll",
      unit: "m3/s"
    })
  }
};

/**
 * 観測所種類別警告要素線設定のリスト
 */
const ALERT_INFO_LIST = {
  [TYPES.WATER]: {
    standby: {
      color: "#FD7400",
      label: "水防団待機水位"
    },
    warning: {
      color: "#004358",
      label: "氾濫注意水位"
    },
    evacuation: {
      color: "#68920c",
      label: "避難判断水位"
    },
    dangerous: {
      color: "#1F8A70",
      label: "氾濫危険水位"
    },
    outbreak: {
      color: "#000000",
      label: "計画高水位"
    }
  },
  [TYPES.DAM]: {
    normalMin: {
      color: "#FD7400",
      label: "最低水位"
    },
    normalMax: {
      color: "#004358",
      label: "平常時最高貯水位"
    },
    startOper: {
      color: "#68920c",
      label: "異常洪水時防災操作開始水位"
    },
    floodMax: {
      color: "#1F8A70",
      label: "洪水時最高水位"
    },
    preliminaryRelease: {
      color: "#000000",
      label: "予備放流水位"
    },
    floodStorage: {
      color: "#000000",
      label: "洪水貯留準備水位"
    }
  }
};

/**
 * ALERT_NAME_LIST： 観測所種類別警告要素名リスト
 * 例：水位：[TYPES.WATER](4):['standby',・・・,'outbreak']
 *
 * ALERT_LEVEL_LIST： 観測所種類別警告要素登録識別子
 * 例：水位：[TYPES.WATER](4):['standbyLevel',・・・,'outbreakLevel']
 */
const { ALERT_NAME_LIST, ALERT_LEVEL_LIST } = _.transform(
  ALERT_INFO_LIST,
  (buf, items, key) => {
    buf.ALERT_NAME_LIST[key] = _.transform(
      items,
      (list, item, k) => {
        list.push(k);
      },
      []
    );
    buf.ALERT_LEVEL_LIST[key] = _.transform(
      items,
      (list, item, k) => {
        list.push(k + "Level");
      },
      []
    );
  },
  { ALERT_NAME_LIST: {}, ALERT_LEVEL_LIST: {} }
);

// カスタマ対象の初期値
const _CONF = {
  isShowLevels: true,
  isShowForcast: false,
  isShowNowTime: true
};
const _NOT_RAIN_CONF = Object.assign(
  {
    isShowWarningLevel: true,
    isShowLandForm: true,
    canShow36hours: true,
    isShow36hours: false
  },
  _CONF
);
const CONF = {
  [TYPES.RAIN]: Object.assign({ isShowTotal: false }, _CONF),
  [TYPES.WATER]: Object.assign(
    {},
    _NOT_RAIN_CONF,
    _.transform(
      ALERT_LEVEL_LIST[TYPES.WATER],
      (list, name, k) => {
        const key = `isShow${name.slice(0, 1).toUpperCase()}${name.slice(
          -(name.length - 1)
        )}`;
        list[key] = true;
      },
      {}
    )
  ),
  [TYPES.DAM]: Object.assign(
    {
      isShowQinAlls: true,
      isShowQoutAlls: true
    },
    _NOT_RAIN_CONF
  )
};

export class Model {

  constructor(tag, conf) {
    this.debug = conf.debug || false;

    // マスター情報格納
    this.master = tag.master;
    this.id = tag.master.osid;
    this.type = tag.master.type;
    this.name = tag.master.name;
    // 設定情報格納
    this.conf = Object.assign(CONF[this.type], conf || {});
    // 36時間利用しない場合は表示の切替はできないようにする。
    this.conf.isShow36hours = !this.conf.canShow36hours
      ? false
      : this.conf.isShow36hours;

    // 色情報取得
    this.COLORS = Object.assign(
      _.cloneDeep(COLORS[this.type]),
      this.conf["COLOR"] || {}
    );
    // 描画要素名情報取得
    this.LEVEL_NAMES = _.cloneDeep(LEVEL_LIST[this.type]);
    // 描画基本設定取得
    this.DATA_SET = _.cloneDeep(DATA_SET_LIST[this.type]);

    // 観測所種類情報取得
    const typeName = TYPE_NAMES[this.type];
    const levelName = this.type === TYPES.DAM ? "水位" : typeName;

    this.titleName = `【${this.name}】の${levelName}`;

    // 警戒情報取得
    this.ALERT_LEVEL = _.cloneDeep(ALERT_LEVEL_LIST[this.type]);
    this.ALERT_NAME = _.cloneDeep(ALERT_NAME_LIST[this.type]);
    this.ALERT_IINFO = _.cloneDeep(ALERT_INFO_LIST[this.type]);

    // 水位の標高加算
    const zoreHighName = "elevationLevel";
    if (this.type !== TYPES.RAIN && this.master[zoreHighName]) {
      const elevation = Number(this.master[zoreHighName]);
      // 敷居値に標高加算
      this.ALERT_LEVEL.forEach(name => {
        if (this.master[name]) this.master[name] += elevation;
      });
      // 断面データに加算
      if (this.master.landform) {
        this.master.landform = this.master.landform.map(item => {
          item[1] += elevation;
          return item;
        });
      }
      // 測定値に標高加算
      tag.observatory = tag.observatory.map(item => {
        const tag =
          this.type === TYPES.WATER
            ? "value"
            : this.type === TYPES.DAM
            ? "level"
            : "";
        if (!_.isNil(item[tag])) item[tag] += elevation;
        return item;
      });
    }

    // 初期化処理
    this.init(tag);
    this.setData();
    this.setAlertInfos(tag);
    this.setupOption();
    this.setWarningLevelStrokeData();
    this.setWaterBoxData();
    Chart.pluginService.register((this.options.plugin = this.getPlugin()));
  }

  init(tag) {
    // 検索条件設定
    this.searchInfo = {
      type: tag.master.type,
      startTime: tag.startTime,
      baseTime: tag.baseTime,
      endTime: tag.endTime,
      observatory: tag.observatory
    };

    // 基準日時抽出
    this.baseDate = moment.utc(tag.baseTime, DATE_FORMAT.IN);
    this.startTime = this.baseDate.clone().subtract(3, "hours");
    this.endTime = this.baseDate.clone().add(36, "hours");
    this.baseInfo = {
      baseTime: tag.baseTime,
      levelNames: this.LEVEL_NAMES,
      timesBuf: this.getTimes(this.baseDate.diff(this.startTime, "minutes")),
      times36Buf: this.getTimes36(this.endTime.diff(this.startTime, "minutes"))
    };

    // 時系列時刻格納準備
    this.times = Object.keys(this.baseInfo.timesBuf);

    // 横軸データ抽出
    //TODO 36h の切り替え
    this.labels = _.transform(
      this.times,
      (buf, time) => {
        buf.push(
          moment
            .utc(time, DATE_FORMAT.IN)
            .local()
            .format("HH:mm")
        );
      },
      []
    );

    // 描画要素のデータ作成準備
    const data = new ObservatoryData(this.baseInfo, tag.observatory);

    // 描画要素分のデータ作成
    this.LEVEL_NAMES.forEach(keys => {
      const [keepKey] = keys;
      if (keepKey === "totals" && !this.conf.isShowTotals) return;
      if (keepKey === "qinAlls" && !this.conf.isShowQinAlls) return;
      if (keepKey === "qoutAlls" && !this.conf.isShowQoutAlls) return;
      this[keepKey] = data.getLevelsBy(keepKey);
      if (this.conf.canShow36hours)
        this[keepKey + 36] = data.getLevelsBy(keepKey, true);
    });
  }

  setData() {
    this.data = {
      // 横軸
      labels: this.labels,
      // 横データ：表示要素数分生成
      datasets: _.transform(
        this.LEVEL_NAMES,
        (buf, labels) => {
          if (this.isConfKeyOk(labels[0])) {
            buf.push(this.getItemDataSet(labels[0]));
          }
        },
        []
      )
    };
    this.isLevelNoData =
      _.filter(this.data.datasets[0].data, v => {
        return v !== null;
      }).length === 0;
  }

  /**
   * 警戒各基準線設定
   * ・切替可能： isShowWarningLevel
   * @param {json} tag ： 観測所データ
   */
  setAlertInfos(tag) {
    if (this.debug) console.log("ALERT_LEVEL:",this.ALERT_LEVEL)
    // マスター情報格納準備
    this.MASTER_INFO = {};

    if (this.conf.isShowWarningLevel) {
      // マスター：警戒レベル情報など抽出
      this.ALERT_LEVEL.forEach(name => {
        if (!_.isNil(tag.master[name])) {
          this[name] = this.MASTER_INFO[name] = parseFloat(
            tag.master[name]
          ).toFixed(2);
        }
      });

      // 警戒レベル情報構成
      this.MASTER_INFO["ALERT_LEVEL"] = _.transform(
        this.ALERT_IINFO,
        (buf, item, key) => {
          if (this.type === TYPES.WATER) key += "Level";
          buf[key] = Object.assign({ value: this.MASTER_INFO[key] }, item);
        },
        {}
      );
    }

    if(this.debug) console.log("this.MASTER_INFO['ALERT_LEVEL']", this.MASTER_INFO['ALERT_LEVEL'])
  }

  setupOption() {
    this.options = {
      responsive: true,
      maintainAspectRatio: true,
      //aspectRatio: 1,
      title: {
        display: true,
        fontSize: 18,
        fontColor: this.isLevelNoData ? "red" : "black",
        text: this.titleName + (this.isLevelNoData ? "　　※【欠測】" : "")
      },
      layout: { padding: { top: 0, right: 25, bottom: 0, left: -5 } },
      scales: {
        yAxes: this.getYAxes(),
        xAxes: [
          {
            id: "data",
            position: "bottom",
            gridLines: {
              display: true
            },
            ticks: {
              fontColor: "#9a9a9a",
              display: true,
              beginAtZero: true,
              autoSkip: false,
              callback: (tick /*, index, array*/) => {
                const o = moment(tick, "HH:mm");
                return o.minute() % 10 === 0 ? tick : null;
              }
            },
            categoryPercentage: 1.0,
            barPercentage: 1.0
          }
        ]
      },
      legend: { display: false },
      tooltips: {
        enabled: true,
        mode: "index",
        intersect: false,
        callbacks: {
          labelColor: function(tooltipItem, chart) {
            const dataset =
              chart.config.data.datasets[tooltipItem.datasetIndex];
            return {
              backgroundColor: dataset.backgroundColor
            };
          },
          label: function(tooltipItem, data) {
            const dataset = data.datasets[tooltipItem.datasetIndex];
            const label = dataset.label;
            const unit = dataset.unit;
            const value = parseFloat(dataset.data[tooltipItem.index]).toFixed(
              2
            );
            return `${label} : ${value} ${unit}`;
          }
        }
      },
      hover: {
        mode: "index",
        intersect: false
      },
      landform: this.getLandFormData(),
      annotation: {
        events: ["click", "dblclick", "mouseover", "mouseout"],
        annotations: [
          {
            type: "box",
            drawTime: "beforeDatasetsDraw",
            yScaleID: "level",
            borderColor: "rgba(0,0,0,0)",
            yMin: 0,
            yMax: 0,
            backgroundColor: "#3D8AFF"
          },
          // 指定時刻表示/非表示の切替
          this.conf.isShowNowTime
            ? {
                type: "line",
                mode: "vertical",
                scaleID: "data",
                value: this.baseDate.local().format("HH:mm"),
                borderColor: "#FF0000",
                backgroundColor: "#3D8AFF",
                borderWidth: 1.5,
                display: false,
                label: {
                  content: "指定",
                  position: "top",
                  enabled: true
                }
              }
            : {}
        ]
      }
    };

    this.setYAxesLimitData();
  }

  getYAxes() {
    const yAxes = [
      {
        id: "level",
        gridLines: { display: true },
        // scaleLabel: {
        //   display: true,
        //   labelString: "T.P.",
        //   lineHeight: 1.5,
        //   fontSize: 18,
        //   fontColor: "darkorange"
        // },
        ticks: {
          max: 5,
          min: 0,
          callback: (label /*, index, labels*/) => {
            //return ("　　　　　" + parseFloat(label).toFixed(1)).slice(-6);
            return parseFloat(label).toFixed(1);
          }
        }
      }
    ];

    if (this.conf.isShowQinAlls || this.conf.isShowQoutAlls) {
      yAxes.push({
        id: "qAll",
        position: "right",
        type: "linear",
        ticks: {
          reverse: false,
          min: 0,
          max: 30,
          stepSize: 0.5,
          beginAtZero: false
        },
        gridLines: {
          display: false
        }
      });
    }

    return yAxes;
  }

  isConfKeyOk(name) {
    return this.conf[
      `isShow${name.slice(0, 1).toUpperCase()}${name.slice(-(name.length - 1))}`
    ];
  }

  setOptionTo(opt) {
    this.checkOptionItem(opt, "title.text");
    this.checkOptionItem(opt, "title.fontColor");
    this.checkOptionItem(opt, "annotation.annotations");
    this.checkOptionItem(opt, "landform");
    this.checkOptionItem(opt, "scales.xAxes");
    this.checkOptionItem(opt, "scales.yAxes");
    opt.plugin = this.getPlugin();
  }

  setDebug(debug) {
    this.debug = debug;
  }

  checkOptionItem(option, name) {
    const org = _.get(this.options, name);
    const opt = _.get(option, name);
    // 対象要素の参照を取得
    const getTag = name => {
      const names = name.split(".");
      if (names.length === 1) {
        return [option, name];
      } else {
        let laset = null;
        let tag = option;
        names.forEach(str => {
          if (laset) tag = tag[laset];
          laset = str;
        });
        return [tag, laset];
      }
    };

    if (_.isNil(org)) {
      const [tag, key] = getTag(name);
      delete tag[key];
      return;
    }

    if (org != opt) {
      const [tag, key] = getTag(name);
      tag[key] = org;
    }
  }

  // 警戒各基準線設定
  setWarningLevelStrokeData() {
    if (!this.conf.isShowWarningLevel) return;
    _.forEach(this.MASTER_INFO["ALERT_LEVEL"], (info /*, key*/) => {
      if (!info.value || info.value === -1) return;
      this.options.annotation.annotations.push({
        type: "line",
        mode: "horizontal",
        scaleID: "level",
        value: info.value,
        borderColor: info.color,
        borderWidth: 0.8,
        label: {
          backgroundColor: "rgba(0,0,0,0)",
          yAdjust: -6,
          fontSize: 10,
          fontColor: "black",
          position: "right",
          content: `${info.label} ${info.value}m`,
          enabled: true
        }
      });
    });
  }

  // 水深エリア設定
  setWaterBoxData() {
    const baseDateIndex = this.times.indexOf(this.searchInfo.baseTime);
    const pastData = this.levels.slice(0, baseDateIndex);
    const blueAreaY = _.findLast(pastData, level => {
      return level !== null;
    });

    const blueAreaYMax = blueAreaY || this.options.scales.yAxes[0].ticks.min;
    this.options.annotation.annotations[0].yMax = blueAreaYMax;

    if (blueAreaYMax) {
      this.options.annotation.annotations[0].yMin = this.options.scales.yAxes[0].ticks.min;
    }
  }

  /**
   * 断面図設定：
   * ・切替可能： isShowLandForm
   */
  getLandFormData() {
    return this.conf.isShowLandForm && !_.isNil(this.master["landform"])
      ? this.master["landform"]
      : [];
  }

  setYAxesLimitData() {
    const levelMin = parseFloat(_.min(this.levels));
    const levelMax = parseFloat(_.max(this.levels));
    const ticks = this.options.scales.yAxes[0].ticks;
    const landform = this.options.landform;

    if (landform.length > 0) {
      const landformYMin = _.minBy(landform, o => {
        return o[1];
      });
      if (landformYMin) {
        const min = landformYMin[1] < levelMin ? landformYMin[1] : levelMin;
        this.options.annotation.annotations[1].yMin = ticks.min = min - 0.5;
      }

      const landformYMax = _.maxBy(landform, o => {
        return o[1];
      });
      if (landformYMax) {
        const max = landformYMax[1] > levelMax ? landformYMax[1] : levelMax;
        ticks.max = max + 1;
      }
    } else {
      ticks.min = levelMin - 1;
      ticks.max = levelMax + 5;
    }

    // 右のY軸設定
    if (this.qoutAlls || this.qoutAlls) {
      const gBuff = _.concat(
        [0],
        this.conf.isShowQinAlls && this.qinAlls ? this.qinAlls : [],
        this.conf.isShowQoutAlls && this.qoutAlls ? this.qoutAlls : []
      );

      const qMax = Number(
        _.maxBy(gBuff, v => {
          return parseInt(v);
        })
      );
      if (qMax > this.options.scales.yAxes[1].ticks.max)
        this.options.scales.yAxes[1].ticks.max = qMax + 1;
    }
  }

  getTimes(diff) {
    if (!this.conf.canShow36hours) {
      if (!diff) return null;
      return _.transform(
        this.searchInfo.observatory,
        (buf, item) => {
          buf[item.time] = {};
        },
        {}
      );
    }
    return _.transform(
      Array(diff + 1),
      (buf, v, i) => {
        const key = this.startTime
          .clone()
          .add(i, "minutes")
          .format(DATE_FORMAT.IN);
        buf[Number(key)] = {};
      },
      {}
    );
  }

  getTimes36(diff) {
    return this.getTimes(diff);
  }

  /**
   * get a Cheart dataset
   * @param {String} name ： 描画対象の名称
   * @param {Object} conf ： datasetの追加指定(書換有効)
   */
  getItemDataSet(name, conf) {
    const isForcast = this.conf.isShowForcast;
    const COLORS = this.COLORS[name];
    // 描画要素色設定
    const color = !isForcast ? COLORS.MEASURED : COLORS.FORECAST;
    // 描画要素線種類設定
    const option = !isForcast
      ? {}
      : {
          pointRadius: 0,
          borderDash: BORDER_DASH,
          borderWidth: DASH_WIDTH
        };

    const dataSet = Object.assign(
      Object.assign({}, this.DATA_SET[name]),
      {
        borderColor: color,
        backgroundColor: color,
        pointBorderColor: color,
        data: this.conf.isShow36hours ? this[name + 36] : this[name]
      },
      option,
      conf || {}
    );
    return dataSet;
  }

  getBaseIndex() {
    return this.times.indexOf(this.searchInfo.baseTime);
  }

  getPlugin() {
    return [
      {
        id: "horizontalLine",
        beforeDatasetsDraw: chart => {
          const landform = chart.config.options.landform;
          const xAxe = chart.scales[chart.config.options.scales.xAxes[0].id];
          const yAxe = chart.scales[chart.config.options.scales.yAxes[0].id];
          const ctx = chart.chart.ctx;
          if (landform.length > 0) {

            const minGround = _.minBy(landform, o => {
              return o[0];
            });
            const maxGround = _.maxBy(landform, o => {
              return o[0];
            });

            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.moveTo(xAxe.left, yAxe.bottom);
            for (let i = 0; i < landform.length; i++) {
              let x = landform[i][0] - minGround[0];
              x = (x / (maxGround[0] - minGround[0])) * xAxe.width + xAxe.left;

              let y = yAxe.max - yAxe.min - (landform[i][1] - yAxe.min);
              y = (y / (yAxe.max - yAxe.min)) * yAxe.height + yAxe.top;

              ctx.lineTo(x, y);
            }

            ctx.lineTo(xAxe.right, yAxe.bottom);
            ctx.lineTo(xAxe.left, yAxe.bottom);
            ctx.closePath();
            ctx.fillStyle = "#f1eeea";
            ctx.fill();
          }

          // Y.title
          ctx.font = "normal 14px Arial, meiryo, sans-serif" ;
          ctx.fillStyle = "rgb(0, 0, 0)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const text = ctx.measureText( "T.P." );
          ctx.fillText(
            "T.P.",
            xAxe.left,
            yAxe.top - text.actualBoundingBoxDescent - text.actualBoundingBoxAscent
          );
        }
      },
    ];
  }

  getConfig() {
    return {
      type: "line",
      data: this.data,
      options: Object.assign(this.options, { plugins: this.getPlugin() })
    };
  }
}

class ObservatoryData {
  constructor(ctrl, items) {
    this.ctrl = ctrl;
    this.baseTime = ctrl.baseTime;
    this.levelNames = ctrl.levelNames;

    this.values = _.cloneDeep(ctrl.timesBuf);
    this.baseIndex = this.getBaseIndex(ctrl.timesBuf);

    this.values36 = _.cloneDeep(ctrl.times36Buf);
    this.base36Index = this.getBaseIndex(ctrl.times36Buf);
    this.setUpResult(items);

    this.past = null;
    this.futuret = null;
  }

  getBaseIndex(tag) {
    return _.findLastIndex(_.keys(tag), (key, i) => {
      return Number(key) === this.baseTime;
    });
  }

  setUpResult(items) {
    items.forEach(item => {
      this.values[item.time] = item;
      this.values36[item.time] = item;
    });

    this.levelNames.forEach(keys => {
      const [keepKey, getKey] = keys;
      this[keepKey] = {
        [keepKey]: this.getValuesBy(getKey),
        [keepKey + 36]: this.getValues36By(getKey)
      };
    });
  }

  /**
   * ※ 内部メソッドです。
   * 観測所描画要素の時系列データを
   * 取り出す機能を提供
   * @param {string} name ： 時系列要素名
   */
  getValues36By(name) {
    return this.getValuesBy(name, true);
  }

  /**
   * ※ 内部メソッドです。
   * 観測所描画要素の時系列データを
   * 取り出す機能を提供
   * @param {string} name ： 時系列要素名
   */
  getValuesBy(name, is36) {
    return _.transform(
      is36 ? this.values36 : this.values,
      (buf, item) => {
        buf.push(_.isNil(item[name]) ? null : item[name]);
      },
      []
    );
  }

  getLevelsBy(name, is36) {
    if (this[name]) return this[name][is36 ? name + 36 : name];
    return null;
  }

  hasForcast() {
    return this.values.length > this.baseIndex + 1;
  }

  setBaseIndex(index) {
    this.baseIndex = index;
    this.past = _.fill(_.cloneDeep(this.values), null, this.baseIndex + 1);
    const futuret = _.fill(_.cloneDeep(this.values), null, 0, this.baseIndex);
    const addCnt = index + 1 - this.past.length - futuret.length;
    if (addCnt > 0) {
      this.futuret = _.concat(futuret, _.fill(Array(addCnt), null));
    }
  }
}
