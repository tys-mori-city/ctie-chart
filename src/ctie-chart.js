//import "chart.js";
// console.log("CtieChart..Chart:", Chart)
// window.Chart = Chart;

import {Model} from "./Model.js"
//console.log("CtieChart..Model:", Model)

import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

//import "chartjs-plugin-annotation/chartjs-plugin-annotation.js";

export class CtieChart extends PolymerElement {
  
  constructor() {
    super();
    this.conf = {}
    this.aspectRatio = null
    this.model = null
    this.chartSeting = null
    this.chart = null
  }

  static get template() {
    return html`
      <style>
        canvas {
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
        }
      </style>
      <div>
        <canvas id="ctieCanvas"></canvas>
      </div>`
  }

  static get is() { return 'ctie-chart'; }

  // ready() {
  //   super.ready();
  // }

  async connectedCallback(){
    super.connectedCallback()
    await import("chart.js");
    await import("chartjs-plugin-annotation/chartjs-plugin-annotation.js");
    console.log(CtieChart.is, " connected")
  }

  async setModel(contents, conf) {
    if (conf) this.conf = conf
    this.popupEvent('status',"ctie-chart グラフ描画データ作成")
    this.contents = contents
    if (this.conf.aspectRatio){
      this.aspectRatio = this.conf.aspectRatio
    }

    //const Model = (await import("./Model.js")).Model;
    const model = this.model = new Model(contents, this.conf)
    const seting = model.getConfig();
    if (this.aspectRatio){
      seting.options.aspectRatio=this.aspectRatio
    }

    if (!this.chart) {
      this.chartSeting = seting;
      const ctx = this.$.ctieCanvas;
      if (ctx) this.chart = new Chart(ctx.getContext('2d'), this.chartSeting );
      this.popupEvent('status',"ctie-chart グラフ生成描画完了")
    } else {
      this.chartSeting.data.labels = seting.data.labels
      this.chartSeting.data.datasets = seting.data.datasets
      model.setOptionTo(this.chartSeting.options)
      this.chart.update()
      this.popupEvent('status',"ctie-chart グラフ描画更新完了")
    }
  }

  popupEvent(name, status){
    // console.log('ctie-chart', name, status)
    this.dispatchEvent(new CustomEvent(name, {
      detail: {[name]: status}
    }));
  }


}
customElements.define(CtieChart.is, CtieChart);
