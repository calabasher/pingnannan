<template>
	<view class="white-bg">
	　　<image :src="info.imgUrl" class="width-100 img-common banner-img" @click="preImg"></image>
	</view>
</template>

<script>
	export default {
		components: {
		},
		data() {
			return {
				linkId: '',	
				info: {},
			}
		},
		computed: {
			
		},
		async onLoad(option) {
			this.linkId = option.linkId
			this.getInfo();
		},
		onReady(){
		},
		// 分享
		onShareAppMessage() {
			return {
				title: '邀请您使用小镇事事通',
				path: '/pages/activity/detail?linkId=' + this.linkId
			}
		},
		// 下拉刷新
		onPullDownRefresh() {
		},
		// 到底
		onReachBottom(){
		},
		methods: {
			// 获取广告图片
			getInfo() {
				let that = this;
				uni.showLoading({
					title: '加载中'
				});
				// 获取一行记录
				var query = that.Bmob.Query('activity');
				query.get(that.linkId).then(res => {
				  uni.hideLoading();
				  that.info = res;
				  uni.setNavigationBarTitle({
				      title: res.title
				  });
				})
			},
			// 图片预览
			preImg() {
				uni.previewImage({
					current: this.info.imgUrl,
					urls: [this.info.imgUrl]
				})
			},
		}
	}
</script>

<style lang='scss'>
	.banner-img{
		height: 680px;
	}
</style>
