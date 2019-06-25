import {encode, decode} from "base64-utf8";

// 获取用户会话信息
export const getUserSession = () => {
  let session = sessionStorage.getItem("zcmorefun-userInfo");
  if (session) {
    return JSON.parse(decode(session));
  } else {
    return null;
  }
};

// 获取token
export const getToken = () => {
  let userInfo = getUserSession();
  if (userInfo) {
    return userInfo.token;
  } else {
    return "";
  }
};

/**
 * 存储用户会话信息
 * @param  {json} userInfo json格式的用户信息
 */
export const saveUserSession = userInfo => {
  let strInfo = JSON.stringify(userInfo);
  sessionStorage.setItem("zcmorefun-userInfo", encode(strInfo));
};

// 获取用户本地信息
export const getLocalUser = () => {
  let local = localStorage.getItem("zcmorefun-userInfo");
  if (local) {
    return JSON.parse(decode(local));
  } else {
    return null;
  }
};

/**
 * 存储用户本地信息
 * @param  {json} userInfo json格式的用户信息
 */
export const saveLocalUser = userInfo => {
  let strInfo = JSON.stringify(userInfo);
  localStorage.setItem("zcmorefun-userInfo", encode(strInfo));
}
export const clearLocalUser = () => {
  if (getLocalUser()) {
    localStorage.removeItem("zcmorefun-userInfo")
  }
}

// session跨标签解决方案
/*(function(){
  if (!sessionStorage.length) {
    localStorage.setItem('getSessionStorage', Date.now());
  };

  window.addEventListener('storage', function(event){
    if (event.key == 'getSessionStorage') {
      localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
      localStorage.removeItem('sessionStorage');
    } else if (event.key == 'sessionStorage' && !sessionStorage.length) {
      let data = JSON.parse(event.newValue);
      for (let key in data) {
        sessionStorage.setItem(key, data[key]);
      }
    }
  });
})();*/
