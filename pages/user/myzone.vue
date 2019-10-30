<template>
	<zone :pInfo="info" ref="zone"></zone>
</template>

<script>
	import { mapState } from 'vuex'; 
	import zone from '@/components/pages-cp/zone';
	export default {
		components: {
			zone
		},
		data() {
			return {
				info: {},
			}
		},
		computed: {
			...mapState(['hasLogin','userInfo'])
		},
		onLoad() {
			console.log('onload')
			let that = this;
			let userInfo = uni.getStorageSync('userInfo') || '';
			if(!userInfo.objectId){
				uni.reLaunch({
					url: '/pages/authorize/authorize'
				});
				return
			}
			uni.setStorage({
			  key: 'reloadZone',
			  data: false,
			  success: function (res) {
				console.log('更新刷新主页状态: 不更新')
			  }
			});
			uni.getStorage({
				key: 'userInfo',
				success: function (res) {
					that.init();
				}
			});
		},
		onShow(){
			console.log('onShow')
			let that = this;
			uni.getStorage({
			  key: 'reloadZone',
			  success: function (res) {
				if(res.data){
					that.$refs.zone.reload()	// 触发子组件的重载事件
				}
			  }
			});
		},
		onReady(){
			
		},
		// 监听页面卸载， 监听页面的卸载， 当前处于A页面，点击返回按钮时，则将是A页面卸载、
		onUnload() {
			// this.info = {};
		},
		// 监听页面的隐藏,当从当前A页跳转到其他页面，那么A页面处于隐藏状态。
		onHide(){
			uni.setStorage({
			  key: 'reloadZone',
			  data: false,
			  success: function (res) {
				console.log('更新刷新主页状态: 不更新')
			  }
			});
		},
		// 分享
		onShareAppMessage() {
			return {
				title: '邀请您使用小镇事事通',
				path: '/pages/index/index'
			}
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.getUserInfo();
			this.$refs.zone.reload()	// 触发子组件的重载事件
			setTimeout(function () {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		// 到底
		onReachBottom(){
		},
		methods: {
			async init () {
				await this.getUserInfo();
			},
			// 获取用户信息
			getUserInfo () {
				let that = this;
				uni.showLoading({
					title: '加载中'
				});
				return new Promise((resolve, reject) => {
					const query = that.Bmob.Query('_User');
					query.get(that.userInfo.objectId).then(res => {
						that.info = res;
						uni.hideLoading();
					})
					resolve('suc');
				})
			},
		}
	}
</script>

<style lang='scss'>
</style>
