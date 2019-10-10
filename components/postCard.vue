<template>
  <!-- 列表单个 -->
  <view class="font-14">
    <view class="flex-space-between">
      <view class="flex-align-center" @click.stop="toUserZone">
        <img class="van-avatar" :src="postObj.author.avatarUrl">
        <view class="mgl10">
          <view>{{postObj.author.nickName}}</view>
          <view class="dy-font-color font-12 mgt5">{{postObj.createdAt}}</view>
        </view>
      </view>
      <!-- 右边位置 -->
      <view class="flex-center">
        <view v-if=" myObjectId !== postObj.author.objectId " @click.stop="addFollow(postObj)">
          <van-button icon="plus" type="default" size="small">+关注</van-button>
        </view>
		<view class="" v-else @click.stop="deletePost(postObj)">
		  <van-icon name="ellipsis" />
		</view>
      </view>
    </view>
    <view class="pd5">
       <text>{{postObj.contents}}</text>
    </view>
    <!-- 图片区域 -->
    <view class="img-zone" v-if="images.length !== 0">
      <view v-for="(imgItem, imgIndex) in postObj.images" :key="imgIndex" v-if="images.length !== 0" class="img-cell">
        <img :src="imgItem" @click.stop="preImg(imgIndex)" class="img-item"/>
      </view>
    </view>
    <!-- 底部，评论，点赞，转发区域 -->
    <view class="flex-space-around" v-if="showPostOpt">
      <!-- 喜欢收藏 -->
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
    // 点击分享
    sharePost (item) {
      let sharePopShow = true;
      let itemIsTop = true;
      this.$emit('on-share-post', sharePopShow, itemIsTop)
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
				setTimeout( ()=> {
					that.updatePost(that.myObjectId, 'follows', 'add', true)
				}, 1000)
      		})
      	}else{
      		// 取消关注  实际删除记录
      		query.destroy(res[0].objectId).then(res2 => {
				uni.showToast({
					title: '取消关注'
				})
				setTimeout( ()=> {
					that.updatePost(that.myObjectId, 'follows', false)
					uni.hideLoading();
				}, 1000)
      		})
      	}
      }).catch(err => {
        
      })
    },
	// 删除帖子
	deletePost: function (item) {
		let that = this;
		uni.showModal({
		    title: '提示',
		    content: '删除后，所有相关的信息都将被删除，是否删除？',
		    success: function (res) {
		        if (res.confirm) {
		            that.$emit('on-delete-post')
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
	// 更新用户表的关注数
	updatePost(userId, param, isAdd) {
		let that = this;
		uni.showLoading({ title: '加载中' });
		var query = that.Bmob.Query('_User');		
		query.get(userId).then(res => {
			if(isAdd){
				res.increment(param)	// 原子计算 自加1 传入第二个参数,支持正负数，到increment方法来指定增加或减少多少，1是默认值。
			}else{
				res.increment(param, -1)
			}
		    res.save()
			uni.hideLoading();
		}).catch(err => {
		  console.log(err)
		})
	},
    // 前往用户主页
    toUserZone () {
      this.$router.push({ name: 'userzone', params: '' })
    },
    // 前往帖子分类
    toPostClassify (item) {
      this.$router.push({ name: 'postClassify', params: { containerid: item.containerid }})
    },
  }
};
</script>

<style lang='scss'>
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
    height: 100%;
  }
</style>