function initBMap(echarts) {

  // var echarts = require("echarts");

  var BMapCoordSys = require("./BMapCoordSys")(echarts);

  require("./BMapModel")(echarts);

  require("./BMapView")(echarts);

  echarts.registerCoordinateSystem('bmap', BMapCoordSys); // Action

  echarts.registerAction({
    type: 'bmapRoam',
    event: 'bmapRoam',
    update: 'updateLayout'
  }, function (payload, ecModel) {
    ecModel.eachComponent('bmap', function (bMapModel) {
      var bmap = bMapModel.getBMap();
      var center = bmap.getCenter();
      bMapModel.setCenterAndZoom([center.lng, center.lat], bmap.getZoom());
    });
  });
}
module.exports = initBMap;