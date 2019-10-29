<template>
  <!-- 列表单个 -->
  <view class="font-14 post-item" @click="handleSelf">
    <view class="flex-space-between">
      <view class="flex-align-center" @click.stop="toZone(postObj)">
        <img class="van-avatar" :src="postObj.author.avatarUrl">
        <view class="mgl10">
          <view>{{postObj.author.nickName}}</view>
          <view class="dy-font-color font-12">{{postObj.createdAt}}</view>
        </view>
      </view>
      <!-- 右边位置 -->
      <view class="flex-center">
        <view v-if=" myObjectId !== postObj.author.objectId " class="flex">
		  <view class="" @click.stop="addFollow(postObj)"><van-button icon="plus" type="default" size="small">关注</van-button></view>
		  <view class="mgl5 font-20">
			  <van-icon name="ellipsis" color="dy-font-color" size="24px" 
				@click.stop="navTo('/pages/setting/accusation?postId=' + postObj.objectId + '&beReportedUserId=' + postObj.author.objectId)" 
			  />
		  </view>
        </view>
		<view class="" @click.stop="deletePost(postObj)" v-if="showPostOpt && myObjectId === postObj.author.objectId">
		  <van-icon name="ellipsis" color="dy-font-color" size="24px"  />
		</view>
      </view>
    </view>
    <view class="pd5">
       <text class="contentsHtml">{{postObj.contents}}</text>
    </view>
    <!-- 图片区域 -->
    <view class="img-zone" v-if="images.length !== 0">
      <view v-for="(imgItem, imgIndex) in postObj.images" :key="imgIndex" v-if="images.length !== 0" class="img-cell">
        <img :src="imgItem" @click.stop="preImg(imgIndex)" class="img-item"/>
      </view>
    </view>
    <!-- 底部，评论，点赞，转发区域 -->
    <view class="flex-space-around" v-if="showPostOpt">
      <!-- 查看人次 -->
      <view class="flex-center width-33 tcenter" style="vertical-align: middle;">
		  <view><van-icon size="20px" name="eye-o" /></view>
          <view class="font-14 pdb5 mgl5">{{postObj.view}}</view>
      </view>
      <!-- 评论 -->
      <view class="flex-center width-33 tcenter">
        <view><van-icon size="20px" name="comment-o" /></view>
        <view class="font-14 pdb5 mgl5">{{postObj.comments}}</view>
      </view>
      <!-- 转发分享 -->
      <view @click.stop="sharePost(postObj)" class="flex-center width-33 tcenter item-share">
        <button open-type="share" class="width-100 share-btn"><van-icon size="20px" name="share" /></button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  // 父子通信
  props: {
    postObj: {
      type: Object,
      default: function(){
      	return {};
      }
    },
	postType:{
		type: Number,
		default: 0,	// 0 -- 默认  1 -- 自己作品
	},
	showPostOpt: {
      type: Boolean,
      default: true,
    },
  },
  components : {
  },
  data () {
    return {
		myObjectId: '',	// 我的 id
    };
  },
  mounted () {
	let that = this;
	uni.getStorage({
		key: 'userInfo',
		success: function (res) {
			that.myObjectId = res.data.objectId;
		}
	});
  },
  computed: {
    isLogin () {
	  return true;
    },
  },
  methods: {
	toZone(){
		if(this.myObjectId !== this.postObj.author.objectId){
			this.navTo('/pages/user/otherzone?userId=' + this.postObj.author.objectId)
		}else{
			uni.switchTab({ url: '/pages/user/myzone' })
		}
	},
	// 跳转
	navTo(url){
		uni.navigateTo({ url: url })
	},
	handleSelf(){
		if(this.showPostOpt) this.navTo('/pages/post/postDetail?postId=' + this.postObj.objectId)
	},
    // 点击分享
    sharePost (item) {
      let sharePopShow = true;
      let itemIsTop = true;
      this.$emit('on-share-post', sharePopShow, itemIsTop)
    },
    // 加关注
    addFollow: function (item) {
      uni.showLoading({
      	title: '加载中',
		mask: true,
      });
      let that = this;
      
      // 先查询是否关注
      const query = that.Bmob.Query('userList');
      query.equalTo("userId","==", that.myObjectId);
      
      const userDB = that.Bmob.Pointer('_User')
      const myId = userDB.set(that.myObjectId)
      const otherId = userDB.set(item.author.objectId)
      
      query.find().then(res => {
      	if(res.length === 0){
      		// 添加关注  实际插入记录 
      		query.set('userIdStr',that.myObjectId)	// 绑定的用户id
      		query.set('beFollowedUserIdStr',item.author.objectId)	// 绑定的用户id string类型
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
					title: '取消关注'
				})
      		})
      	}
      }).catch(err => {
        
      })
    },
	// 删除帖子
	deletePost: function (postObj) {
		let that = this;
		uni.showModal({
		    title: '提示',
		    content: '删除后，所有相关的信息都将被删除，是否删除？',
		    success: function (res) {
		        if (res.confirm) {
					// 删除帖子
					const query = that.Bmob.Query('postList');
					query.destroy(postObj.objectId).then(res => {
						that.$emit('on-delete-post')
					}).catch(err => {
					  console.log(err)
					})
					// 删除帖子相关的收藏
					const favorite = that.Bmob.Query('favorite');
					favorite.equalTo("postId", "==", postObj.objectId);
					favorite.find().then(todos => {
					  todos.destroyAll().then(res => {
					    console.log(res,'ok')
					  })
					})
					// 删除帖子相关的评论
					const comment = that.Bmob.Query('comment');
					comment.equalTo("attrPost", "==", postObj.objectId);
					comment.find().then(todos => {
					  todos.destroyAll().then(res => {
					    console.log(res,'ok')
					  })
					})
		        } else if (res.cancel) {
		            console.log('用户点击取消');
		        }
		    }
		});
    },
    // 图片预览
    preImg(index) {
    	uni.previewImage({
    		current: this.postObj.images[index],
    		urls: this.postObj.images
    	})
    },
  }
};
</script>

<style lang='scss'>
  .post-item{
	line-height: 1.8;
  }
  .img-zone{
    display: flex;
    flex-wrap: wrap;
  }
  .img-cell{
    box-sizing: border-box;
    width: 33.33%;
    padding: 0 5px 5px 0;
  }
  .img-cell:nth-child(3n){
    box-sizing: border-box;
    width: 33.33%;
    padding: 0 0 5px 0;
  }
  .img-item{
    background-size: cover;
    background-repeat: no-repeat;
    width: 100%;
    height: 120px;
	overflow: hidden;
  }
  .contentsHtml{
	word-wrap: break-word;
  }
</style>