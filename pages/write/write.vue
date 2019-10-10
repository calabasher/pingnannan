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
		                        <view class="uni-uploader__file">
		                            <image class="uni-uploader__img" :src="image" :data-src="image" @tap="previewImage"></image>
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
		<view class="tui-cmt-btn">
			<van-button type="info" size="large" @click="publish" :disabled=" contents ? false : true ">发表</van-button>
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
		methods: {
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
				uni.showLoading({
					title: '加载中'
				});
				let that = this;
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
								
							}
						}
					});
				}).catch(err => {
				  console.log(err)
				})
			},
			sourceTypeChange: function(e) {
			    this.sourceTypeIndex = e.target.value
			},
			sizeTypeChange: function(e) {
			    this.sizeTypeIndex = e.target.value
			},
			countChange: function(e) {
			    this.countIndex = e.target.value;
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
			        sizeType: sizeType[this.sizeTypeIndex],
			        count: this.imageList.length + this.count[this.countIndex] > 9 ? 9 - this.imageList.length :
			            this.count[this.countIndex],
			        success: (res) => {
			            this.imageList = this.imageList.concat(res.tempFilePaths);
						var file;
						for (let item of res.tempFilePaths) {
						  console.log('itemn',item)
						  file = that.Bmob.File('abc.jpg', item);
						}
						file.save().then(res => {
						  console.log(res.length);
						  console.log(res);
						})
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
			previewImage: function(e) {
			    var current = e.target.dataset.src
			    uni.previewImage({
			        current: current,
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
			// 选择分类提示
			selectTips(){
				uni.showToast({
				    title: '选择分类可以更好地被别人发现，当然，你也可以不选',
					icon: 'none'
				});
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
</style>
