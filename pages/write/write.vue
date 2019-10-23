<template>
	<view class="container">
		<view class="tui-cells pd15 mgt10">
			<textarea class="tui-textarea" v-model="contents" name="desc" placeholder="分享新鲜事儿..." maxlength="150" placeholder-class="tui-phcolor-color"
			 auto-focus />
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
		                        <view class="uni-uploader__input" @tap="chooseImage"></view>
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
				checked: true,
				canvasShow: false, // 画布
				canvasW: 0,	// 画布 宽
				canvasH: 0,	// 画布 高
				fileUrl: 'http://imlmbm.xyz/',	// 文件地址
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
			this.getPostClassList();
			uni.getLocation({
			    type: 'wgs84',
			    success: function (res) {
			        console.log('当前位置的经度：' + res.longitude);
			        console.log('当前位置的纬度：' + res.latitude);
			    }
			});
		},
		// 监听页面的隐藏,当从当前A页跳转到其他页面，那么A页面处于隐藏状态。
		onHide(){
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
				if(this.contents.length < 15){
					uni.showToast({
					    title: '内容长度不低于15个字符',
					    icon: 'none'
					});
					return 
				}
				if(this.contents.length > 150){
					uni.showToast({
					    title: '内容长度不得超过150个字符',
					    icon: 'none'
					});
					return 
				}
				that.Bmob.checkMsg(that.contents).then(res => {
					uni.showLoading({
						title: '加载中'
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
					
					query.save().then(res => {
						uni.hideLoading();
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
			// 获取选择图片的信息 一张或多张
			getImageInfo: async function(imageArr){
				var that = this;
				for(let val of imageArr) {
					// 循环绘制canvas, canvas中使用定时器
					uni.getImageInfo({//获取图片信息
					  src: val,
					  success:function(res){
						  //成功去进行压缩事件
						  that.drawCanvas(res);
					  },fail: (err) => {
						console.log(err)
					  }
					})
				}
			},
			// 绘制图片到canvas上
			drawCanvas: async function (res) {
				const ctx = uni.createCanvasContext('myCanvas'); //创建画布
				var that = this;
				// 图片原始尺寸
				var originWidth = res.width;
				var originHeight = res.height;
				// 最大尺寸限制，可通过国设置宽高来实现图片压缩程度
				var maxWidth = 375,
					maxHeight = 375;
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
				ctx.width = targetWidth;
				ctx.height = targetHeight;
				that.canvasH = targetHeight
				that.canvasW = targetWidth
				// 清除画布
				ctx.clearRect(0, 0, targetWidth, targetHeight);
				// 图片压缩
				ctx.drawImage(res.path,0, 0, targetWidth, targetHeight); //画布中展示图片大小
				uni.showLoading({title:"图片处理中"}) //运行压缩输出文字（显示loading）
				ctx.draw();//回调函数
				return new Promise( resolve=> {
					 resolve()
					let timer = setTimeout(function(){ //定时事件，和展示图片与wx。showLoading关系密切
					  uni.canvasToTempFilePath({ //把当前画布指定区域的内容导出生成指定大小图片，并返回文件路径
						canvasId: "myCanvas", //画布id
						quality: 0.5, //图片质量，取值范围在（0，1】
						success:function(res1){
						  console.log('给后台传输这个地址:' + res1.tempFilePath)//给后台传输这个地址
						  // that.imageList.push(res1.tempFilePath)
						  uni.uploadFile({
						  	url: that.fileUrl + '/weiliao/skill/file/upload',
						  	filePath: res1.tempFilePath,
						  	fileType: 'image',
						  	name: 'uploadFile',	// 后台 参数名
						  	success: (data) => {
						  		let resp = JSON.parse(data.data)
								console.log(that.fileUrl + resp.results)
						  		that.imageList.push(that.fileUrl + resp.results);
								// 清除画布
								ctx.clearRect(0, 0, targetWidth, targetHeight);
						  	},
						  	fail: (err) => {
						  		console.log('uploadImage fail', err);
						  		uni.showModal({
						  			content: err.errMsg,
						  			showCancel: false
						  		});
						  	},
							complete: () => {
							  uni.hideLoading()//隐藏loading
							  clearTimeout(timer);//关闭定时器
							  timer = null;//把定时器制null
							}
						  });
						},fail: (err) => {
							 console.log(err)
						}
					  }, this)
					}, 300)
				})
			},
			chooseImage: async function() {
				let that = this;
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
			        sourceType: sourceType[this.sourceTypeIndex],
					sizeType: ['origin','compressed'], //可以指定是原图还是压缩图，默认二者都有
			        count: this.imageList.length + this.count[this.countIndex] > 9 ? 9 - this.imageList.length :
			            this.count[this.countIndex],
			        success: (res) => {
						var imageSrc = res.tempFilePaths
						that.getImageInfo(res.tempFilePaths)//运行事件
			        },
			        fail: (err) => {
			            // #ifdef APP-PLUS
			            if (err['code'] && err.code !== 0 && this.sourceTypeIndex === 2) {
			                this.checkPermission(err.code);
			            }
			            // #endif
			        }
			    })
			},
			deleteImg(index){
				this.imageList.splice( 1, index)
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
</style>
