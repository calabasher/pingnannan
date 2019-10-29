<template>
	<view class="container">
		<view class="tui-cells pd15 mgt10">
			<textarea class="tui-textarea" v-model="contents" name="desc" placeholder="分享新鲜事儿..." maxlength="150"
			 placeholder-class="tui-phcolor-color" auto-focus />
			<view class="tui-textarea-counter">{{contents.length}}/150</view>
		</view>
		<!-- 图片上传 -->
		<view class="uni-list mgt20">
		    <view class="uni-list-cell pd15">
		        <view class="uni-uploader">
		            <view class="uni-uploader-head">
		                <view class="uni-uploader-title">点击可预览选好的图片</view>
		                <view class="uni-uploader-info">{{imageList.length}}/9</view>
		            </view>
		            <view class="uni-uploader-body">
		                <view class="uni-uploader__files">
		                    <block v-for="(image,index) in imageList" :key="index">
		                        <view class="position-r uni-uploader__file">
		                            <image class="uni-uploader__img" :src="image" :data-src="image" @click="previewImage(index)"></image>
									<view class="delete-icon tright" @click.stop="deleteImg(index)">
										<van-icon name="close" size="24" />
									</view>
		                        </view>
		                    </block>
		                    <view class="uni-uploader__input-box">
		                        <view class="uni-uploader__input" @click="chooseImage"></view>
		                    </view>
		                </view>
		            </view>
		        </view>
		    </view>
		</view>
		<view class="uni-list-cell">
			<view class="uni-list-cell-left dy-font-color">
				帖子分类
			</view>
			<view class="uni-list-cell-db">
				<picker @change="bindPickerChange" :value="pickIndex" :range="pickList" range-key="name">
					<view class="uni-input">{{pickList[pickIndex].name}}</view>
				</picker>
			</view>
		</view>
		<view class="mgt15 pdl15" @click="checked = !checked">
			<van-checkbox v-model="checked">我已阅读并同意<text class="mgl5 orange-color" @click.stop="navTo('/pages/activity/rules')"> 发布须知 </text></van-checkbox>
		</view>
		<view class="tui-cmt-btn">
			<van-button type="info" size="large" @click="publish" :disabled=" contents && checked ? false : true ">发表</van-button>
		</view>
		<view class="">
			<!-- <canvas style="width: 100px;height: 100px;" canvas-id="myCanvas"/> -->
			<canvas :style=" { width: canvasW + 'px', height: canvasH + 'px', position: 'absolute', left: '100%' }" canvas-id="myCanvas"/>
		</view>
	</view>
</template>

