依赖`uniapp`
## 安装
```bash
npm install @watasi/update

# or

yarn add @watasi/update
```
## 使用
需在`App.vue`中加入以下代码
```javascript
import { checkApp, downloadApp } from '@watasi/update'
export default {
  async onLaunch() {
    let appid = ''  // iOS的appid
    let url = ''  // 安卓检测更新接口
    let param = {}  // 更新接口参数，默认会传 version、platform
    const res = awiat checkApp(appid, url, param)
    if(res.code == 1) {
      // 检测到新版本
      uni.showModal({
        title: res.msg,
        content: res.note,
        success: (e) => {
          if(e.confirm) {
            downloadApp(res.url)
              .then(file => {
                if(file) {
                  plus.runtime.install(file, {}, e => e, err => {
                    uni.$u.toast('安装失败-01')
                  })
                }
              })
          }
        }
      })
    } else {
      uni.$u.toast(res.msg)
    }
  },
  globalData: {
    checkInfo: null,
  }
}
```