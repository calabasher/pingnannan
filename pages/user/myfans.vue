<template>
	<view class="wx-bg">
		<view class="white-bg mgb10 pd15 flex-space-between" v-for="item in userList" :key="item.objectId" @click="navTo(item)">
			<view class="flex-align-center">
				<view class="">
					<image class="van-avatar" :src="item.avatarUrl"></image>
				</view>
				<view class="mgl10">
					<view class="flex-align-center">
						<view class="">{{item.nickName}}</view>
						<image :src="item.gender === 1 ? '/static/logo/nan.png' : '/static/logo/nv.png' " class="mgl5 van-avatar-small"></image>
					</view>
					<view class="">{{ item.autograph ? item.autograph : '暂无签名' }}</view>
				</view>
			</view>
			<view class="">
				<van-button icon="plus" @click.stop="addFollow(item)" type="default" size="small">+关注</van-button>
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
				title: '事事通',
				path: '/pages/index/index'
			}
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
			navTo(id){
				uni.navigateTo({
					url: '/pages/post/postDetail?postId=' + id
				})
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
				query.equalTo("userIdStr", "==", that.myObjectId);
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
