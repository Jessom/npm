依赖`uniapp`、`uview`
## 安装
```bash
npm install @watasi/switch

# or

yarn add @watasi/switch
```
## 使用
需在`App.vue`中加入以下代码
```javascript
import switchSDK from '@watasi/switch'
export default {
  onLaunch: function() {
    let url = ''  // 接口地址
    let identify = '' // app标识
    switchSDK.getSwitch(url, identify)
  },
  // ...
  globalData: {
    channel: "",
    btnShow: false,
    qq: "",
    email: "",
    extension: ""
  }
}
```

```javascript
// 路由拦截器
conf.header.channel = getApp().globalData.channel

// 其他地方使用类似
getApp().globalData
```