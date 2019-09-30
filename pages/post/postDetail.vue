<template>
	<view class="wx-bg">
		<view class="white-bg pdl15 pdr15 pdt15 pdb5">
			<postCard :postObj="postInfo" :showPostOpt="false"></postCard>
		</view>
		<view class="flex-space-around font-24 white-bg mgb10">
			<view class="font-24 width-50 tcenter"><van-icon name="like-o" /></view>
			<button open-type="share" class="width-50 share-btn"><van-icon size="24px" name="share" /></button>
		</view>
		<view class="mgt10 white-bg pdt10">
			<view class="flex-space-between mgl15 mgr15 mgt10 comment-border">
				<view class="mgl10">评论列表</view>
				<view class="dy-font-color">共<text class="black-color mgl5 mgr5">{{commentsList.length}}</text>条评论</view>
			</view>
		</view>
		<view class="white-bg">
			<view class="pd15 border-bottom" v-for="item in commentsList" :key="item.objectId">
				<view class=" flex-space-between">
					<view class="flex-align-center">
						<image :src="item.own.avatarUrl" class="van-avatar-large"></image>
						<view class="mgl10">
							<view class="">{{item.own.nickName}}</view>
							<view class="dy-font-color">{{ item.updatedAt }}</view>
						</view>
					</view>
					<view class="font-14 dy-font-color">回复TA</view>
				</view>
				<view class="mgt10">{{item.content}}</view>
			</view>
		</view>
		<view class="bottom-space"></view>
		<view class="width-100 pdt5 pdb5 pdl10 pdr10 flex-space-between border-top white-bg input-cmt-zone">
		  <van-field
			:value="commentValue"
			class="width-80"
			placeholder="期待您的评论"
		  />
		  <van-button type="info" size="small" class="width-20" :disabled=" commentValue ? false : true">发送</van-button>
		</view>
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
				commentValue: '',	// 评论内容
				postId: '',	// 帖子id
				postInfo: {},	// 帖子信息
				commentsList: [],	// 评论列表
			}
		},
		computed: {
		},
		async onLoad(option) {
			this.postId = option.postId ? option.postId : '8604d6bb67';
			this.getPost();
			this.getComments();
		},
		onReady(){
		},
		// 分享
		onShareAppMessage() {
			return {
				title: '信息分享',
				path: '/pages/post/postDetail?postId=' + this.postId
			}
		},
		// 到底
		onReachBottom(){
			// if (this.pageSetting.pageIndex <= this.pageSetting.totalPage) {
			// 	//设置列表数据
			// 	this.getPost()
			// }
		},
		methods: {
			// 获取帖子列表
			getPost() {
				let that = this;
				uni.showLoading({
					title: '加载中'
				});
				const query = that.Bmob.Query('postList');
				query.include("author", "_user");
				query.get(that.postId).then(res => {
					uni.hideLoading();
					that.postInfo = res;
				    console.log(res)
				}).catch(err => {
				  console.log(err)
				})
			},
			// 获取评论列表
			getComments () {
				let that = this;
				uni.showLoading({
					title: '加载中'
				});
				const query = that.Bmob.Query("comment");
				query.equalTo("attrPost","==", that.postId);
				query.include("own", "_user");
				query.find().then(res => {
					uni.hideLoading();
				    that.commentsList = res;
				});
			}
		}
	}
</script>

<style lang='scss'>
	.comment-border{
		border-left: 2px solid red;
	}
	.input-cmt-zone{
		position: fixed;
		bottom: 0;
	}
</style>
