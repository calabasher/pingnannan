<template>
	<view class="container">
		<view class="tui-cells pd15 mgt10">
			<textarea class="tui-textarea" v-model="contents" name="desc" placeholder="发表你的评论..." maxlength="500" placeholder-class="tui-phcolor-color"
			 auto-focus />
			<view class="tui-textarea-counter">0/500</view>
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
		<view class="tui-cmt-btn">
			<van-button type="primary" size="large" @click="publish">发表</van-button>
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
				count: [1, 2, 3, 4, 5, 6, 7, 8, 9]
			}
		},
		// 监听页面卸载
		onUnload() {
		    this.imageList = [],
			this.sourceTypeIndex = 2,
			this.sourceType = ['拍照', '相册', '拍照或相册'],
			this.sizeTypeIndex = 2,
			this.sizeType = ['压缩', '原图', '压缩或原图'],
			this.countIndex = 8;
		},
		onLoad(){
		},
		onHide(){
		},
		methods: {
			publish(){
				let that = this;
				var query = that.Bmob.Query('postList');
				
				var currentUser = that.Bmob.User.current();
				var objectId = currentUser.id;
				var isme = that.Bmob.User();
				isme.id = objectId;     //当前用户的objectId
					
				query.set("author", isme)
				query.set("contents", that.contents)
				query.set("images", that.imageList)
				query.save().then(res => {
					uni.showModal({
						title: '发表成功',
						content: '是否立即前往查看',
						confirmText: '前往查看',
						cancelText: '继续发帖',
						success: function (res) {
							if (res.confirm) {
								
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
			}
		}
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