<script>
	// #ifdef APP-PLUS
	import permision from "@/util/permission/permission.js"
	// #endif
	var sourceType = [
	    ['camera'],
	    ['album'],
	    ['camera', 'album']
	]
	var sizeType = [
	    ['compressed'],
	    ['original'],
	    ['compressed', 'original']
	]
	export default {
		components: {
		},
		data() {
			return {
				myId: '',	// 当前用户id
				userState: 0,	// 用户状态 0-正常 1-禁言
				publishNum: 0,	// 今日发帖量
				contents: '',	// 文本内容
				imageList: [],
				sourceTypeIndex: 2,
				sourceType: ['拍照', '相册', '拍照或相册'],
				sizeTypeIndex: 2,
				sizeType: ['压缩', '原图', '压缩或原图'],
				countIndex: 8,
				count: [1, 2, 3, 4, 5, 6, 7, 8, 9],
				pickIndex: 0,
				pickList: [{name: '不限'}],
				postClassId: '',	// 帖子分类的id， 默认为空
				localId: '',	// 地址分类的id， 默认为空
				checked: true,
				canvasShow: false, // 画布
				canvasW: 0,	// 画布 宽
				canvasH: 0,	// 画布 高
				// fileUrl: 'https://bmob-cdn-27154.bmobcloud.com/',	// 文件地址
				fileUrl: 'https://bmob-cdn-27154.bmobpay.com',	// 文件地址
				imgTips: '',	// 图片提示
			}
		},
		// 监听页面卸载， 监听页面的卸载， 当前处于A页面，点击返回按钮时，则将是A页面卸载、
		onUnload() {
		    this.imageList = [],
			this.sourceTypeIndex = 2,
			this.sourceType = ['拍照', '相册', '拍照或相册'],
			this.sizeTypeIndex = 2,
			this.sizeType = ['压缩', '原图', '压缩或原图'],
			this.countIndex = 8;
		},
		onLoad(){
			let that = this;
			this.getPostClassList();
			//	获取地址
			uni.getStorage({
			    key: 'localId',
			    success: function (res) {
					that.localId = res.data ? res.data : ''; 
			    }
			});
			// 获取用户
			uni.getStorage({
				key: 'userInfo',
				success: function (res) {
					that.myId = res.data.objectId;
					that.getTodayPublishPostNum()
					that.checkStatus();
				}
			});
		},
		// 监听页面的隐藏,当从当前A页跳转到其他页面，那么A页面处于隐藏状态。
		onShow(){
			this.getTodayPublishPostNum()
			this.checkStatus();
		},
		// 分享
		onShareAppMessage() {
			return {
				title: '邀请您使用小镇事事通',
				path: '/pages/write/write'
			}
		},
		methods: {
			navTo(url){
				uni.navigateTo({ url: url })
			},
			// 获取用户发言状态
			checkStatus(){
				let that = this;
				// 查询大于某个日期的数据，示例代码如下
				const query = that.Bmob.Query("_User");
				query.get(that.myId).then(res => {
				  that.userState = res.state
				}).catch(err => {
				  console.log(err)
				})
			},
			// 获取今日发帖数量
			getTodayPublishPostNum(){
				let that = this;
				// 查询大于某个日期的数据，示例代码如下
				const query = that.Bmob.Query("postList");
				// 如果要查询某个属性等于某个值，示例代码如下：
				query.equalTo("author", "==", that.myId);
				var date = new Date();
				var yy = date .getFullYear(); //获取完整的年份(4位)
				var mm = date .getMonth() + 1 < 10 ? '0' + date .getMonth() + 1  : date .getMonth() + 1  ; //获取当前月份(0-11,0代表1月)
				var dd = date .getDate() < 10 ? '0' + date .getDate() : date .getDate() ; //获取当前日(1-31)
				var time_start = yy + '-' + mm + '-' + dd + ' 00:00:00'
				var time_end = yy + '-' + mm + '-' + dd + ' 23:59:59'
				query.equalTo("createdAt", ">", time_start);
				query.equalTo("createdAt", "<", time_end);
				query.count().then(res => {
				  that.publishNum = res.count;
				});
			},
			// 获取分类列表
			getPostClassList(){
				let that = this;
				uni.showLoading({
					title: '加载中'
				});
				var query = that.Bmob.Query('postClass');
				// 查询所有数据
				query.find().then(res => {
				    uni.hideLoading();
				    that.pickList = that.pickList.concat(res);
				});
			},
			// 用户发帖--内容和图片, 将该帖子关联该用户
			publish(){
				let that = this;
				let flag = true;
				let tips = '';
				if(this.contents.length < 15){
					flag = false;
					tips = '内容长度不低于15个字符';
				}
				if(this.contents.length > 150){
					flag = false;
					tips = '内容长度不得超过150个字符';
				}
				if(that.publishNum > 5){
					flag = false;
					tips = '为防止恶意刷屏，每人每天最多发帖5篇';
				}
				if(that.userState === 1){
					flag = false;
					tips = '由于违反相关法律法规，您已被禁言，如有疑问，可找客服申诉';
				}
				if(!flag){
					uni.showToast({
					    title: tips,
					    icon: 'none',
						duration: 3000
					});
					return 
				}
				that.Bmob.checkMsg(that.contents).then(res => {
					uni.showLoading({
						title: '加载中',
						mask: true,
					});
					var currentUser = that.Bmob.User.current(); // 当前用户
					var objectId = currentUser.objectId; // 当前用户Id
					// Pointer 类型在数据库是一个json数据类型，只需调用Pointer方法创建一个Pointer对象存入到字段中，如下：
					const pointer = that.Bmob.Pointer('_User')
					const poiID = pointer.set(objectId)
					var query = that.Bmob.Query('postList');
					
					query.set('author',poiID)
					query.set("contents", that.contents)
					query.set("view", 0)
					query.set("likes", 0)
					query.set("comments", 0)
					query.set("images", that.imageList)
					
					// 关联分类表
					if(that.postClassId){
						const pointerPostClass = that.Bmob.Pointer('postClass')
						const pPostClassID = pointerPostClass.set(that.postClassId)
						query.set('belongsClass',pPostClassID)	// 绑定的帖子分类id
					}
					// 关联地区表
					if(that.localId){
						const pointerLocal = that.Bmob.Pointer('local')
						const pLocalID = pointerLocal.set(that.localId)
						query.set('belongsLocal',pLocalID)	// 绑定的帖子分类id
					}
					
					query.save().then(res => {
						uni.hideLoading();
						that.getTodayPublishPostNum();
						uni.showModal({
							title: '发表成功',
							content: '是否立即前往查看',
							confirmText: '前往查看',
							cancelText: '继续发帖',
							success: function (res) {
								if (res.confirm) {
									uni.reLaunch({
									    url: '/pages/index/index'
									});
								} else if (res.cancel) {
									that.contents = '';	// 文本内容
									that.imageList = [];
									that.pickIndex = 0;
								}
							}
						});
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
			// 绘制图片到canvas上
			drawCanvas (index, failNum, tempFilePaths) {
				var that = this;
				if (index < tempFilePaths.length) {
					// 循环绘制canvas, canvas中使用定时器
					uni.getImageInfo({//获取图片信息
					    src: tempFilePaths[index],
					    success:function(res){
							//---------利用canvas压缩图片--------------
							const ctx = uni.createCanvasContext('myCanvas'); //创建画布
							// 图片原始尺寸
							var originWidth = res.width;
							var originHeight = res.height;
							// 最大尺寸限制，可通过国设置宽高来实现图片压缩程度
							var maxWidth = 400,
								maxHeight = 400;
							// 目标尺寸
							var targetWidth = originWidth,
								targetHeight = originHeight;
							// 图片尺寸超过400x400的限制
							if(originWidth > maxWidth || originHeight > maxHeight) {
								if(originWidth / originHeight > maxWidth / maxHeight) {
									// 更宽，按照宽度限定尺寸
									targetWidth = maxWidth;
									targetHeight = Math.round(maxWidth * (originHeight / originWidth));
								} else {
									targetHeight = maxHeight;
									targetWidth = Math.round(maxHeight * (originWidth / originHeight));
								}
							}
							// canvas对图片进行缩放
							that.canvasH = targetHeight
							that.canvasW = targetWidth
							// 图片压缩
							ctx.drawImage(tempFilePaths[index], 0, 0, targetWidth, targetHeight); //画布中展示图片大小
							uni.showLoading( { title:"图片处理中", mask: true }) //运行压缩输出文字（显示loading					
							ctx.draw(false, function () {
								index = index + 1;//上传成功的数量，上传成功则加1
								uni.canvasToTempFilePath({ //把当前画布指定区域的内容导出生成指定大小图片，并返回文件路径
									canvasId: "myCanvas", //画布id
									quality: 0.5, //图片质量，取值范围在（0，1】
									success:function(data){
										console.log('给后台传输这个地址:' + data.tempFilePath)//给后台传输这个地址
										uni.uploadFile({
											// url: that.fileUrl + '/weiliao/skill/file/upload',
											url: that.fileUrl,
											filePath: data.tempFilePath,
											fileType: 'image',
											name: 'uploadFile',	// 后台 参数名
											success: (data) => {
												let resp = JSON.parse(data.data)
												if(resp.code === 200 && resp.results){
													that.imageList.push(that.fileUrl + resp.results);
													that.drawCanvas(index, failNum, tempFilePaths);
												}else{
													uni.showToast( { title: "图片上传失败，请尝试单独上传", icon: 'none' }) 
												}
											},
											fail: (err) => {
												uni.showModal({
													content: err.errMsg,
													showCancel: false
												});
											},
											complete: () => {
											    uni.hideLoading()//隐藏loading
											}
										});
									},fail: (err) => {
										console.log(err)
										failNum += 1;//失败数量，可以用来提示用户
										that.getCanvasImg(inedx, failNum, tempFilePaths);
									},complete: () => {
										if(index === tempFilePaths.length ){
											// 清除画布
											that.canvasH = 1
											that.canvasW = 1
											ctx.clearRect(0, 0, 0, 0);
										}
									}
								})
							});
						}
					})
				}
			},
			chooseImage: async function() {
				let that = this;
				let flag = true;
				let tips = ''
				if(that.publishNum > 5){
					tips = '为防止恶意刷屏，每人每天最多发帖5篇';
					flag = false;
				}
				if(that.userState === 1){
					tips = '由于违反相关法律法规，您已被禁言，如有疑问，可找客服申诉';
					flag = false;
				}
				if(!flag){
					uni.showToast({
						title: tips,
						icon: 'none',
						duration: 3000
					}) 
					return
				}
			    // #ifdef APP-PLUS
			    // TODO 选择相机或相册时 需要弹出actionsheet，目前无法获得是相机还是相册，在失败回调中处理
			    if (this.sourceTypeIndex !== 2) {
			        let status = await this.checkPermission();
			        if (status !== 1) {
			            return;
			        }
			    }
			    // #endif
			
			    if (this.imageList.length === 9) {
			        let isContinue = await this.isFullImg();
			        console.log("是否继续?", isContinue);
			        if (!isContinue) {
			            return;
			        }
			    }
				uni.chooseImage({
				  success: function (res) {
					var tempFilePaths = res.tempFilePaths
					var file;
					for (let item of tempFilePaths) {
					  console.log('itemn',item)
					  file = that.Bmob.File('abc.jpg', item);
					}
					file.save().then(res => {
						res.forEach( (val)=> {
							that.imageList.push(val.url)
						})
					})
				  }
				})
			  //   uni.chooseImage({
			  //       sourceType: sourceType[this.sourceTypeIndex],
					// sizeType: ['origin','compressed'], //可以指定是原图还是压缩图，默认二者都有
			  //       count: this.imageList.length + this.count[this.countIndex] > 9 ? 9 - this.imageList.length :
			  //           this.count[this.countIndex],
			  //       success: (res) => {
					// 	//图片大小，如果大于5M，提示用户
					// 	let size = 0;
					// 	that.imgTips = '';
					// 	for (var i = 0; i < res.tempFiles.length; i++) {
					// 		size += res.tempFiles[i].size
					// 	}
					// 	if (size >= 5 * 1024 * 1024) {
					// 		uni.showToast({
					// 			title: '文件大，需要处理时间较长',
					// 			icon: 'none'
					// 		}) 
					// 	}
					// 	setTimeout( ()=> { 
					// 		that.drawCanvas(0, 0, res.tempFilePaths);  //进行压缩
					// 	}, 5)
						
			  //       },
			  //       fail: (err) => {
			  //           // #ifdef APP-PLUS
			  //           if (err['code'] && err.code !== 0 && this.sourceTypeIndex === 2) {
			  //               this.checkPermission(err.code);
			  //           }
			  //           // #endif
			  //       }
			  //   })
			},
			deleteImg(index){
				this.imageList.splice( index, 1)
			},
			isFullImg: function() {
			    return new Promise((res) => {
			        uni.showModal({
			            content: "已经有9张图片了,是否清空现有图片？",
			            success: (e) => {
			                if (e.confirm) {
			                    this.imageList = [];
			                    res(true);
			                } else {
			                    res(false)
			                }
			            },
			            fail: () => {
			                res(false)
			            }
			        })
			    })
			},
			previewImage: function(index) {
			    uni.previewImage({
			        current: this.imageList[index],
			        urls: this.imageList
			    })
			},
			async checkPermission(code) {
			    let type = code ? code - 1 : this.sourceTypeIndex;
			    let status = permision.isIOS ? await permision.requestIOS(sourceType[type][0]) :
			        await permision.requestAndroid(type === 0 ? 'android.permission.CAMERA' :
			            'android.permission.READ_EXTERNAL_STORAGE');
			
			    if (status === null || status === 1) {
			        status = 1;
			    } else {
			        uni.showModal({
			            content: "没有开启权限",
			            confirmText: "设置",
			            success: function(res) {
			                if (res.confirm) {
			                    permision.gotoAppSetting();
			                }
			            }
			        })
			    }
			    return status;
			},
			// 切换pick分类选择
			bindPickerChange: function(e) {
				this.pickIndex = e.target.value
				this.postClassId = this.pickList[parseInt(this.pickIndex)].objectId ? this.pickList[parseInt(this.pickIndex)].objectId : ''
			},
		},
		// watch: {
		// 	columnsNum(value) {
		// 	    this.set({
		// 	        displayColumns: this.data.columns.slice(0, +value)
		// 	    });
		// 	}
		// }
	}
</script>

<style>
page {
  background: #fff;
  color: #333;
}

.tui-cells {
  border-radius: 4upx;
  height: 280upx;
  box-sizing: border-box;
  padding: 20upx 20upx 0 20upx;
  position: relative;
}

.tui-cells::after {
  content: '';
  position: absolute;
  height: 200%;
  width: 200%;
  border: 1px solid #e6e6e6;
  transform-origin: 0 0;
  -webkit-transform-origin: 0 0;
  -webkit-transform: scale(0.5);
  transform: scale(0.5);
  left: 0;
  top: 0;
  border-radius: 8upx;
}

.tui-textarea {
  height: 210upx;
  width: 100%;
  color: #666;
  font-size: 28upx;
}

.tui-phcolor-color {
  color: #ccc !important;
}

.tui-textarea-counter {
  font-size: 24upx;
  color: #999;
  text-align: right;
  height: 40upx;
  line-height: 40upx;
  padding-top: 4upx;
}
.tui-enclosure{
 display: flex;
 align-items: center;
 padding: 26upx 10upx;
 box-sizing: border-box;
}
.tui-mr{
  margin-right: 60upx;
}
.tui-cmt-btn{
  margin-top: 60upx;
}
.uni-list-cell::after {
	left: 0;
}
.delete-icon{
	position: absolute;
	top: 0;
	width: 100%;
	height: 20px;
	ackground-color: rgba(0,0,0,.7);
}
.uni-uploader__file {
	width: 208rpx;
}

</style>
