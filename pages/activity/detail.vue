<template>
	<view class="white-bg">
	　　<image :src="info.imgUrl" class="width-100 banner-img img-common"></image>
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
		}
	}
</script>

<style lang='scss'>
	.banner-img{
		  border-radius: 5px;
	}
</style>
