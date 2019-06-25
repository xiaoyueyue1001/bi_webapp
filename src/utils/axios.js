import axios from "axios";
import Vue from "vue";
import { getLocalUser } from "./session";
import { goLogin } from "./goLogin";

const vue = new Vue();

export default {
  defaultGet: (path, params) => {
    const session = getLocalUser();
    if (!session) {
      goLogin();
      return;
    }
    return new Promise((resolve, reject) => {
      axios
        .get(path, {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            // VT: session.vt
          },
          params: params
        })
        .then(res => {
          if (res.code === 600 || res.data.code === 600) {
            goLogin();
            reject(res);
          }
          if (res.status !== 200) {
            Toast({
              message: res.statusText,
              position: 'bottom',
              duration: 3000
            });
            reject(res);
          }
          if (res.data.code === 0 ||
            (res.data.code && res.data.code !== 200) &&
            (res.data.code && res.data.code !== 600)) {
            if (res.data.code === 403) {
              Toast({
                message: res.data.msg,
                position: 'bottom',
                duration: 3000
              });
            } else {
              Toast({
                message: res.data.resMsg || res.data.msg,
                position: 'bottom',
                duration: 3000
              });
            }
          }
          resolve(res);
        })
        .catch(error => {
          reject(error.message);
          Toast({
            message: error.message,
            position: 'bottom',
            duration: 3000
          });
        });
    });
  },
  get: (path, params) => {
    const session = getLocalUser();
    if (!session) {
      goLogin();
      return;
    }
    return new Promise((resolve, reject) => {
      axios
        .get(path, {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            // VT: session.vt
          },
          params: params
        })
        .then(res => {
          if (res.code === 600 || res.data.code === 600) {
            goLogin();
            reject(res);
          }
          if (res.status !== 200) {
            Toast({
              message: res.statusText,
              position: 'bottom',
              duration: 3000
            });
            reject(res);
          }
          if (res.data.code === 0 ||
            (res.data.code && res.data.code !== 200) &&
            (res.data.code && res.data.code !== 600)) {
            if (res.data.code === 403) {
              Toast({
                message: res.data.msg,
                position: 'bottom',
                duration: 3000
              });
            } else {
              Toast({
                message: res.data.resMsg || res.data.msg,
                position: 'bottom',
                duration: 3000
              });
            }
            //需要有响应
            reject(res);
          }
          resolve(res);
        })
        .catch(error => {

          reject(error.message);
          Toast({
            message: error.message,
            position: 'bottom',
            duration: 3000
          });
        });
    });
  },
  getWithoutVt: (path, params) => {
    return new Promise((resolve, reject) => {
      axios
        .get(path, {
          headers: {
            "Content-Type": "application/json;charset=UTF-8"
          },
          params: params
        })
        .then(res => {
          if (res.code === 600 || res.data.code === 600) {
            goLogin();
            reject(res);
          }
          if (res.status !== 200) {
            Toast({
              message: res.statusText,
              position: 'bottom',
              duration: 3000
            });
            reject(res);
          }
          if (res.data.code === 0 ||
            (res.data.code && res.data.code !== 200) &&
            (res.data.code && res.data.code !== 600)) {
            if (res.data.code === 403) {
              Toast({
                message: res.data.msg,
                position: 'bottom',
                duration: 3000
              });
            } else {
              Toast({
                message: res.data.resMsg || res.data.msg,
                position: 'bottom',
                duration: 3000
              });
            }
            //需要有响应
            reject(res);
          }
          resolve(res);
        })
        .catch(error => {
          reject(error.message);
          Toast({
            message: error.message,
            position: 'bottom',
            duration: 3000
          });
        });
    });
  },
  /*拦截data.code为600，正常resolve*/
  defaultPost: (path, params) => {
    const session = getLocalUser();
    if (!session) {
      goLogin();
      return;
    }
    return new Promise((resolve, reject) => {
      axios
        .post(path, params, {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            // VT: session.vt
          }
        })
        .then(res => {
          if (res.code === 600 || res.data.code === 600) {
            goLogin();
            reject(res);
          }
          if (res.status !== 200) {
            Toast({
              message: res.statusText,
              position: 'bottom',
              duration: 3000
            });
            reject(res);
          }
          if (res.data.code === 0 ||
            (res.data.code && res.data.code !== 200) &&
            (res.data.code && res.data.code !== 600)) {
            if (res.data.code === 403) {
              Toast({
                message: res.data.msg,
                position: 'bottom',
                duration: 3000
              });
            } else {
              Toast({
                message: res.data.resMsg || res.data.msg,
                position: 'bottom',
                duration: 3000
              });
            }
          }
          resolve(res);
        })
        .catch(error => {
          reject(error.message);
          Toast({
            message: error.message,
            position: 'bottom',
            duration: 3000
          });
        });
    });
  },
  post: (path, params) => {
    const session = getLocalUser();
    if (!session) {
      goLogin();
      return;
    }
    return new Promise((resolve, reject) => {
      axios
        .post(path, params, {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            // VT: session.vt
          }
        })
        .then(res => {
          if (res.code === 600 || res.data.code === 600) {
            goLogin();
            reject(res);
          }
          if (res.status !== 200) {
            Toast({
              message: res.statusText,
              position: 'bottom',
              duration: 3000
            });
            reject(res);
          }
          if (res.data.code === 0 ||
            (res.data.code && res.data.code !== 200) &&
            (res.data.code && res.data.code !== 600)) {
            if (res.data.code === 403) {
              Toast({
                message: res.data.msg,
                position: 'bottom',
                duration: 3000
              });
            } else {
              Toast({
                message: res.data.resMsg || res.data.msg,
                position: 'bottom',
                duration: 3000
              });
            }
            //需要有响应
            reject(res);
          }
          resolve(res);
        })
        .catch(error => {
          reject(error.message);
          Toast({
            message: error.message,
            position: 'bottom',
            duration: 3000
          });
        });
    });
  },
  postWithoutVt: (path, params) => {
    // let form = new FormData();
    // for (let param in params) {
    //   form.append(param, params[param]);
    // }
    // const formDataParams = new URLSearchParams(form);
    return new Promise((resolve, reject) => {
      axios
        .post(path, params, {
          headers: {
            "Content-Type": "application/json;charset=UTF-8"
            // VT: session.vt
          }
        })
        .then(res => {
          if (res.code === 600 || res.data.code === 600) {
            goLogin();
            reject(res);
          }
          if (res.status !== 200) {
            Toast({
              message: res.statusText,
              position: 'bottom',
              duration: 3000
            });
            reject(res);
          }
          if (res.data.code === 0 ||
            (res.data.code && res.data.code !== 200) &&
            (res.data.code && res.data.code !== 600)) {
            if (res.data.code === 403) {
              Toast({
                message: res.data.msg,
                position: 'bottom',
                duration: 3000
              });
            } else {
              Toast({
                message: res.data.resMsg || res.data.msg,
                position: 'bottom',
                duration: 3000
              });
            }
            //需要有响应
            reject(res);
          }
          resolve(res);
        })
        .catch(error => {
          reject(error.message);
          Toast({
            message: error.message,
            position: 'bottom',
            duration: 3000
          });
        });
    });
  },
  loginOut: (path, params) => {
    return new Promise((resolve, reject) => {
      axios
        .get(path, {
          headers: {
            "Content-Type": "application/json;charset=UTF-8"
          },
          params: params
        })
        .then(res => {
          if (res.status !== 200) {
            Toast({
              message: res.statusText,
              position: 'bottom',
              duration: 3000
            });
            reject(res);
          }
          if (res.data.code === 403) {
            Toast({
              message: res.data.msg,
              position: 'bottom',
              duration: 3000
            });
          }
          resolve(res);
        })
        .catch(error => {
          reject(error.message);
          Toast({
            message: error.message,
            position: 'bottom',
            duration: 3000
          });
        });
    });
  },
  shareGet: (path, params) => {
    return new Promise((resolve, reject) => {
      axios
        .get(path, {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            // VT: session.vt
          },
          params: params
        })
        .then(res => {
          if (res.code === 600 || res.data.code === 600) {
            goLogin();
            reject(res);
          }
          if (res.status !== 200) {
            Toast({
              message: res.statusText,
              position: 'bottom',
              duration: 3000
            });
            reject(res);
          }
          if (res.data.code === 0 ||
            (res.data.code && res.data.code !== 200) &&
            (res.data.code && res.data.code !== 600)) {
            if (res.data.code === 403) {
              Toast({
                message: res.data.msg,
                position: 'bottom',
                duration: 3000
              });
            } else {
              Toast({
                message: res.data.resMsg || res.data.msg,
                position: 'bottom',
                duration: 3000
              });
            }
            //需要有响应
            reject(res);
          }
          resolve(res);
        })
        .catch(error => {

          reject(error.message);
          Toast({
            message: error.message,
            position: 'bottom',
            duration: 3000
          });
        });
    });
  },
  sharePost: (path, params) => {
    return new Promise((resolve, reject) => {
      axios
        .post(path, params, {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            // VT: session.vt
          }
        })
        .then(res => {
          if (res.code === 600 || res.data.code === 600) {
            goLogin();
            reject(res);
          }
          if (res.status !== 200) {
            Toast({
              message: res.statusText,
              position: 'bottom',
              duration: 3000
            });
            reject(res);
          }
          if (res.data.code === 0 ||
            (res.data.code && res.data.code !== 200) &&
            (res.data.code && res.data.code !== 600)) {
            if (res.data.code === 403) {
              Toast({
                message: res.data.msg,
                position: 'bottom',
                duration: 3000
              });
            } else {
              Toast({
                message: res.data.resMsg || res.data.msg,
                position: 'bottom',
                duration: 3000
              });
            }
            //需要有响应
            reject(res);
          }
          resolve(res);
        })
        .catch(error => {
          reject(error.message);
          Toast({
            message: error.message,
            position: 'bottom',
            duration: 3000
          });
        });
    });
  },
};
