<template>
	<view class="wx-bg">
		<view class="white-bg pdl15 pdr15 pdt15 pdb5">
			<postCard :postObj="postInfo" :showPostOpt="false"></postCard>
		</view>
		<view class="flex-space-around font-24 white-bg mgb10">
			<view class="font-24 width-50 tcenter" @click="addFavorite"><van-icon :name=" isFavorite ? 'like' : 'like-o' " :color=" isFavorite ? 'red' : '' " /></view>
			<button open-type="share" class="width-50 share-btn"><van-icon size="24px" name="share" /></button>
		</view>
		<view class="mgt10 white-bg pdt10">
			<view class="flex-space-between mgl15 mgr15 mgt10 comment-border">
				<view class="mgl10">评论列表</view>
				<view class="dy-font-color">共<text class="black-color mgl5 mgr5">{{commentsList.length}}</text>条评论</view>
			</view>
		</view>
		<view class="white-bg">
			<view class="tcenter" v-if="commentsList.length === 0" >
				<view class="pdt20"><image src="/static/logo/no-data.png" class="pdt20 no-data"></image></view>
				<view class="pdt20 pdb20 dy-font-color">暂无评论，快来发表你的评论吧</view>
			</view>
			<view class="pd15 border-bottom" v-else v-for="(item,index) in commentsList" :key="item.objectId">
				<view class=" flex-space-between">
					<view class="flex-align-center">
						<image :src="item.own.avatarUrl" class="van-avatar-large"></image>
						<view class="mgl10">
							<view class="">{{item.own.nickName}}</view>
							<view class="dy-font-color">{{ item.updatedAt }}</view>
						</view>
					</view>
					<view class="flex font-12 dy-font-color">
						<view>{{index + 1}}楼</view>
						<view class="mgl5" @click="reply(item)">回复ta</view>
					</view>
				</view>
				<view class="mgt10">{{item.content}}</view>
			</view>
		</view>
		<view class="bottom-space white-bg"></view>
		<view class="width-100 pdt5 pdb5 pdl10 pdr10 flex-space-between border-top white-bg input-cmt-zone">
		  <input type="text" class="width-80 mgt10 mgb10" placeholder="期待您的评论" v-model="commentValue" />
		  <van-button type="info" size="small" class="width-20" :disabled=" commentValue ? false : true" @click="sendComments">发送</van-button>
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
				info: {
					objectId: '',	// 用户Id
				},
				commentValue: '',	// 评论内容
				postId: '',	// 帖子id
				postInfo: {},	// 帖子信息
				postAuthor: '',	// 发帖用户id
				commentsList: [],	// 评论列表
				isFavorite: false,	// 是否收藏
			}
		},
		computed: {
		},
		async onLoad(option) {
			let that = this;
			if(option.postId === "undefined"){
				uni.showModal({
				    title: '糟糕！',
				    content: '帖子找不到了',
					showCancel: false,
				    success: function (res) {
				        if (res.confirm) {
				            uni.navigateBack()
				        } 
				    }
				});
			}else{
				this.postId = option.postId ? option.postId : '8604d6bb67';
				uni.getStorage({
					key: 'userInfo',
					success: function (res) {
						that.info.objectId = res.data.objectId;
						that.getPostFavoriteStatus();
					}
				});
				this.getPost();
				this.getComments();
				this.updatePost('view')
			}
		},
		onReady(){
		},
		// 分享
		onShareAppMessage() {
			return {
				title: '邀请您使用小镇事事通',
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
			// 获取帖子状态
			getPostFavoriteStatus(){
				let that = this;
				const query = that.Bmob.Query('favorite');
				query.equalTo("userId","==", that.info.objectId);
				query.equalTo("postIdStr","==", that.postId);
				query.find().then(res => {
					if(res.length === 0){
						that.isFavorite = false;
					}else{
						that.isFavorite = true;
					}
					uni.hideLoading();
				}).catch(err => {
				  
				})
			},
			// 获取帖子
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
					that.postAuthor = res.author.objectId;
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
					that.commentsList = []
				    that.commentsList = res;
					uni.hideLoading();
				});
			},
			// 回复某人
			reply(item){
				this.commentValue = '@' +  item.own.nickName + ' '
			},
			// 发表评论
			sendComments () {
				uni.showLoading({
					title: '加载中'
				});
				let that = this;
				
				that.Bmob.checkMsg(that.commentValue).then(res => {
					var currentUser = that.Bmob.User.current(); // 当前用户
					var objectId = currentUser.objectId; // 当前用户Id
					
					// Pointer 类型在数据库是一个json数据类型，只需调用Pointer方法创建一个Pointer对象存入到字段中，如下：
					const pointerUser = that.Bmob.Pointer('_User')
					const pUserID = pointerUser.set(objectId)
					
					const pointerPost = that.Bmob.Pointer('postList')
					const pPostID = pointerPost.set(that.postId)
					
					var query = that.Bmob.Query('comment');
					
					query.set('own',pUserID)	// 绑定的用户id
					query.set('attrPost',pPostID)	// 绑定的帖子id
					query.set('attrPostStr',that.postId)	// 绑定的帖子id 字符串 用来删除
					query.set("content", that.commentValue)
					query.save().then(res => {
						// uni.hideLoading();
						uni.showToast({
							title: '评论成功',
							icon: 'success',
							duration: 1500
						})
						that.commentValue = '';
						setTimeout( () => {
							that.updatePost('comments');
							that.getComments();
						}, 1000);
					}).catch(err => {
					  console.log(err)
					})
				}).catch(err => {
					let tips = '错误类型：' + err.code + '，' + err.error;
					if(err.code === 10007){
						tips = '输入内容含有敏感词，请文明用语'
					}
					uni.showToast({
						title: tips,
						icon: 'none'
					})
				})
			},
			// 更新帖子表的评论数
			updatePost(param) {
				let that = this;
				var query = that.Bmob.Query('postList');		
				query.get(that.postId).then(res => {
				  res.increment(param)	// 原子计算 自加1 传入第二个参数,支持正负数，到increment方法来指定增加或减少多少，1是默认值。
				  res.save()
				}).catch(err => {
				  console.log(err)
				})
			},
			// 帖子添加收藏与取消收藏
			addFavorite(){
				uni.showLoading({
					title: '加载中'
				});
				let that = this;
				
				// 先查询是否收藏
				const query = that.Bmob.Query('favorite');
				query.equalTo("userId","==", that.info.objectId);
				query.equalTo("postIdStr","==", that.postId);
				
				const favorite = that.Bmob.Pointer('favorite')
				const fid = favorite.set(that.postId)
				// query.equalTo("postId","==", fid);
				
				query.find().then(res => {
					if(res.length === 0){
						// 添加收藏  实际插入记录 
						query.set('userId',that.info.objectId)	// 绑定的用户id -- 谁喜欢
						query.set('postId',fid)	// 绑定的用户id poster类型
						query.set('postIdStr',that.postId)	// 绑定的用户id string类型
						// query.set('whoLikesUserId', that.postInfo.author.objectId)	// 帖子作者
						
						const authorInfo = that.Bmob.Pointer('_User')
						const postAuthor = authorInfo.set(that.postAuthor)
						query.set('author',postAuthor)	// 绑定的发帖用户id poster类型
						
						query.save().then(res1 => {
							that.isFavorite = true;
							uni.hideLoading();
						})
					}else{
						// 取消收藏  实际删除记录
						query.destroy(res[0].objectId).then(res2 => {
						  that.isFavorite = false;
						  uni.hideLoading();
						})
					}
				}).catch(err => {
				  
				})
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
