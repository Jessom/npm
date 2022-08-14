/**
 * app版本比较
 * @param {*} version1 	新版本
 * @param {*} version2 	老版本
 * @return {number} 0相同  1有新版本  -1新版本比老版本的版本号低
 */
function compareVersion(version1, version2) {
  const v1 = version1.split('.');
  const v2 = version2.split('.');
  for (let i = 0; i < v1.length || i < v2.length; i++) {
      let x = 0, y = 0;
      if (i < v1.length) {
          x = parseInt(v1[i]);
      }
      if (i < v2.length) {
          y = parseInt(v2[i])
      }
      if (x > y) return 1;
      if (x < y) return -1;
  }
  return 0;
}

function resolveDate(update, data, appid) {
  if(uni.$u.os() == 'android') {
		if(update == 1) {
      let result = {
        code: update,
        msg: '检测到新版本',
        data: data
      }
      getApp().globalData.checkInfo = result
      return result
    } else {
      let result = {
        code: update,
        msg: '已是最新版本',
        data: data
      }
      getApp().globalData.checkInfo = result
      return result
    }
	} else {
    if(update == 1) {
      let result = {
        code: update,
        msg: '检测到新版本',
        version: data.results[0].version,
        note: data.results[0].relleaseNotes,
        url: `itms-apps://itunes.apple.com/us/app/id${appid}`,
        data: data
      }
      getApp().globalData.checkInfo = result
      return result
    } else {
      let result = {
        code: update,
        msg: '已是最新版本',
        version: data.results[0].version,
        note: data.results[0].relleaseNotes,
        url: `itms-apps://itunes.apple.com/us/app/id${appid}`
      }
      getApp().globalData.checkInfo = result
      return result
    }
	}
}

/**
 * Android检测更新
 * @param {*} updateUrl 检测接口
 */
function checkAndroidUpdate(updateUrl, param) {
  return new Promise((resolve, reject) => {
    const { version, versionCode, channel } = plus.runtime
    uni.request({
      url: updateUrl,
      method: 'GET',
      data: {
        version: version,
        platform: channel,
        ...param
      },
      success: ({data}) => {
        if(data.result == 0) {
          const update = compareVersion(data.data.version, version)
          let result = resolveDate(update, data)
          resolve(result)
        }
      },
      fail: (err) => {
        console.log(err);
      }
    })
  })
}

/**
 * iOS检测更新
 * @param {*} appid iOS appid
 */
function checkIosUpdate(appid) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'http://itunes.apple.com/lookup',
      method: 'GET',
      data: {
        id: appid
      },
      header: {
        'contentType': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      success: (res) => {
        const { version, versionCode } = plus.runtime
        if(res && res.data.resultCount && res.data.resultCount > 0) {
          const update = compareVersion(res.data.results[0].version, version)
          let result = resolveDate(update, res.data, appid)
          if(update == 1) {
            resolve(result)
          }
        }
      }
    })
  })
}

/**
 * 检测更新
 * @param {String} appid iOS的appid
 * @param {String} updateUrl 安卓为更新接口
 * @param {String} param 安卓端请求参数
 */
export const checkApp = (appid, updateUrl, param={}) => {
  // #ifdef APP-PLUS
	if(uni.$u.os() == 'android') {
		checkAndroidUpdate(updateUrl, param)
	} else {
		checkIosUpdate(appid)
	}
	// #endif

  // #ifdef MP-WEIXIN
	if(uni.canIUse('getUpdateManager')) {
		const update = uni.getUpdateManager()
		update.onCheckForUpdate(res => {
			//检测是否有新版本
			if(res.hasUpdate) {
				update.onUpdateReady(() => {
					uni.showModal({
						title: '更新提示',
						content: '新版本已经准备好，是否重启应用？',
						success: function (res) {
							if (res.confirm) {
								update.applyUpdate();
							}
						}
					})
				})
			}
		})
	}
	// #endif
}

/**
 * 下载app
 * @param {*} url 下载地址
 */
export const downloadApp = (url) => {
  if(uni.$u.os() == 'android') {
		return download4Android(url)
	} else {
		return donwload4iOs(url)
	}
}

// 下载安卓 apk
const download4Android = (url) => {
  return new Promise((resolve, reject) => {
    const dtask = plus.downloader.createDownload(url, {}, (d, status) => {
      if(status == 200) {
        resolve(plus.io.convertLocalFileSystemURL(d.filename))
      } else {
        uni.$u.toast('更新失败-01')
        reject()
      }
    })
    
    try{
      dtask.start()
      let prg = 0;
      let showLoading = plus.nativeUI.showWaiting("正在下载")
      dtask.addEventListener('statechanged', (task, status) => {
        switch (task.state){
          case 1:
            showLoading.setTitle('正在下载')
            break;
          case 2:
            showLoading.setTitle('已连接到服务器')
            break;
          case 3:
            prg = parseInt((parseFloat(task.downloadedSize) / parseFloat(task.totalSize)) * 100)
            showLoading.setTitle(' 正在下载' + prg + '% ')
            break;
          case 4:
            // 下载完成
            plus.nativeUI.closeWaiting()
            break;
          default:
            break;
        }
      })
    } catch (e) {
      plus.nativeUI.closeWaiting()
      uni.$u.toast('更新失败-02')
      reject()
    }
  })
}

// 跳去app store更新app
const donwload4iOs = (url) => {
  return new Promise(resolve => {
    plus.runtime.openURL(url);
    resolve(null)
  })
}
