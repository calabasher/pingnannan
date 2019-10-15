<template>
	<zone :info="info" ref="zone"></zone>
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
			...mapState(['hasLogin','userInfo'])
		},
		async onLoad() {
			let that = this;
			uni.getStorage({
			    key: 'userInfo',
			    success: function (res) {
					that.info.objectId = res.data.objectId;
					that.getUserInfo();
			    }
			});
		},
		onReady(){
			
		},
		onShow(){
			
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
			this.$refs.zone.reload()	// 触发子组件的重载事件
			setTimeout(function () {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		// 监听页面卸载， 监听页面的卸载， 当前处于A页面，点击返回按钮时，则将是A页面卸载、
		onUnload() {
		},
		// 监听页面的隐藏,当从当前A页跳转到其他页面，那么A页面处于隐藏状态。
		onHide(){
			
		},
		onShow(){
			
		},
		// 到底
		onReachBottom(){
		},
		methods: {
			// 获取用户信息
			getUserInfo () {
				let that = this;
				uni.showLoading({
					title: '加载中'
				});
				const query = that.Bmob.Query('_User');
				query.get(that.userInfo.objectId).then(res => {
					that.info = res;
					uni.hideLoading();
				}).catch(err => {
				  console.log(err)
				})
			},
		}
	}
</script>

<style lang='scss'>
</style>
