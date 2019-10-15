<template>
	<view class="font-14">
		<!-- 帖子列表 -->
		<view class="wx-bg">
			<view class="tcenter white-bg" v-if="postList.length === 0" >
				<view class="pdt20"><image src="/static/logo/no-data.png" class="pdt20 no-data"></image></view>
				<view class="pdt20 pdb20 dy-font-color">暂无帖子，你可以浏览其他帖子或者发帖</view>
			</view>
			<view class="mgb10 white-bg pdl15 pdr15 pdt15 pdb5" v-else v-for="item in postList" :key="item.objectId" @click="navTo('/pages/post/postDetail?postId=' + item.objectId)">
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
				classId: '',	// 分类Id
				pageSetting: {
					pageIndex: 1,	// 页码
					pageSize: 10,	// 每页页数
					totalPage: 1,	// 总页数
					totalSize: 0,	// 总条数数
				},
				postList: [],	// 帖子列表
				localId: '',	// 地址的id， 默认为空
			}
		},
		computed: {
		},
		async onLoad(option) {
			let that = this;
			that.classId = option.classId
			//	获取地址
			uni.getStorage({
			    key: 'localId',
			    success: function (res) {
					that.localId = res.data ? res.data : '';
					that.getPostList();
			    }
			});
			uni.setNavigationBarTitle({
			    title: option.title
			});
		},
		onReady(){
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
			this.getPostList();		// 获取帖子列表 
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
				query.equalTo("belongsClass", "==", that.classId);
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
	.no-data{
		width: 155px;
		height: 128px;
	}
</style>
