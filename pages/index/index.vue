<template>
	<view class="font-14">
		<view class="pdl15 pdr15 flex-space-between">
			<view class="flex-align-center">
				<picker @change="bindPickerChange" :value="pickIndex" :range="pickList" range-key="name">
					<view class="flex-align-center">
						<view class="uni-input">{{pickList[pickIndex].name}}</view><van-icon name="arrow-down" />
					</view>
				</picker>
			</view>
			<van-search
			  :value="value"
			  placeholder="请输入搜索关键词"
			  use-action-slot
			  @search="onSearch"
			>
			  <view slot="action" @search="onSearch">搜索</view>
			</van-search>
		</view>
		<swiper class="pdl15 pdr15 swiper" :indicator-dots="true" :autoplay="true" :interval="2000" :duration="500">
			<swiper-item v-for="(item, index) in bannerList" :key="index">
				<image :src="item.url" class="banner-img img-common"></image>
			</swiper-item>
		</swiper>
		<!-- 菜单分类 -->
		<view class="pdl15 pdr15 flex-wrap pdt10 pdb5">
		  <view class="classify-item" v-for="(item, index) in postClassList" :key="index" @click="navTo('/pages/post/postList?title=' + item.name + '&classId=' + item.objectId)">
			<navigator url="navigate/navigate?title=navigate"  >
			  <view><img :src="item.imgUrl"  class="van-avatar-large" /></view>
			  <view>{{item.name}}</view>
			</navigator>
		  </view>
		</view>
		<view class="wx-bg space-10"></view>
		<!-- 帖子列表 -->
		<view class="wx-bg">
			<view class="mgb10 white-bg pdl15 pdr15 pdt15 pdb5" v-for="item in postList" :key="item.objectId" @click="navTo('/pages/post/postDetail?postId=' + item.objectId)">
				<postCard :postObj="item"></postCard>
			</view>
		</view>
		<!-- 底部空隙 -->
		<view class="bottom-space flex-center dy-font-color border-top">{{ pageSetting.pageIndex > pageSetting.totalPage ? '已经到底了' : '' }}</view>
	</view>
</template>

<script>
	// import Bmob from '@/utils/bmob.js'
	import postCard from '@/components/postCard';
	export default {
		components: {
			postCard
		},
		data() {
			return {
				value: '',	// 搜索内容
				pageSetting: {
					pageIndex: 1,	// 页码
					pageSize: 10,	// 每页页数
					totalPage: 1,	// 总页数
					totalSize: 0,	// 总条数数
				},
				bannerList: [],	// 菜单分类列表
				postClassList: [],	// 帖子分类
				postList: [],	// 帖子列表
				pickIndex: 0,
				pickList: [{name: '不限'}],
				localId: '',	// 地址的id， 默认为空
			}
		},
		computed: {
		},
		async onLoad() {
			let that = this;
			//	获取地址
			uni.getStorage({
			    key: 'localId',
			    success: function (res) {
					that.localId = res.data ? res.data : ''; 
			    }
			});
			this.getLocalList();
			this.getBannerList();
			this.getPostClassList();
		},
		onReady(){
		},
		onShow(){
			this.getPostList();
		},
		// 分享
		onShareAppMessage() {
			return {
				title: '微撩',
				path: '/pages/index/index'
			}
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.pageSetting.pageIndex = 1;
			this.postList = [];
			this.getPostList();
			setTimeout(function () {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		// 到底
		onReachBottom(){
			if (this.pageSetting.pageIndex <= this.pageSetting.totalPage) {
				//设置列表数据
				this.getPostList()
			}
		},
		methods: {
			// 详情、结果
			navTo(url){
				uni.navigateTo({ url: url })
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
				  that.pickList.forEach( (v, i) => {
					  if(v.objectId === that.localId){
						that.pickIndex = i
					  }
				  })
				});
			},
			// 获取广告图片
			getBannerList() {
				let that = this;
				uni.showLoading({
					title: '加载中'
				});
				var query = that.Bmob.Query('banner');
				query.limit(5);
				// 查询所有数据
				query.find().then(res => {
				  uni.hideLoading();
				  that.bannerList = res;
				});
			},
			// 获取帖子分类
			getPostClassList() {
				let that = this;
				uni.showLoading({
					title: '加载中'
				});
				var query = that.Bmob.Query('postClass');
				query.limit(5);
				// 查询所有数据
				query.find().then(res => {
				  uni.hideLoading();
				  that.postClassList = res;
				});
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
				query.order("-updatedAt");
				query.include("author,belongsClass", "_User,postClass");
				// 如果选择了地址，则关联地址
				if(that.localId){
					query.equalTo("belongsLocal", "==", that.localId);
				}
				
				query.count().then(res => {
					if(res.count === 0){
						that.postList = []
						uni.hideLoading();
					}else{
						that.pageSetting.totalPage = parseInt(res.count/that.pageSetting.pageSize) + 1
						query.find().then(res => {
							uni.hideLoading();
							that.pageSetting.pageIndex += 1;
							that.postList = that.postList.concat(res);
						});
					}
				});
			},
			// 切换pick地址选择
			bindPickerChange: function(e) {
				let that = this;
				this.pickIndex = e.target.value
				this.localId = this.pickList[parseInt(this.pickIndex)].objectId ? this.pickList[parseInt(this.pickIndex)].objectId : ''
				//更新地址
				uni.setStorage({
				  key: 'localId',
				  data: that.localId,
				  success: function () {
					  console.log('更新地址成功')
				  }
				});
				that.postList = [];
				that.pageSetting.pageIndex = 1;
				that.getPostList()
			},
		}
	}
</script>

<style lang='scss'>
  .classify-item{
	width: 25%;
	text-align: center;
	line-height: 30px;
  }
  .banner-img{
	  width: 345px;
  }
</style>
