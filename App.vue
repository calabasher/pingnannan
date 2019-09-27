<script>
	/**
	 * vuex管理登陆状态，具体可以参考官方登陆模板示例
	 */
	import {
		mapMutations
	} from 'vuex';
	export default {
		methods: {
			...mapMutations(['login'])
		},
		onLaunch: function() {
			let userInfo = uni.getStorageSync('userInfo') || '';
			if(userInfo.id){
				//更新登陆状态
				uni.getStorage({
					key: 'userInfo',
					success: (res) => {
						this.login(res.data);
					}
				});
			}else{
				uni.reLaunch({
				    url: '/pages/authorize/authorize'
				});
				// uni.login({
				//   provider: 'weixin',
				//   success: function (loginRes) {
				//     console.log('loginRes:' + loginRes.authResult);
				//     // 获取用户信息
				//     uni.getUserInfo({
				//       provider: 'weixin',
				//       success: function (infoRes) {
				//         console.log('用户昵称为：' + infoRes.userInfo.nickName);
				//       }
				//     });
				//   }
				// });
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
	}
</script>

<style lang='scss'>
/* uni.css - 通用组件、模板样式库，可以当作一套ui库应用 */
@import './common/uni-app/uni.css';

/*每个页面公共css */
page {
  color: #333;
  font-size: 16px;
  background: #f8f8f8;
  min-height: 100vh;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  font-family: 'PingFang SC', Helvetica, 'STHeiti STXihei', 'Microsoft YaHei', Tohoma, Arial, sans-serif;
}

.demo-margin-left {
  margin-left: 10px;
}

.demo-margin-right {
  margin-right: 10px;
}

.demo-margin-bottom {
  display: block;
  margin-bottom: 15px;
}
/* 自定义css */
.flex{
  display: flex;
}
.flex-center{
  display: flex;
  justify-content: center;
  align-items: center;
}
.flex-align-center{
  display: flex;
  align-items: center;
}
.flex-wrap{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}
.flex-space-between{
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}
.flex-space-around{
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
}
.flex-start{
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
}
.flex-column{
  display: flex;
  flex-direction: column;
}
.van-avatar {
  display: inline-block;
  text-align: center;
  background: #ccc;
  color: #fff;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  vertical-align: middle;
  width: 72upx;
  height: 72upx;
  line-height: 72upx;
  border-radius: 50%;
}
.van-avatar-large {
  display: inline-block;
  text-align: center;
  background: #ccc;
  color: #fff;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  vertical-align: middle;
  width: 90upx;
  height: 90upx;
  line-height: 90upx;
  border-radius: 50%;
}
.van-avatar-small{
  display: inline-block;
  text-align: center;
  background: #ccc;
  color: #fff;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  vertical-align: middle;
  width: 60upx;
  height: 60upx;
  line-height: 60upx;
  border-radius: 50%;
}
.displayflex>div{
  display: flex;
}
.displayflex-1{
  flex: 1;
}
.tcenter{
  text-align: center;
}
.tright{
  text-align: right;
}
.tleft{
  text-align: left;
}
.mg15{
  margin: 30upx;
}
.mg10{
  margin: 20upx;
}
.mg5{
  margin: 10upx;
}
.mgr5{
  margin-right: 10upx;
}
.mgl5{
  margin-left: 10upx;
}
.mgt5{
  margin-top: 10upx;
}
.mgt10{
  margin-top: 20upx;
}
.mgl10{
  margin-left: 20upx;
}
.mgr10{
  margin-right: 20upx;
}
.mgb3{
  margin-bottom: 6upx;
}
.mgb5{
  margin-bottom: 10upx;
}
.mgb10{
  margin-bottom: 20upx;
}
.mgb15{
  margin-bottom: 30upx;
}
.mgt15{
  margin-top: 30upx;
}
.mgr15{
  margin-right: 30upx;
}
.mgl15{
  margin-left: 30upx;
}
.pd0{
	padding: 0;
}
.pd5{
  padding: 10upx;
}
.pdb5{
  padding-bottom: 10upx;
}
.pdt5{
  padding-top: 10upx;
}
.pdl5{
  padding-left: 10upx;
}
.pdr5{
  padding-right: 10upx;
}
.pdl10{
  padding-left: 20upx;
}
.pdb10{
  padding-bottom: 20upx;
}
.pdr10{
  padding-right:  20upx;
}
.pdt10{
  padding-top: 20upx;
}
.pd10{
  padding: 20upx;
}
.pd15{
  padding: 30upx;
}
.pdt15{
  padding-top: 30upx;
}
.pdb15{
  padding-bottom:  30upx;
}
.pdl15{
  padding-left: 30upx;
}
.pdr15{
  padding-right: 30upx;
}
.pd15{
  padding: 30upx;
}
.pd20{
  padding-top: 40upx;
}
.pdt20{
  padding-top: 40upx;
}
.pdb20{
  padding-bottom:  40upx;
}
.pdl20{
  padding-left: 40upx;
}
.pdr20{
  padding-right: 40upx;
}
.mg20{
  margin-top: 40upx;
}
.mgt20{
  margin-top: 40upx;
}
.mgb20{
  margin-bottom:  40upx;
}
.mgl20{
  margin-left: 40upx;
}
.mgr20{
  margin-right: 40upx;
}
.position-r{
  position: relative;
}
.position-f{
  position: fixed;
}
.display-block{
  display: inline-block;
}
.space{
  width: 100%;
  height: 120upx;
}
.top-space{
  height: 130rpx;
}
.bottom-space{
  height: 130upx;
}
.footer-space{
  height: 100upx;
}
.font-12{
  font-size: 24upx;
}
.font-14{
  font-size: 28upx;
}
.font-16{
  font-size: 32upx;
}
.font-20{
  font-size: 40upx;
}
.font-24{
  font-size: 48upx;
}
.font-bold{
  font-weight: 700;
}
.width-100{
  width: 100%;
}
.width-80{
  width: 80%;
}
.width-60{
  width: 60%;
}
.width-50{
  width: 50%;
}
.width-45{
  width: 45%;
}
.width-40{
  width: 40%;
}
.height-100{
  height: 100%;
}
.border{
  border: 1px solid #F6F6F6;
}
.border-bottom{
  border-bottom: 1px solid #F6F6F6
}
.border-top{
  border-top: 1px solid #F6F6F6
}
.border-right{
  border-right: 1px solid #F6F6F6
}
#app .grayBg {
  background-color: #F2F2F2;
  height: 100%;
}
#app .blackBg {
  background-color: black;
}
#app .grayBarBg{
  background-color: #F2F2F2;
}
.noData{
  text-align: center;
  font-size: 30upx;
}
.flex-between{
  display: flex;
  justify-content: space-between;
}
.text-img{
  background-size: 100% 100%;
  background-repeat: no-repeat;
  width: 100%;
  height: 100%;
}
.gray-font{
  color: #969799;
}
.fixed-top{
  position: fixed;
  top: 0;
  z-index: 100;
  width: 100%;
}
.fixed-footer-btn-zone{
  position: fixed;
  bottom: 60upx;
  width: 100%;
}
.img-common{
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.z-index-999{
  z-index: 999;
}
.overflow-h{
  overflow: hidden;
} 
.mga{
	margin: 0 auto;
} 

.blue-color{
  color: #1989fa;
}
.red-color{
  color: #f44;
}
.red-light-color{
  color: #ec706b;
}
.gray-color{
  color: #969799;
}
.white-color{
  color: #fff;
}
.black-color{
  color: #000;
}
.pink-color{
  color: pink;
}
.gold-color{
  color: #ffa631;
}
.rose-color{
  color: #FF6766
}
.green-color{
  color: #07c160;
}
.white-bg{
  background-color: #fff;
}
.wx-bg{
  background-color: #F6F6F6;
}
.dy-font-color{
  color: #969799;
}
.wb-font-color{
  color: #808080;
}
.lh-25{
	line-height: 50upx;
}
.lh-30{
	line-height: 60upx;
}
.br-10{
	border-radius: 10upx;
}
.float-l{
	float: left;
}
.float-r{
	float: right;
}
.block{
	display: block;
}
.inline-block{
	display: inline-block;
}
.opacity-100{
	opacity: 1;
}
.opacity-50{
	opacity: 0.5;
}
.text-ellipse{
	width: 100%;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
</style>
