<template>
	<view class="wx-bg">
		<!-- 顶部 用户信息 -->
		<view class="white-bg flex-space-between pdl15 pdr15 pdt10">
			<view class="flex-align-center">
				<image :src="info.avatarUrl" class="van-avatar-large"></image>
				<view class="mgl10">
					<view class="flex-align-center">
						<text>{{info.nickName}}</text>
						<image :src="info.gender === 1 ? '/static/logo/nan.png' : '/static/logo/nv.png' " class="mgl5 van-avatar-small"></image>
					</view>
					<view class="">{{ info.autograph ? info.autograph : '暂无签名' }}</view>
				</view>
			</view>
			<view class="font-20">
				<van-icon name="setting-o" />
			</view>
		</view>
		<!-- 获赞 粉丝 关注 -->
		<view class="flex-space-around pdt15 white-bg">
			<view class="tcenter">
				<view class="font-16">{{info.praise}}</view>
				<view class="font-12 dy-font-color">获赞</view>
			</view>
			<view class="tcenter" @click="navTo('/pages/user/myfans')">
				<view class="font-16">{{info.follows}}</view>
				<view class="font-12 dy-font-color">关注</view>
			</view>
			<view class="tcenter" @click="navTo('/pages/user/myfans')">
				<view class="font-16">{{info.fans}}</view>
				<view class="font-12 dy-font-color">粉丝</view>
			</view>
		</view>
		<view class="white-bg space"></view>
		<van-tabs sticky swipeable class="mgt15 van-tabs-self">
		  <van-tab title="作品">
			<!-- 帖子列表 -->
			<view class="wx-bg">
				<view class="mgb10 white-bg pdl15 pdr15 pdt15 pdb5" v-for="item in postList" :key="item.objectId" @click="navToDetails(item.objectId)">
					<postCard :postObj="item"></postCard>
				</view>
			</view>
		  </van-tab>
		  <van-tab title="喜欢">
			<!-- 帖子列表 -->
			<view class="wx-bg">
				<view class="mgb10 white-bg pdl15 pdr15 pdt15 pdb5" v-for="item in postList" :key="item.objectId" @click="navToDetails(item.objectId)">
					<postCard :postObj="item"></postCard>
				</view>
			</view>
		  </van-tab>
		</van-tabs>
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
				info: {
					objectId: '',	// 用户Id
					nickName: '未登录',	// 用户昵称
					avatarUrl: '/static/logo/no-login.png',	// 头像
					gender: 1,	// 性别 1-男
					autograph: '签名',	// 签名
					follows: 0,	// 关注数
					fans: 0,	// 粉丝数
					praise: 0,	// 赞数
				},
				pageSetting: {
					pageIndex: 1,	// 页码
					pageSize: 10,	// 每页页数
					totalPage: 1,	// 总页数
					totalSize: 0,	// 总条数数
				},
				postList: [],	// 帖子列表
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
			    }
			});
		},
		onReady(){
			this.getUserInfo();
			this.getPostList();
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
				this.getPostList()
			}
		},
		methods: {
			// 跳转
			navTo(url){
				uni.navigateTo({
					url: url + '?objectId=' + this.info.objectId
				})
			},
			// 详情、结果
			navToDetails(id){
				uni.navigateTo({
					url: '/pages/post/postDetail?postId=' + id
				})
			},
			// 获取用户信息
			getUserInfo () {
				let that = this;
				uni.showLoading({
					title: '加载中'
				});
				const query = that.Bmob.Query('_User');
				query.get(that.userInfo.objectId).then(res => {
					that.info = res;
				    console.log(res)
					uni.hideLoading();
				}).catch(err => {
				  console.log(err)
				})
			},
			// 获取帖子列表
			getPostList() {
				let that = this;
				uni.showLoading({
					title: '加载中'
				});
				var query = that.Bmob.Query('postList');
				query.limit(10);	// 每页条数
				query.skip(10 * (that.pageSetting.pageIndex - 1));	// 分页查询// 对score字段降序排列
				query.order("-createdAt");
				query.include("author", "_user");
				query.equalTo("author", "==", that.info.objectId);
				query.count().then(res => {
					if(res.count === 0){
						that.postList = []
					}else{
						that.pageSetting.totalPage = parseInt(res.count/that.pageSetting.pageSize) + 1
						query.find().then(res => {
							that.pageSetting.pageIndex += 1;
							that.postList = that.postList.concat(res);
							uni.hideLoading();
						});
					}
				});
			},
		}
	}
</script>

<style lang='scss'>
	.space{
		height: 15px;
	}
	.van-avatar-small{
		background-color: #fff;
		width: 18px;
		height: 18px;
	}
	.van-tabs-self .van-tab {
		padding-top: 5px;
	}
</style>
