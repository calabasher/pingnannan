<template>
	<view class="pd15 mgt15">
		<view class="flex-align-center">
			<image src="/static/logo/logo.png" class="icon-img"></image>
			<text class="font-14 mgl5">xxx</text>
			<text class="font-14 mgl5">申请获得</text>
		</view>
		<view class="font-24 mgt15">以下权限</view>
		<view class="mgt20 flex">
			<view class="float-l radio-zone">
				<van-radio checked-color="#07c160"></van-radio>
			</view>
			<view class="float-l font-16">获得你的公开信息（昵称、头像、地区及性别）</view>
		</view>
		<view class="author-zone flex-center">
			<van-button type="primary" open-type="getUserInfo" @getuserinfo="getWxUserInfo"><text class="author-btn">同意</text></van-button>
		</view>
	</view>
</template>

<script>
	import { mapMutations } from 'vuex';
	export default {
		components: {
		},
		data() {
			return {
				
			}
		},
		// 监听页面卸载
		onUnload() {
		},
		onLoad(){
		},
		onHide(){
		},
		methods: {
			// 获取微信用户信息
			getWxUserInfo(){
				let that = this;
				uni.getUserInfo({
				  provider: 'weixin',
				  success: function (infoRes) {
					  that.Bmob.User.auth().then(res => {
						const query = that.Bmob.Query('_User');
						query.get(res.objectId).then(res => {
							res.set('nickName',infoRes.userInfo.nickName)
							res.set('avatarUrl',infoRes.userInfo.avatarUrl)
							res.set('gender',infoRes.userInfo.gender)
							res.save()
							//更新登陆状态
							uni.setStorage({
							  key: 'userInfo',
							  data: res,
							  success: function () {
								  console.log('保存成功')
								  uni.reLaunch({
									  url: '/pages/index/index'
								  });
							  }
							});
						  }).catch(err => {
						    console.log(err)
						  })
					  }).catch(err => {
						console.log(err)
					  });
				  }
				});
			}
		}
	}
</script>

<style>
	.icon-img{
		width: 20px;
		height: 20px;
	}
	.radio-zone{
		width: 30px;
		padding-top: 3px;
	}
	.radio-text{
		margin-left: 40px;
	}
	.author-zone{
		position: fixed;
		bottom: 80px;
		margin: auto;
		left: 0; 
		right: 0
	}
	.author-btn{
		display: block;
		width: 130px;
	}
</style>
