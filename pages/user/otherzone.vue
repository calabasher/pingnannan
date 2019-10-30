<template>
	<zone :pInfo="info" :isMyzone="false" ref="zone"></zone>
</template>

<script>
	import zone from '@/components/pages-cp/zone';
	export default {
		components: {
			zone
		},
		data() {
			return {
				urlUserId: '',	// 用户id
				info: {},
			}
		},
		computed: {
		},
		onLoad(option) {
			if(option.userId && option.userId !== 'undefined'){
				this.urlUserId = option.userId
			}else{
				this.noFound()
			}
		},
		onReady(){
		},
		onUnload() {
		},
		onShow(){
			this.getUserInfo(this.urlUserId);
		},
		// 监听页面的隐藏,当从当前A页跳转到其他页面，那么A页面处于隐藏状态。
		onHide(){
		},
		// 分享
		onShareAppMessage() {
			return {
				title: '@' + this.info.nickName,
				path: '/pages/user/otherzone?userId=' + this.userId
			}
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.getUserInfo(this.urlUserId);
			this.$refs.zone.reload()	// 触发子组件的重载事件
			setTimeout(function () {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		methods: {
			// 获取用户信息
			getUserInfo(userId){
				let that = this;
				uni.showLoading({
					title: '加载中'
				});
				var query = that.Bmob.Query('_User');
				query.get(userId).then(res => {
				    that.info = res;
					uni.hideLoading();
					uni.setNavigationBarTitle({
					    title: res.nickName
					});
				}).catch(err => {
					that.noFound()
				})
			},
			noFound(){
				uni.showModal({
				    title: '糟糕！',
				    content: '用户不见',
					showCancel: false,
				    success: function (res) {
				        if (res.confirm) {
				            uni.navigateBack()
				        } 
				    }
				});
			}
		}
	}
</script>

<style lang='scss'>
</style>
