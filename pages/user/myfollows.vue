<template>
	<view class="wx-bg">
		<view class="white-bg tcenter" v-if="userList.length === 0" >
			<view class="pdt20"><image src="/static/logo/no-data.png" class="pdt20 no-data"></image></view>
			<view class="pdt20 pdb20 dy-font-color">暂无关注</view>
		</view>
		<view class="white-bg mgb10 pd15 flex-space-between" v-else v-for="(item, index) in userList" :key="item.objectId" @click="navTo('/pages/user/otherzone?userId=' + item.beFollowedUserId.objectId)">
			<view class="flex-align-center">
				<view class="">
					<image class="van-avatar" :src="item.beFollowedUserId.avatarUrl"></image>
				</view>
				<view class="mgl10">
					<view class="flex-align-center">
						<view class="">{{item.beFollowedUserId.nickName}}</view>
						<image :src="item.beFollowedUserId.gender === 1 ? '/static/logo/nan.png' : '/static/logo/nv.png' " class="mgl5 van-avatar-small"></image>
					</view>
				</view>
			</view>
			<view class="" v-if="item.beFollowedUserId.objectId !== myObjectId" @click.stop="addFollow(item)">
				<van-button icon="plus" type="default" size="small">关注</van-button>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex'; 
	import postCard from '@/components/postCard';
	export default {
		components: {
			postCard
		},
		data() {
			return {
				myObjectId: '',	// 我的id
				userObjectId: '',	// 用户Id
				userList: [],	// 用户列表
				pageSetting: {
					pageIndex: 1,	// 页码
					pageSize: 10,	// 每页页数
					totalPage: 1,	// 总页数
					totalSize: 0,	// 总条数数
				},
			}
		},
		computed: {
			...mapState(['hasLogin','userInfo'])
		},
		async onLoad(option) {
			let that = this;
			that.userObjectId = option.objectId ? option.objectId : '17320dda35' ;
			uni.getStorage({
			    key: 'userInfo',
			    success: function (res) {
					that.myObjectId = res.data.objectId;
			    }
			});
		},
		onReady(){
			this.getUserList();
		},
		// 分享
		onShareAppMessage() {
			return {
				title: '关注列表',
				path: '/pages/user/myfollows?objectId=' + this.userObjectId
			}
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.pageSetting.pageIndex = 1;
			this.userList = [];
			this.getUserList();		// 获取用户列表 
			setTimeout(function () {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		// 到底
		onReachBottom(){
			if (this.pageSetting.pageIndex <= this.pageSetting.totalPage) {
				//设置列表数据
				this.getUserList()
			}
		},
		methods: {
			// 详情、结果
			navTo(url){
				uni.navigateTo({ url: url })
			},
			// 获取用户列表
			getUserList() {
				let that = this;
				uni.showLoading({
					title: '加载中'
				});
				var query = that.Bmob.Query('userList');
				query.limit(10);	// 每页条数
				query.skip(10 * (that.pageSetting.pageIndex - 1));	// 分页查询// 对score字段降序排列
				query.equalTo("userIdStr", "==", that.userObjectId);
				query.include("beFollowedUserId", "_User");
				query.count().then(res => {
					if(res.count === 0){
						that.userList = []
						uni.hideLoading();
					}else{
						that.pageSetting.totalPage = parseInt(res.count/that.pageSetting.pageSize) + 1
						query.find().then(res => {
							that.pageSetting.pageIndex += 1;
							that.userList = that.userList.concat(res);
							uni.hideLoading();
						});
					}
				});
			},
			// 加关注
			addFollow: function (item) {
			  uni.showLoading({
			  	title: '加载中'
			  });
			  let that = this;
			  
			  // 先查询是否关注
			  const query = that.Bmob.Query('userList');
			  query.equalTo("userId","==", that.myObjectId);
			  
			  const userDB = that.Bmob.Pointer('_User')
			  const myId = userDB.set(that.myObjectId)
			  const otherId = userDB.set(item.beFollowedUserId.objectId)
			  
			  query.find().then(res => {
			  	if(res.length === 0){
			  		// 添加关注  实际插入记录 
			  		query.set('userIdStr',that.myObjectId)	// 绑定的用户id
			  		query.set('beFollowedUserIdStr',item.beFollowedUserId.objectId)	// 绑定的用户id string类型
					query.set('userId',myId)	// 绑定的用户id poster类型
					query.set('beFollowedUserId',otherId)	// 绑定的用户id string类型
			  		
			  		query.save().then(res1 => {
			  			uni.showToast({
			  				title: '成功关注'
			  			})
			  			uni.hideLoading();
			  		})
			  	}else{
			  		// 取消关注  实际删除记录
			  		query.destroy(res[0].objectId).then(res2 => {
						uni.showToast({
							title: '已取消关注'
						})
			  		})
			  	}
			  }).catch(err => {
			    
			  })
			},
		}
	}
</script>

<style lang='scss'>
	.van-avatar-small{
		background-color: #fff;
		width: 18px;
		height: 18px;
	}
</style>
