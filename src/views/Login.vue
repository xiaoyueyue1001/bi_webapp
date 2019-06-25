<template>
  <div id="login">
    <div class="login-wrap">
      <img src="../assets/images/logo.png" alt>
      <div class="title">大数据敏捷BI</div>
      <mt-field placeholder="请输入用户名" v-model="account"></mt-field>
      <mt-field placeholder="请输入密码" v-model="password" type="password"></mt-field>
      <mt-button type="primary" @click.native="login">登录</mt-button>
    </div>
  </div>
</template>
<script>
import MD5 from "md5";
import { saveLocalUser } from "../utils/session.js";
export default {
  data() {
    return {
      account: "admin",
      password: "123456"
    };
  },
  methods: {
    login() {
      this.$store
        .dispatch("submitLogin", {
          username: this.account,
          password: MD5(`${this.password}`)
        })
        .then(res => {
          if (res.code === 200) {
            const local = {
              ...res.obj
            };
            saveLocalUser(local);
            this.$router.push({
              name: "superPanel"
            });
          } else {
            // this.$Message.error(res.msg);
          }
        });
    }
  }
};
</script>

<style lang="less" scoped>
#login {
  height: 100%;
  background: url("../assets/images/login_bg.png");
  overflow: hidden;
  > .login-wrap {
    margin: 1.1rem auto 0 auto;
    width: 6.1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    > img {
      width: 1.04rem;
      height: 1.04rem;
    }
    > .title {
      margin: 0.3rem 0 0.8rem 0;
      font-size: 0.6rem;
      line-height: 0.6rem;
      height: 0.6rem;
      color: var(--highlight-color);
    }
    > button {
      margin-top: 0.88rem;
      width: 6.1rem;
      height: 0.9rem;
      border-radius: 0.45rem;
      border: 1px solid var(--button-primary-border-color);
      background-color: var(--button-primary-bg-color);
      font-size: 0.36rem;
    }
  }
}
</style>
<style lang="less">
#login {
  .mint-cell {
    background-color: transparent;
    width: 100%;
    border-bottom: 1px solid var(--default-border-color);
    height: 0.72rem;
    line-height: 0.72rem;
    margin-top: 0.48rem;
    input {
      color: var(--default-font-color);
      font-size: 0.36rem;
    }
  }
}
</style>


