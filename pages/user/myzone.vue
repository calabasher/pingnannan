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
		<van-tabs sticky swipeable class="mgt15 van-tabs-self" :active="tabIndex" @change="onChangeTab">
		  <van-tab title="作品">
			<!-- 帖子列表 -->
			<view class="wx-bg">
				<view class="tcenter" v-if="postList.length === 0" >
					<view class="pdt20"><image src="/static/logo/no-data.png" class="pdt20 no-data"></image></view>
					<text class="pdt20 dy-font-color">暂无作品哟，感觉去发帖吧</text>
				</view>
				<view class="mgb10 white-bg pdl15 pdr15 pdt15 pdb5" v-for="(item, index) in postList" :key="item.objectId" @click="navToDetails(item.objectId)" v-else>
					<postCard :postObj="item" :postType="1" @on-delete-post="deletePost(item,index)"></postCard>
				</view>
				<view class="white-bg bottom-space flex-center dy-font-color border-top">{{ pageSetting.pageIndex > pageSetting.totalPage ? '已经到底了' : '' }}</view>
			</view>
		  </van-tab>
		  <van-tab title="喜欢">
			<!-- 帖子列表 -->
			<view class="wx-bg">
				<view class="tcenter" v-if="favoriteList.length === 0" >
					<view class="pdt20"><image src="/static/logo/no-data.png" class="pdt20 no-data"></image></view>
					<text class="pdt20 dy-font-color">暂无喜欢哟，去首页看看吧</text>
				</view>
				<view class="mgb10 white-bg pdl15 pdr15 pdt15 pdb5" v-for="item in favoriteList" :key="item.objectId" @click="navToDetails(item.postId.objectId)" v-else>
					<postCard :postObj="item.postId"></postCard>
				</view>
				<view class="white-bg bottom-space flex-center dy-font-color border-top">{{ pageSettingFav.pageIndex > pageSettingFav.totalPage ? '已经到底了' : '' }}</view>
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
				tabIndex: 0,	// 高亮tab
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
				pageSetting: {
					pageIndex: 1,	// 页码
					pageSize: 10,	// 每页页数
					totalPage: 1,	// 总页数
					totalSize: 0,	// 总条数数
				},
				pageSettingFav: {
					pageIndex: 1,	// 页码
					pageSize: 10,	// 每页页数
					totalPage: 1,	// 总页数
					totalSize: 0,	// 总条数数
				},
				postList: [],	// 帖子列表
				favoriteList: [],	// 收藏的帖子
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
			this.getPostList();		// 获取帖子列表 -- 自己作品
			this.getFavoriteList();		// 获取帖子列表 -- 收藏喜欢
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
		// 到底
		onReachBottom(){
			if(this.tabIndex === 0){
				if (this.pageSetting.pageIndex <= this.pageSetting.totalPage) {
					//设置列表数据
					this.getPostList()
				}
			}else{
				if (this.pageSettingFav.pageIndex <= this.pageSettingFav.totalPage) {
					//设置列表数据
					this.getFavoriteList()
				}
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
			// 切换tab
			onChangeTab(e){
				this.tabIndex = e.detail.index
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
			// 获取帖子列表 -- 自己作品
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
			// 获取帖子列表 -- 收藏喜欢
			getFavoriteList() {
				let that = this;
				uni.showLoading({
					title: '加载中'
				});
				var query = that.Bmob.Query('favorite');
				query.limit(10);	// 每页条数
				query.skip(10 * (that.pageSettingFav.pageIndex - 1));	// 分页查询// 对score字段降序排列
				query.order("-createdAt");
				query.include("author,postId", "_User,postList");
				query.equalTo("userId", "==", that.info.objectId);
				query.count().then(res => {
					if(res.count === 0){
						that.favoriteList = []
					}else{
						that.pageSettingFav.totalPage = parseInt(res.count/that.pageSettingFav.pageSize) + 1
						query.find().then(res => {
							that.pageSettingFav.pageIndex += 1;
							if(res.length > 0){
								res.forEach( (v, i) => {
									v.postId.author = v.author
								})
							}
							that.favoriteList = that.favoriteList.concat(res);
							uni.hideLoading();
						});
					}
				});
			},
			// 删除帖子
			deletePost: function (item, index) {
			  let that = this;
			  uni.showLoading();
			  const query = that.Bmob.Query('postList')
			  const favorite = that.Bmob.Query('favorite')
			  favorite.destroy(item.objectId).then(res => {
			    uni.hideLoading();
			  	that.postList.splice(index, 1)
			  })
			  query.destroy(item.objectId).then(res => {
			    uni.hideLoading();
				that.postList.splice(index, 1)
			  })
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
