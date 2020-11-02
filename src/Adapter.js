import "./lib/axios.js";
//import "axios";
//import axios from "@bundled-es-modules/axios";
//console.log("Adapter.axios", axios)
class Connection {
  
  constructor(servies = null, apiKey = null) {
    if (!servies || !apiKey ) throw new Error("Connection初期化引数エラー")
    this.servies = servies
    this.apiKey = apiKey
  }

  async get(path, params){
    try {
      return await axios.create({
        responseType: "json",
        baseURL: this.servies,
        headers: {
          'Accept': 'application/json',
          'x-api-key': !this.apiKey? null : this.apiKey,
        }
      }).get(
        `${this.servies}${path}`,
        { params: params }
      );
    } catch (error) {throw error}
  }
}

export class Adapter {

  constructor(servies = null, apiKey = null) {
    if (!servies || !apiKey ) throw new Error("Adapter初期化引数エラー")
    this.connect = new Connection(servies, apiKey);
  }

  async init() {
    if (!this.PATH) {
      let module = await import("./Model.js");
      const TYPES = module.TYPES
      this.PATH = {
        LEVEL: {
          [TYPES.RAIN] : '/telemeter/raingauge/query',
          [TYPES.WATER]: '/telemeter/wlevelgauge/query',
          [TYPES.DAM]  : '/telemeter/damgauge/query',
        },
        MASTER: {
          [TYPES.RAIN] : '/telemeter/raingauge/master',
          [TYPES.WATER]: '/telemeter/wlevelgauge/master',
          [TYPES.DAM]  : '/telemeter/damgauge/master'
        }
      };
    }
  }

  /**
   * 観測所グラフ描画データ取得
   * @param {int} type ：観測所種類
   * @param {*} params ：データ取得条件
   */
  async get(type, params){
    if (!this.PATH) await this.init()
    try {
      if (!this.PATH.LEVEL[type]) throw new Error(`パラメータtype[${type}]不正！`)
      const data = await this.connect.get(this.PATH.LEVEL[type], params);
      return data;
    } catch (error) {throw error}
  }

  /**
   * 観測所マスター情報取得
   * @param {int} type  ：観測所種類
   * @param {string} id ：観測所ID(省略された場合は指定された種類の全全部になる)
   */
  async getMaster(type, id){
    if (!this.PATH) await this.init()
    try {
      if (!this.PATH.MASTER[type]) throw new Error(`マスター取得のパラメータtype[${type}]不正！`)
      if (!id) throw new Error(`マスター取得のパラメータID：[${id}]指定されていない！`)
      const mst = await this.connect.get(this.PATH.MASTER[type], {id: id})
      return mst
    } catch (error) {
      console.error("getMaster:",error)
      throw error
    }
  }

  /**
   * 観測所グラフ描画データ取得、変換
   * @param {int} type ：観測所種類
   * @param {*} params ：データ取得条件
   */
  async getChartData(type, params){
    if (!this.PATH) await this.init()
    try {
      if (!this.PATH.LEVEL[type]) throw new Error(`グラフデータ取得のパラメータtype[${type}]不正！`)
      if (!params.id) throw new Error(`グラフデータ取得のパラメータID：[${params.id}]指定されていない！`)
      
      const obser = await this.get(type, params);
      if (
        !obser.data ||
        !obser.data.baseTime ||
        !obser.data.observatories ||
        !obser.data.observatories[params.id]
      ) throw Error("getChartData,観測所データ取得できません！");

      const mst = await this.getMaster(type, params.id)
      if (
        !mst.data ||
        !mst.data.observatories ||
        mst.data.observatories.length !== 1
      ) throw Error("getChartData,マスターデータ取得できません！");

      return {
        baseTime   : obser.data.baseTime,
        observatory: obser.data.observatories[params.id],
        master     : mst.data.observatories[0]
      };
    } catch (error) {throw error}
  }

}
