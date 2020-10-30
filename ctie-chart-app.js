
function load(file){
  var location = "http://localhost/web-components/polymer3/ctie-chart/build/es5-bundled/"
  var script = document.createElement( 'script' );
  script.type = 'text/javascript';
  script.src = location+file;
  document.body.appendChild(script);
}
load('script1.js');
load('script2.js');
load(`node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js`);
load('node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js');
load('script3.js');
