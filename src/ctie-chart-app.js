import moment from "moment";
import "lodash";
//console.log("CtieChartApp.._", _.cloneDeep)

import { PolymerElement, html } from '../node_modules/@polymer/polymer/polymer-element.js';
import {CtieChart} from './ctie-chart.js';

import {TYPES, TYPES_INDEX} from "./Model.js"
import {Adapter} from "./Adapter.js";
//console.log("CtieChartApp.Model, Adapter", TYPES, Adapter)


const SERVICE = 'https://data.riskma.net';
const PARAM_LIST = {
  'PARAMS':['observatory', 'date', 'type'],
  'CONFIG':['apiKey', 'debug', 'height', 'aspectRatio']
};


class CtieChartApp extends PolymerElement {

  static get template() {
    return html`
      <style>
      .container {
        display: flex;
        flex: 1;
        background: #fff;
        background: #fff;
        flex-direction: column;
      }
      .content {
        flex: auto;
        background: white;
        align-items: center;
        justify-content: space-around;
        padding-left: 15px;
        padding-top: 15px;
      }
    </style>
    <div class="container">
      <div class="content">
        <ctie-chart id="ctieChart"></ctie-chart>
      </div>
    </div>`;
  }

  static get is() {
    return 'ctie-chart-app';
  }

  static get properties() {
    return {
    debug: {
      type: String,
      observer: 'debugChanged'
    },

    "api-Key": {
      type: String,
      observer: 'apiKeyChanged'
    },

    observatory: {
      type: String,
      observer: 'observatoryChanged'
    },

    type: {
      type: Number,
      observer: 'typeChanged'
    },

    height: {
      type: Number,
      observer: 'heightChanged'
    },

    "aspect-ratio": {
      type: Number,
      observer: 'spectRatioChanged'
    }

  }}

  constructor() {
    super();
    // 初期設定取得(this.params、this.conf)を作成
    this.params = {};
    this.conf = {
      /*COLOR:{
        levels:{
          MEASURED: 'red'
        }
      },*/
      isShowNowTime: false,
      debug: this.debug,
      //chertBackgroundColor: "#e2e6b0",
    };

  }
  
  // ready() {
  //   super.ready();
  // }

  async connectedCallback(){
    super.connectedCallback();

    this.TYPES = TYPES;//(await import("./Model.js")).TYPES;
    this.ctieChart = this.$.ctieChart
    this.Adapter = Adapter; //(await import("./Adapter.js")).Adapter;

    // 表示対象設定監視
    PARAM_LIST.PARAMS.forEach((name)=>{
      const v = this.getAttr(name);
      if (v!==null) this.params[name] = (name==='type')? Number(v) : v
    });
    this.addEventListener("paramChanged" , (e) => {
      // 表示対象の切り替えなど
      console.log(e.type, e.detail)
    });

    // 表示条件設定監視
    PARAM_LIST.CONFIG.forEach((name)=>{
      const v = this.getAttr(name);
      if (v!==null) this.conf[name] = (name==='debug')?  Boolean(v) : v
    });
    this.addEventListener("configChanged" , (e) => {
      // 描画設定変更、画面再表示
      console.log(e.type, e.detail)
    });
    // グラフ初期化
    await this.setUpChart()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(CtieChartApp.is, "attributeChangedCallback : ", name, oldValue, newValue)
  }

