function initWordCloudSeries(echarts) {
    var completeDimensions = require('../../../apache-echarts-4.2.1-incubating-src/src/data/helper/completeDimensions').default;
    echarts.extendSeriesModel({

        type: 'series.wordCloud',

        visualColorAccessPath: 'textStyle.normal.color',

        optionUpdated: function () {
            var option = this.option;
            option.gridSize = Math.max(Math.floor(option.gridSize), 4);
        },

        getInitialData: function (option, ecModel) {
            var dimensions = completeDimensions(['value'], option.data);
            var list = new echarts.List(dimensions, this);
            list.initData(option.data);
            this.setPosition(option, ecModel);
            return list;
        },

        setPosition: function (option, ecModel) {
            if (ecModel.option && ecModel.option.title && ecModel.option.title[0] && ecModel.option.title[0].show && ecModel.option.title[0].text) {
                if (ecModel.option.title[0].subtext) {
                    option.top = 90;
                    option.bottom = 30;
                } else {
                    option.top = 70;
                    option.bottom = 30;
                }
    
            }
            // else {
            //     option.top = 45;
            //     option.bottom = 40;
            // }
        },

        // Most of options are from https://github.com/timdream/wordcloud2.js/blob/gh-pages/API.md
        defaultOption: {

            maskImage: null,

            // Shape can be 'circle', 'cardioid', 'diamond', 'triangle-forward', 'triangle', 'pentagon', 'star'
            shape: 'circle',

            left: 'center',

            top: 'center',

            width: '70%',

            height: '80%',

            sizeRange: [12, 60],

            rotationRange: [-90, 90],

            rotationStep: 45,

            gridSize: 8,

            drawOutOfBound: false,

            textStyle: {
                normal: {
                    fontWeight: 'normal'
                }
            }
        }
    });
}

export default initWordCloudSeries;