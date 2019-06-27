// 导出页面为PDF格式
import html2Canvas from 'html2canvas'
function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];

    var bstr = atob(arr[1]);
    var n = bstr.length
    var u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}
export const htmlToPng = function (dom, title) {
    var c = document.createElement("canvas")
    var opts = {
        scale: 2,
        canvas: c,
        logging: true,
        width: document.querySelector(dom).offsetWidth,
        height: document.querySelector(dom).offsetHeight,
        backgroundColor: "#073046"
    };
    c.width = document.querySelector(dom).offsetWidth * 2
    c.height = document.querySelector(dom).offsetHeight * 2
    c.getContext("2d").scale(2, 2);
    html2Canvas(document.querySelector(dom), opts).then(function (canvas) {
        var canvasElement = canvas;
        var MIME_TYPE = "image/png";
        var imgURL = canvasElement.toDataURL(MIME_TYPE);
        var imgBlob = dataURLtoBlob(imgURL);
        var dlLink = document.createElement('a');
        dlLink.download = title;
        dlLink.href = window.URL.createObjectURL(imgBlob);
        dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
    })
};
export default {
    install(Vue, options) {
        Vue.prototype.getPdf = function (dom, title) {
            var title = title
            var c = document.createElement("canvas")
            var opts = {
                scale: 2,
                canvas: c,
                logging: true,
                width: document.querySelector(dom).width,
                height: document.querySelector(dom).height,
                backgroundColor: "#073046"
            };
            c.width = document.querySelector(dom).width * 2
            c.height = document.querySelector(dom).height * 2
            c.getContext("2d").scale(2, 2);
            html2Canvas(document.querySelector(dom), opts).then(function (canvas) {
                let contentWidth = canvas.width
                let contentHeight = canvas.height
                let pageHeight = contentWidth / 592.28 * 841.89
                let leftHeight = contentHeight
                let position = 0
                let imgWidth = 595.28
                let imgHeight = 592.28 / contentWidth * contentHeight
                let pageData = canvas.toDataURL('image/jpeg', 1.0)
                let PDF = new JsPDF('', 'pt', 'a4')
                if (leftHeight < pageHeight) {
                    PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
                } else {
                    while (leftHeight > 0) {
                        PDF.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
                        leftHeight -= pageHeight
                        position -= 841.89
                        if (leftHeight > 0) {
                            PDF.addPage()
                        }
                    }
                }
                PDF.save(title + '.pdf')
            }
            )
        }
        Vue.prototype.getPng = function (dom, title) {
            var c = document.createElement("canvas")
            var opts = {
                scale: 2,
                canvas: c,
                logging: true,
                width: document.querySelector(dom).width,
                height: document.querySelector(dom).height,
                backgroundColor: "#073046"
            };
            c.width = document.querySelector(dom).width * 2
            c.height = document.querySelector(dom).height * 2
            c.getContext("2d").scale(2, 2);
            html2Canvas(document.querySelector(dom), opts).then(function (canvas) {
                var canvasElement = canvas;
                var MIME_TYPE = "image/png";
                var imgURL = canvasElement.toDataURL(MIME_TYPE);
                var imgBlob = dataURLtoBlob(imgURL);
                var dlLink = document.createElement('a');
                dlLink.download = title;
                dlLink.href = window.URL.createObjectURL(imgBlob);
                dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
                document.body.appendChild(dlLink);
                dlLink.click();
                document.body.removeChild(dlLink);
            })
        }
    }
}