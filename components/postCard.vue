<template>
  <!-- 列表单个 -->
  <view class="font-14">
    <view class="flex-space-between">
      <view class="flex" @click.stop="toUserZone">
        <img class="van-avatar" :src="postObj.author.userPic">
        <view class="mgl10">
          <view>{{postObj.author.nickName}}</view>
          <view class="dy-font-color font-12 mgt5">{{postObj.createdAt}}</view>
        </view>
      </view>
      <!-- 右边位置 -->
      <view class="flex-center">
        <view>
          <van-button icon="plus" @click.stop="addFollow(postObj)" type="default" size="small" class="addFollow">+关注</van-button>
        </view>
      </view>
    </view>
    <view class="pd5" v-html="postObj.contents">
      {{postObj.contents}}
    </view>
    <!-- 图片区域 -->
    <view class="img-zone">
      <view v-for="(imgItem, imgIndex) in postObj.images" :key="imgIndex" v-if="images.length !== 0" class="img-cell">
        <img :src="imgItem" @click.stop="postImgList(postObj.images, imgIndex)" class="img-item"/>
      </view>
    </view>
    <!-- 底部，评论，点赞，转发区域 -->
    <view class="flex-space-around">
      <!-- 喜欢收藏 -->
      <view @click.stop="addMyLike(postObj)" class="footer-item">
        <i class="fa fa-heart-o" :class="{ 'red-color': postObj.isLike }" aria-hidden="true"></i>
        <text>{{postObj.likers}}</text>
      </view>
      <!-- 评论 -->
      <view @click.stop="openCommentsPop(postObj)" class="footer-item">
        <i class="fa fa-commenting-o" aria-hidden="true"></i>
        <text>{{postObj.commentsNum}}</text>
      </view>
      <!-- 转发分享 -->
      <view @click.stop="sharePost(postObj)" class="footer-item">
        <i class="fa fa-share" aria-hidden="true"></i>
        <text>{{postObj.forwardNum}}</text>
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
      default: {}
    },
  },
  components : {
  },
  data () {
    return {

    };
  },
  mounted () {

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
    // 点击评论
    openCommentsPop (item) {
      this.$emit('on-open-comments-popup', item)
    },
    // 加入喜欢
    addMyLike: function (item) {
      let that = this;
      if(that.isLogin){
        if (item.isLike) {
          item.isLike = false;
          item.likers -= 1;
        }else{
          item.isLike = true;
          item.likers += 1;
          that.$toast('成功收藏！');
        }
      }else {
        that.$dialog.confirm({
          title: '未登录',
          message: '登录后可收藏至您的喜欢',
          confirmButtonText: '立即登录'
        }).then(() => {
          that.$router.push({  //核心语句
            path:'/login'   //跳转的路径
          })
        }).catch(() => {
          // on cancel
        });
      }
    },
    // 加关注
    addFollow: function (item) {
      let that = this;
      if(that.isLogin){
        if (item.isFollow === 1) {
          item.isFollow = 0;
          that.$toast('关注成功！');
        }
      }else {
        that.$router.push({  //核心语句
          path:'/login'   //跳转的路径
        })
      }
    },
    // 帮顶
    addPraise: function (item) {
      let that = this;
      if(that.isLogin){
        if (item.isPraised === 1) {
          item.isPraised = 0;
          that.$toast('帮顶成功，将会有更多的人看到哦！');
        }
      }else {
        that.$router.push({  //核心语句
          path:'/login'   //跳转的路径
        })
      }
    },
    // 图片预览
    postImgList (list, imgIndex) {
      ImagePreview({
        images: list,
        startPosition: imgIndex,
        onClose() {
          // do something
        }
      });
    },
    // 前往用户主页
    toUserZone () {
      this.$router.push({ name: 'userzone', params: '' })
    },
    // 前往帖子分类
    toPostClassify (item) {
      this.$router.push({ name: 'postClassify', params: { containerid: item.containerid }})
    },
    // 前往顶赞用户列表
    toTopPraiseUserList (item) {
      this.$router.push({ name: 'topPraiseUserList', params: { postId: item.postId }})
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
  .addFollow{
    background-color: #eee;
  }
  .tag-ellipsis{
    max-width: 100px;
  }
  .footer-space{
    height: 10px;
  }
  .footer-item{
    width: 33%;
    text-align: center;
  }
</style>