  async setUpChart(changName) {
    if (!this.setUpAdapter()) return
    if (!this.params['observatory'] || !this.params['type'] ) {
      this.popupEvent('status', 'グラフ作成に必要な属性は設定されていません。グラフ表示中断されます。')
      return
    }

    if (!this.params['date']) this.params['date'] = moment().utc().format('YYYYMMDDHHmm')
    const canvas = this.ctieChart.querySelector('canvas')
    if (changName==='height') {
      if (this.conf.height) {
        canvas.setAttribute('height', this.height)
        return;
      }
    } else if (changName==='aspectRatio') {
      if (this.conf.aspectRatio) {
        this.ctieChart.setAspectRatio(this.aspectRatio)
        return;
      }
    }

    if (!TYPES_INDEX[this.params['type']]) {
      throw new Error(`観測所種類不正！ type:${this.params['type']}`)
    }

    this.popupEvent('status', 'checked attributes')

    try {
      const startTime = moment()
      this.popupEvent('status', 'グラフ表示用データ取得開始：0 ミリ秒')
      const data = await (this.adapter).getChartData(
        this.params['type'],
        {
          dateTime: this.params['date'],
          id: this.params['observatory']
        }
      ).catch(e => {throw e});

      this.popupEvent('status', 'グラフ表示用データ取得終了：' + moment().diff(startTime, "milliseconds")+' ミリ秒')

      await this.ctieChart.setModel(data, this.conf);
      this.popupEvent('status', 'グラフ表示まで：' + moment().diff(startTime, "milliseconds")+' ミリ秒')

      if (this.height) {
        canvas.setAttribute('height', this.height)
      }

    } catch (error) {
      if (this.debug) console.log(error);
      throw error
    }
    this.popupEvent('painted', 'OK')

  }

  // ready() {
  //   super.ready();
  //   console.log(CtieChartApp.is, " ready", moment)
  // }

  confChanged(newValue, oldValue){
    this.popupEvent('conf', newValue)
    this.$.ctieChart.setAttribute('conf', newValue)
    this.conf = newValue
  }

  debugChanged(newValue, oldValue){this.changedEvent('debug', newValue, oldValue)}
  apiKeyChanged(newValue, oldValue){this.changedEvent('apiKey', newValue, oldValue)}
  observatoryChanged(newValue, oldValue){this.changedEvent('observatory', newValue, oldValue)}
  typeChanged(newValue, oldValue){this.changedEvent('type', newValue, oldValue)}
  heightChanged(newValue, oldValue){this.changedEvent('height', newValue, oldValue)}
  spectRatioChanged(newValue, oldValue){this.changedEvent('aspectRatio', newValue, oldValue)}

  changedEvent(name, newValue, oldValue){
    if (PARAM_LIST.PARAMS.includes(name)) {
      if (_.isNil(newValue)) {
        if (this.params[name]) delete this.params[name]
      } else {
        this.params[name] = newValue
      }
      this.dispatchEvent(new CustomEvent('paramChanged', {
        detail: {
          name: name,
          newValue: newValue,
          oldValue: oldValue
        }
      }));
    }

    if (PARAM_LIST.CONFIG.includes(name)) {
      if (_.isNil(newValue)) {
        if (this.conf[name]) delete this.conf[name]
      } else {
        this.conf[name] = newValue
      }
      this.dispatchEvent(new CustomEvent('configChanged', {
        detail: {
          name: name,
          newValue: newValue,
          oldValue: oldValue
        }
      }));
    }

  }

  popupEvent(name, status){
console.log('ctie-chart-app.popupEvent:', name, status)
    this.dispatchEvent(new CustomEvent(name, {
      detail: {[name]: status}
    }));
  }


  setUpAdapter() {
    this.conf.apiKey = this.getAttr('api-key');
    if (_.isNil(this.conf.apiKey)) {
      this.popupEvent('error', 'error at connect to data service by no apiKey')
      return false
    }

    if (this.adapter) return true

    try {
      this.adapter = new this.Adapter(SERVICE, this.conf.apiKey);
    } catch (error) {
      if (this.debug) console.log(error);
      this.popupEvent('error', 'error at connect to data service['+ error.message +']')
      return false
    }
    this.popupEvent('status', 'data service is connected')
    return true
  }

  getAttr(name) {
    return this.hasAttribute(name)? this.getAttribute(name) : null
  }



}

customElements.define(CtieChartApp.is, CtieChartApp);

