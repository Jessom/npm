class SwitchSDK {
	/**
	 * 请求获取开关配置
	 * @param {Object} url
	 */
	static getSwitch(url, identify, callback) {
		let plateform = this.getPlateform()
		
		uni.request({
			url: `${url}/switch-center`,
			method: 'POST',
			data: {
				"plateform": plateform,
				"identify": identify,
				"sys": uni.$u.sys()
			},
			success: ({data}) => {
				this.handler(data, callback)
			}
		})
	}
	
	/**
	 * 获取不同平台
	 * @returns {String} 
	 */
	static getPlateform() {
		let tag = 'default'
		
		// #ifdef APP-PLUS
		tag = plus.runtime.channel || 'default'
		// #endif
		
		// #ifdef MP-360
		tag = 'mp-360'
		// #endif
		
		// #ifdef MP-ALIPAY
		tag = 'mp-alipay'
		// #endif
		
		// #ifdef MP-BAIDU
		tag = 'mp-baidu'
		// #endif
		
		// #ifdef MP-JD
		tag = 'mp-jd'
		// #endif
		
		// #ifdef MP-KUAISHOU
		tag = 'mp-kuaishou'
		// #endif
		
		// #ifdef MP-QQ
		tag = 'mp-qq'
		// #endif
		
		// #ifdef MP-TOUTIAO
		tag = 'mp-toutiao'
		// #endif
		
		// #ifdef MP-WEIXIN
		tag = 'mp-weixin'
		// #endif
		
		return tag
	}

	/**
	 * 获取本月的节假日
	 * 接口来源：http://www.apihubs.cn/#/holiday
	 * @return false工作日  true休息日
	 */
	static getHoliday(today) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: `https://api.apihubs.cn/holiday/get?date=${today}`,
				method: 'GET',
				success: ({data}) => {
					if(data.code == 0) {
						// let el = data.data.list.find(c => c.date == today)
						let el = data.data.list[0]
						if(el && el.workday == 2) {
							resolve(true)
						} else {
							resolve(false)
						}
					} else {
						resolve(false)
					}
				},
				fail: () => {
					resolve(false)
				}
			})
		})
	}

	static async handler(data, callback) {
		if(data.code == 0) {
			const {
				extension,
				channel,
				channelStart,
				channelEnd,
				channelRender,
				start,
				end,
				render,
				tabbar,
				redirect,
				qq,
				email,
				ischat,
				chat,
				holiday,
				times,
				appVersion,
				downUrl,
				describe
			} = data.data
			let cuttent = Date.now()
			let today = uni.$u.timeFormat(cuttent, 'yyyy/mm/dd')
			let curtTime = uni.$u.timeFormat(cuttent, 'hhMM')
			let isHoliday = false

			qq && (getApp().globalData.qq = qq)
			email && (getApp().globalData.email = email)
			ischat && (getApp().globalData.ischat = ischat)
			chat && (getApp().globalData.chat = chat)
			getApp().globalData.appVersion = appVersion
			getApp().globalData.downUrl = downUrl
			getApp().globalData.describe = describe

			if(holiday && holiday == 1) {
				isHoliday = await this.getHoliday(today.replace(/\//ig, ''))
			}
			
			// 重定向地址
			if(redirect && redirect != '/pages/tabbar/index') {
				uni.reLaunch({
					url: redirect
				})
			}

			// 推广链接
			if(extension) {
				getApp().globalData.extension = extension
			}
			
			if(tabbar.length > 0) {
				tabbar.map(c => {
					uni.setTabBarItem({
						index: Number(c),
						visible: false
					})
				})
			}
			
			// 复制按钮显示
			if(render == 1 || isHoliday) {
				getApp().globalData.btnShow = true
			} else {
				let tstart = new Date(`${today} ${start}`).getTime()
				let tend = new Date(`${today} ${end}`).getTime()
				switch (render){
					case 2:	// 时间段内
						if(tstart < cuttent && tend > cuttent) {
							getApp().globalData.btnShow = true
						}
						break;
					case 3:	// 时间段外
						if(cuttent > tend || cuttent < tstart) {
							getApp().globalData.btnShow = true
						}
						break;
					case 4:
						for(let i=0, leg=times.length; i<leg; i++) {
							let c = times[i]
							let start = Number(c.start.replace(/\:/ig, ''))
							let end = Number(c.end.replace(/\:/ig, ''))
							console.log(start, end, Number(curtTime));
							if(start < Number(curtTime) && end > Number(curtTime)) {
								getApp().globalData.btnShow = true
								break
							}
						}
						break;
					default:
						getApp().globalData.btnShow = false
						break;
				}
			}
			
			// 修改渠道号
			if(channelRender == 1) {
				getApp().globalData.channel = channel
			} else {
				let tstart = new Date(`${today} ${channelStart}`).getTime()
				let tend = new Date(`${today} ${channelEnd}`).getTime()
				switch (channelRender){
					case 2:	// 时间段内
						if(tstart < cuttent && tend > cuttent) {
							getApp().globalData.channel = channel
						}
						break;
					case 3:	// 时间段外
						if(cuttent > tend || cuttent < tstart) {
							getApp().globalData.channel = channel
						}
						break;
				}
			}

			// 检查版本更新
			// #ifdef APP-PLUS
			const update = this.compareVersion(appVersion, plus.runtime.version)
			callback && callback({
				update: update,
				data: data.data
			})
			// #endif

			// #ifndef APP-PLUS
			callback && callback({
				update: 0,
				data: data.data
			})
			// #endif
		}
	}

	/**
		* app版本比较
		* @param {*} version1 	新版本
		* @param {*} version2 	老版本
		* @return {number} 0相同  1有新版本  -1新版本比老版本的版本号低
		*/
	static compareVersion(version1, version2) {
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
}

export default SwitchSDK
