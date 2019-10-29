<template>
	<view class="pd15 mgt15">
		<view class="flex-align-center">
			<image :src="mpInfo.logo" class="icon-img"></image>
			<text class="font-14 mgl5">{{mpInfo.mpName}}</text>
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
		<view class="author-cancel-zone flex-center">
			<van-button type="default" @click="cancelLogin"><text class="author-btn">拒绝</text></van-button>
		</view>
		<van-popup :show="localPop">
			<view class="tcenter pd15 font-16 border-bottom" :style="{ width: '300px' }">选择家乡</view>
			<van-radio-group :value="pickIndex">
			  <van-cell-group v-for="(item, index) in pickList" :key="index">
			    <van-cell
			      :title="item.name"
			      value-class="value-class"
			      clickable
			      :data-name="index"
				  @click="changeLocal"
			    >
			      <van-radio :name="index" />
			    </van-cell>
			  </van-cell-group>
			</van-radio-group>
			<van-button type="primary" size="large" @click="saveLocal">确定</van-button>
		</van-popup>
	</view>
</template>

<script>
	import { mapMutations, mapState } from 'vuex';
	export default {
		components: {
		},
		data() {
			return {
				localPop: false,
				pickIndex: 0,
				pickList: [{name: '不限'}],
			}
		},
		// 监听页面卸载
		onUnload() {
		},
		onLoad(){
			this.getLocalList();
		},
		onHide(){
		},
		computed: {
			...mapState(['mpInfo']),
		},
		methods: {
			...mapMutations(['login']),
			// 获取微信用户信息
			getWxUserInfo(){
				let that = this;
				uni.showLoading({
					title: '授权登录中'
				});
				uni.getUserInfo({
				  provider: 'weixin',
				  success: function (infoRes) {
					  that.Bmob.User.auth().then(res => {
						console.log('授权成功')
						const query = that.Bmob.Query('_User');
						query.get(res.objectId).then(res => {
							res.set('nickName',infoRes.userInfo.nickName)
							res.set('avatarUrl',infoRes.userInfo.avatarUrl)
							res.set('gender',infoRes.userInfo.gender)
							res.set('profile', '')
							res.set('praise', 0)
							res.set('follows', 0)
							res.set('fans', 0)
							res.save()
							that.login(res);	// 存储登录信息
							//更新登陆状态
							uni.setStorage({
							  key: 'userInfo',
							  data: res,
							  success: function () {
								  uni.hideLoading();
								  that.localPop = true;
							  }
							});
						  }).catch(err => {
						    console.log(err)
						  })
					  }).catch(err => {
						console.log(err)
						uni.showToast({
							title: '授权失败，请退出重试',
							icon: 'none'
						})
					  });
				  }
				});
			},
			cancelLogin(){
				uni.reLaunch({ url: '/pages/index/index' });
			},
			// 获取地址列表
			getLocalList() {
				let that = this;
				uni.showLoading({
					title: '加载中'
				});
				var query = that.Bmob.Query('local');
				// 查询所有数据
				query.find().then(res => {
				  uni.hideLoading();
				  that.pickList = that.pickList.concat(res);
				});
			},
			changeLocal (event) {
				this.pickIndex = parseInt(event.currentTarget.dataset.name)
			},
			// 切换pick地址选择
			saveLocal() {
			 	let that = this;
			 	this.localId = this.pickList[parseInt(this.pickIndex)].objectId ? this.pickList[parseInt(this.pickIndex)].objectId : ''
			 	//更新地址
			 	uni.setStorage({
			 	  key: 'localId',
			 	  data: that.localId,
			 	  success: function () {
			 		  console.log('更新地址成功')
					  uni.reLaunch({
						  url: '/pages/index/index'
					  });
			 	  }
			 	});
			 },
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
		bottom: 110px;
		margin: auto;
		left: 0; 
		right: 0
	}
	.author-cancel-zone{
		position: fixed;
		bottom: 50px;
		margin: auto;
		left: 0; 
		right: 0
	}
	.author-btn{
		display: block;
		width: 130px;
	}
</style>
