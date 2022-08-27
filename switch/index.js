class SwitchSDK {
	/**
	 * 请求获取开关配置
	 * @param {Object} url
	 */
	static getSwitch(url, identify) {
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
				this.handler(data)
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

	static handler(data) {
		if(data.code == 0) {
			const { extension, channel, channelStart, channelEnd, channelRender, start, end, render, tabbar, redirect, qq, email } = data.data
			let cuttent = Date.now()
			let today = uni.$u.timeFormat(cuttent, 'yyyy/mm/dd')
			
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
			if(render == 1) {
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
			
			qq && (getApp().globalData.qq = qq)
			email && (getApp().globalData.email = email)
		}
	}
}

export default SwitchSDK
