import moment from "moment";
import "lodash";

import { PolymerElement, html } from '../node_modules/@polymer/polymer/polymer-element.js';
import {CtieChart} from './ctie-chart.js';

import {TYPES, TYPES_INDEX} from "./Model.js"
import {Adapter} from "./Adapter.js";


const SERVICE = 'https://data.riskma.net';
const PARAM_LIST = {
  'PARAMS':['observatory', 'date', 'type'],
  'CONFIG':['apiKey', 'debug', 'height', 'aspectRatio']
};
const CONFIG_MAP = {
  apiKey: 'api-key',
  aspectRatio: 'aspect-ratio'
};
const CONFIG_INDEX = {
  'api-key': 'apiKey',
  'aspect-ratio': 'aspectRatio'
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
      //observer: 'debugChanged'
    },

    "api-Key": {
      type: String,
      //observer: 'apiKeyChanged'
    },

    observatory: {
      type: String,
      //observer: 'observatoryChanged'
    },

    type: {
      type: Number,
      //observer: 'typeChanged'
    },

    height: {
      type: Number,
      //observer: 'heightChanged'
    },

    "aspect-ratio": {
      type: Number,
      //observer: 'spectRatioChanged'
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
      //debug: this.debug,
      //chertBackgroundColor: "#e2e6b0",
    };
  }
  
  async connectedCallback(){
    super.connectedCallback();
    this.TYPES = TYPES;
    this.ctieChart = this.$.ctieChart
    this.Adapter = Adapter;

    // 初期表示対象設定取得
    PARAM_LIST.PARAMS.forEach((name)=>{
      const v = this.getAttr(name);
      if (v!==null && v!== undefined) this.params[name] = (name==='type')? Number(v) : v
    });

    // 表示対象の切り替えなど
    this.addEventListener("paramChanged" , (e) => {
      this.paramChanged(e.detail.name, e.detail.newValue, e.detail.oldValue);

    });

    // 表示条件初期設定取得
    PARAM_LIST.CONFIG.forEach((name)=>{
      const keys = CONFIG_MAP;
      const v = this.getAttr(keys[name]? keys[name] : name);
      if (v!==null && v!== undefined) this.conf[name] = (name==='debug')?  v === 'true' : v
    });

    // 描画設定変更、画面再表示
    this.addEventListener("configChanged" , (e) => {
      this.confChanged(e.detail.name, e.detail.newValue, e.detail.oldValue);
    });

    // グラフ初期化
    await this.setUpChart()
  }

  async setUpChart(changName) {
    // 通信環境チェック
    if (!this.setUpAdapter()) return

    // 表示設定チェック
    if (!this.params['observatory'] || !this.params['type'] ) {
      this.popupEvent('status', 'グラフ作成に必要な属性は設定されていません。グラフ表示中断されます。')
      return
    }
    if (!TYPES_INDEX[this.params['type']]) {
      throw new Error(`観測所種類不正！ type:${this.params['type']}`)
    }

    if (!this.params['date']) {
      this.params['date'] = moment().utc().format('YYYYMMDDHHmm')
      this.popupEvent('status', 'not found data and add it.')
    }

    // レイアウト変更時の対応
    const canvas = this.ctieChart.querySelector('canvas')
    if (changName==='height') {
      if (this.conf.height) {
        canvas.setAttribute('height', this.conf.height)
        return;
      }
    } else if (changName==='aspectRatio') {
      if (this.conf.aspectRatio) {
        this.ctieChart.setAspectRatio(this.conf.aspectRatio)
        return;
      }
    }

    this.popupEvent('status', 'checked attributes OK')

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

    } catch (error) {
      if (this.conf.debug) console.log(error);
      throw error
    }
    this.popupEvent('painted', 'OK')

  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    if (PARAM_LIST.PARAMS.includes(name)) {
      if (_.isNil(newValue)) {
        if (this.params[name]) delete this.params[name]
      } else {
        this.params[name] = newValue
      }

      // 複数要素変更を一括更新
      // if (this.resizeTimeout) clearTimeout(this.resizeTimeout);

      // 変更を反映
      // this.resizeTimeout = window.setTimeout(
        this.dispatchEvent(
          new CustomEvent('paramChanged',
          {
            detail: {
              name: name,
              newValue: newValue,
              oldValue: oldValue
            }
          })
        )//, 200
      // );

    }

    const key = CONFIG_INDEX[name]? CONFIG_INDEX[name] : name;
    if (PARAM_LIST.CONFIG.includes(key)) {
      if (_.isNil(newValue)) {
        if (this.conf[name]) delete this.conf[name]
      } else {
        this.conf[name] = (name==='debug')?  newValue === 'true' : newValue
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

  confChanged(name, newValue, oldValue){
    const key = CONFIG_INDEX[name]? CONFIG_INDEX[name] : name;
    this.popupEvent('status', `confChanged[ ${key}: from ${oldValue} to ${newValue}]`)
    if (name === 'api-key') this.adapter = null
    this.setUpChart(name)
  }

  paramChanged(name, newValue, oldValue){
    this.popupEvent('status', `paramChanged[ ${name}: from ${oldValue} to ${newValue}]`)
    this.setUpChart(name)
  }

  popupEvent(name, status){
    //if(this.conf['debug']) console.log('ctie-chart-app.popupEvent:', name, status, this.conf['debug'])
    if (this.conf['debug'] || name === 'error' || name === 'painted' ) {
      this.dispatchEvent(new CustomEvent(name, {
        detail: {[name]: status}
      }));
    }
  }


  setUpAdapter() {
    if (_.isNil(this.conf.apiKey)) {
      this.popupEvent('error', 'error at connect to data service by no apiKey')
      return false
    }

    if (this.adapter) return true

    try {
      this.adapter = new this.Adapter(SERVICE, this.conf.apiKey);
    } catch (error) {
      if (this.conf.debug) console.log(error);
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

