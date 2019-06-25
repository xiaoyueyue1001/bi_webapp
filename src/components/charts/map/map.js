export const MP = function (ak) {
  return new Promise(function(resolve, reject) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "http://api.map.baidu.com/api?v=3.0&ak=" + ak + "&callback=init";
    script.onerror = reject;
    script.onload = function() {
      setTimeout(() => {
        resolve(BMap);
      }, 1000);
    };
    document.head.appendChild(script);
  });
}
