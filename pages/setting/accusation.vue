<template>
	<view class="">
		<van-radio-group :value="radio">
		    <van-cell-group>
				<van-cell :title="item.name" value-class="value-class" clickable :data-name="item.value" @click="select(index)" v-for="(item, index) in list" :key="item.value">
				    <van-radio :name="item.value" />
				</van-cell>
		    </van-cell-group>
		</van-radio-group>
		<view class="pdt15 pdl15 dy-font-color">问题描述({{reportContent.length}}/140)</view>
		<view class="mgt15 pd15 border"><textarea v-model="reportContent" placeholder="问题描述..." auto-height="true"></textarea></view>
		<view class="width-100 mgt20">
			<van-button type="info" size="large" @click="publish">提交</van-button>
		</view>
	</view>
</template>

<script>
	export default {
		components: {
		},
		data() {
			return {
				userInfo: {},	// 用户信息
				postId: '',	// 被举报用户的id
				beReportedUserId: '',	// 被举报用户的id
				radio: '0',
				currentIndex: 0,
				reportContent: '',	// 举报内容
				list: [
					{
						name: '违法犯罪',
						value: '0',
					},{
						name: '低俗色情',
						value: '1',
					},{
						name: '造谣传谣',
						value: '2',
					},{
						name: '侮辱谩骂',
						value: '3',
					},{
						name: '侵权盗用',
						value: '4',
					},{
						name: '政治敏感',
						value: '5',
					},{
						name: '垃圾广告、售卖假货',
						value: '6',
					},
				]
			}
		},
		// 监听页面卸载， 监听页面的卸载， 当前处于A页面，点击返回按钮时，则将是A页面卸载、
		onUnload() {
		},
		onReady(){
		},
		onLoad(option){
			let that = this;
			this.postId = option.postId ? option.postId : '6158393fa3';
			this.beReportedUserId = option.beReportedUserId ? option.beReportedUserId : '6158393fa3';
			uni.getStorage({
			    key: 'userInfo',
			    success: function (res) {
					that.userInfo = res.data;
				}
			});
		},
		onShow(){
		},
		// 监听页面的隐藏,当从当前A页跳转到其他页面，那么A页面处于隐藏状态。
		onHide(){
		},
		methods: {
			select(index) {
				this.currentIndex = index;
				this.radio = this.list[index].value
			},
			// 提交
			publish () {
				uni.showLoading({
					title: '加载中',
					mask: true,
				});
				let that = this;
				// Pointer 类型在数据库是一个json数据类型，只需调用Pointer方法创建一个Pointer对象存入到字段中，如下：
				const User = that.Bmob.Pointer('_User')
				const reportId = User.set(that.userInfo.objectId)
				const beReportedUserId = User.set(that.beReportedUserId)
				const post = that.Bmob.Pointer('postList')
				const postId = post.set(that.postId)
				
				var query = that.Bmob.Query('accusation');
				query.set('postId',postId)	// 帖子id
				query.set('reportId',reportId)	// 举报者id
				query.set('beReportedUserId',beReportedUserId)	// 被举报者
				query.set("contents", that.list[that.currentIndex].name)
				query.set("reportContent", that.reportContent)
				query.set("state", 1)
				query.save().then(res => {
					uni.hideLoading()
					uni.showModal({
					    title: '提交成功',
					    content: '我们将尽快核实处理，感谢您的反馈',
						showCancel: false,
					    success: function (res) {
					        if (res.confirm) {
					            uni.navigateBack()
					        } 
					    }
					});
				}).catch(err => {
				  console.log(err)
				})
			},
			
		},
	}
</script>

<style>
	.value-class {
	  flex: none !important;
	}
</style>
