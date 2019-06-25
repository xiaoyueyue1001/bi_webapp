/**Created by bobo on 2019/4/3*/
//格式化显示数据

export const formatedNumber = num => {
  num = (num || 0).toString();
  let result = "";
  while (num.length > 3) {
    result = "," + num.slice(-3) + result;
    num = num.slice(0, num.length - 3);
  }
  if (num) {
    result = num + result;
  }
  return result;
};

export function getTextByValue(arr, value) {
  for (let item of arr) {
    if (item.value === value) {
      return item.text;
    }
  }
  return null;
}
/*判断是否为数组*/
export function  isArray(value) {
  if (typeof Array.isArray === "function") {
    return Array.isArray(value);
  } else {
    return Object.prototype.toString.call(value) === "[object Array]";
  }
}

export function getType(value) {
  const typeArr = Object.prototype.toString.call(value).replace("[", "").replace("]", "").split(" ");
  return typeArr.length > 1 ? typeArr[1] : typeArr[0];
}
