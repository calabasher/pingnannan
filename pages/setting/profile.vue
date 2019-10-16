<template>
	<view class="container">
		<view class="tui-cells pd15 mgt10">
			<textarea class="tui-textarea" v-model="userInfo.profile" name="desc" placeholder="填写个人简介更容易获得别人关注哦" maxlength="150"
			 placeholder-class="tui-phcolor-color" auto-focus />
			<view class="tui-textarea-counter">{{userInfo.profile.length}}/150</view>
		</view>
		<view class="tui-cmt-btn">
			<van-button type="info" size="large" @click="publish" :disabled=" userInfo.profile ? false : true ">提交</van-button>
		</view>
	</view>
</template>

<script>
	export default {
		components: {
		},
		data() {
			return {
				userInfo: {},	// 用户信息
			}
		},
		// 监听页面卸载， 监听页面的卸载， 当前处于A页面，点击返回按钮时，则将是A页面卸载、
		onUnload() {
		},
		onReady(){
		},
		onShow(){
			let that = this;
			uni.getStorage({
			    key: 'userInfo',
			    success: function (res) {
					that.userInfo = res.data;
				}
			});
		},
		onLoad(){
		},
		// 监听页面的隐藏,当从当前A页跳转到其他页面，那么A页面处于隐藏状态。
		onHide(){
		},
		methods: {
			// 用户发帖--内容和图片, 将该帖子关联该用户
			publish(){
				let that = this;
				if(that.userInfo.profile.length > 150){
					uni.showToast({
					    title: '长度不超过150个字符',
					    icon: 'none'
					});
					return 
				}
				uni.showLoading({
					title: '加载中'
				});
				const query = that.Bmob.Query('_User');
				query.set('id', that.userInfo.objectId) //需要修改的objectId
				query.set('profile', that.userInfo.profile)
				query.save().then(res => {
					query.get(that.userInfo.objectId).then(res1 => {
						//更新登陆状态
						uni.setStorage({
						  key: 'userInfo',
						  data: res1,
						  success: function () {
							console.log('保存成功')
							uni.navigateBack()
						  }
						});
					})
				}).catch(err => {
					console.log(err)
				})
			},
		},
	}
</script>

<style>
	.tui-cells {
	  border-radius: 4upx;
	  height: 280upx;
	  box-sizing: border-box;
	  padding: 20upx 20upx 0 20upx;
	  position: relative;
	}
	
	.tui-cells::after {
	  content: '';
	  position: absolute;
	  height: 200%;
	  width: 200%;
	  border: 1px solid #e6e6e6;
	  transform-origin: 0 0;
	  -webkit-transform-origin: 0 0;
	  -webkit-transform: scale(0.5);
	  transform: scale(0.5);
	  left: 0;
	  top: 0;
	  border-radius: 8upx;
	}
	
	.tui-textarea {
	  height: 210upx;
	  width: 100%;
	  color: #666;
	  font-size: 28upx;
	}
	
	.tui-phcolor-color {
	  color: #ccc !important;
	}
	
	.tui-textarea-counter {
	  font-size: 24upx;
	  color: #999;
	  text-align: right;
	  height: 40upx;
	  line-height: 40upx;
	  padding-top: 4upx;
	}
	.tui-cmt-btn{
	  margin-top: 60upx;
	}
	.uni-list-cell::after {
		left: 0;
	}
</style>
