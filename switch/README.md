依赖`uniapp`、`uview`
## 安装
```bash
npm install @watasi/switch

# or

yarn add @watasi/switch
```
switchSDK.getSwitch(请求地址，标识，更新回调object)
## 使用
需在`App.vue`中加入以下代码
```javascript
import switchSDK from '@watasi/switch'
export default {
  onLaunch: function() {
    let url = ''  // 接口地址
    let identify = '' // app标识
    switchSDK.getSwitch(url, identify, callback)
  },
  // ...
  globalData: {
    channel: "",
    btnShow: false, // 1显示按钮  *2时间段内*  *3时间段外*  4多时间段内  5节假日
    btnEvt: 0,  // 0复制  1下载
    qq: "",
    email: "",
    extension: "",
    ischat: 0,
    chat: "",
    ischat: "",
    appVersion: "",
    downUrl: "",
    describe: "",
  }
}
```

```javascript
// 路由拦截器
conf.header.channel = getApp().globalData.channel

// 其他地方使用类似
getApp().globalData
```
