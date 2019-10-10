<template>
	<zone :info="info"></zone>
</template>

<script>
	import zone from '@/components/pages-cp/zone';
	export default {
		components: {
			zone
		},
		data() {
			return {
				info: {
					objectId: '',	// 用户Id
					nickName: '未登录',	// 用户昵称
					avatarUrl: '/static/logo/no-login.png',	// 头像
					gender: 1,	// 性别 1-男
					autograph: '暂无签名',	// 签名
					follows: 0,	// 关注数
					fans: 0,	// 粉丝数
					praise: 0,	// 赞数
				},
			}
		},
		computed: {
		},
		async onLoad(option) {
			if(option.userId && option.userId !== 'undefined'){
				this.getUserInfo(option.userId)
			}else{
				uni.showModal({
				    title: '糟糕！',
				    content: '用户找不到了',
					showCancel: false,
				    success: function (res) {
				        if (res.confirm) {
				            uni.navigateBack()
				        } 
				    }
				});
			}
		},
		onReady(){
		},
		// 分享
		onShareAppMessage() {
			return {
				title: '事事通',
				path: '/pages/index/index'
			}
		},
		// 下拉刷新
		onPullDownRefresh() {
			// this.onLoad();
		},
		// 监听页面卸载， 监听页面的卸载， 当前处于A页面，点击返回按钮时，则将是A页面卸载、
		onUnload() {
		},
		// 监听页面的隐藏,当从当前A页跳转到其他页面，那么A页面处于隐藏状态。
		onHide(){
			
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
					uni.setNavigationBarTitle({
					    title: res.nickName
					});
				})
			}
		}
	}
</script>

<style lang='scss'>
</style>
