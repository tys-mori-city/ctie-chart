
function load(file){
  // 環境に合わせてlocationは設定する必要がある！
  var location = "http://localhost/web-components/polymer3/ctie-chart/build/es5-bundled/"
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = location+file;
  document.body.appendChild(script);
}
try {
  load('script1.js');
  load('script2.js');
  load('node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js');
  load('node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js');
  load('script3.js');
} catch (error) {
  console.log("loder実行エラー：", error, "※ 環境設定をチェックしてください。")
}
