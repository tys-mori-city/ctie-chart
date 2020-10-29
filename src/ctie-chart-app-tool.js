import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import './ctie-chart-app.js';

class CtieChartApp extends PolymerElement {
  static get template() {
    return html`
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossorigin="anonymous">
    <style>
      main,
      select.mb-4,
      main label {
        font-size: 1rem;
      }
      .tab-content {
        background-color: #e4e2e2;
        /*margin: 5px;*/
        padding: 10px;
      }
      main {
        display: flex;
        flex-direction: column;
      }
      main>div {
        display: flex;
        flex-direction: column;
      }
      main>div main>div>div {
        flex: 1;
      }
      .chart{
        padding:0px;
      }
      form.p-5 {
        padding-top:0;
        background-color: #e4e2e2;
      }
      #success_message{ display: none;}
    </style>
    <div class="container font-small" style="max-width:100%;">
      <h5 class="text-center" style="min-width:100%; padding-top:10px; margin-bottom:0;">観測所Web部品</h3>
      <main class="p-2">
        <div class="tab-content">
          <div id="tab2" class="tab-pane center-block active">
            <div class="container-fluid container-m h-100">
              <div class="row  h-100" style="background-color: #fff">
                <div class="column h-100 col-md-12 chart">
                  <ctie-chart-app-core></ctie-chart-app-core>
                </div>
              </div>
            </div>
          </div>
          <label>観測所切替</label>
          <select class="browser-default custom-select mb-4" id="ob-id">
            <option value="" selected style="background-color: #e4e2e2;" disabled>必須選択...</option>
            <option value="4,22829_3">22829_3 水位、欠測</option>
            <option value="4,21782_2_">21782_2_ 水位、断面有</option>
            <option value="4,2561_5">  2561_5 水位、断面無</option>
            <option value="4,21782_3">21782_3 水位、断面有</option>
            <option value="4,22061_2">22061_2 水位、断面有</option>
            <option value="1,20817_3">20817_3 雨量</option>
            <option value="7,22061_3">22061_3 ダム</option>
            <option value="4,21556_1">愛本 水位、断面有</option>
          </select>
          <div class="container">
            <form>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="debugCheck" checked>
              <label class="form-check-label" for="debugCheck">ディバックモード</label>
            </div>                
          </div>

      　</div>
      </div>
      </main>
    <div>
    `;

  }
  static get is() { return 'ctie-chart-app'; }

  static get properties() { return {

    debug: Boolean,
    apiKey: String,
    observatory: String,
    type: Number,
    height: Number,
    aspectRatio: Number,

    visible: {
      type: Boolean,
      observer: '_visibleChanged'
    },

    // _hasItems: {
    //   type: Boolean,
    //   computed: '_computeHasItem(cart.length)'
    // }

  }}

  _visibleChanged(visible) {
    if (visible) {
      // Notify the section's title
      this.dispatchEvent(new CustomEvent('change-section', {
        bubbles: true, composed: true, detail: { title: 'Your cart' }}));
    }
  }

}
customElements.define(CtieChartApp.is, CtieChartApp);
