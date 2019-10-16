<template>
	<view class="">
		<van-radio-group :value="radio">
		    <van-cell-group>
				<van-cell :title="item.name" value-class="value-class" clickable :data-name="item.value" @click="select(index)" v-for="(item, index) in list" :key="item.value">
				    <van-radio :name="item.value" />
				</van-cell>
		    </van-cell-group>
		</van-radio-group>
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
				beReportedUserId: '',	// 被举报用户的id
				radio: '0',
				currentIndex: 0,
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
			this.beReportedUserId = option.objectId ? option.objectId : '6158393fa3';
		},
		onShow(){
			let that = this;
			uni.getStorage({
			    key: 'userInfo',
			    success: function (res) {
					that.userInfo = res.data;
				}
			});
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
					title: '加载中'
				});
				let that = this;
				
				// Pointer 类型在数据库是一个json数据类型，只需调用Pointer方法创建一个Pointer对象存入到字段中，如下：
				const User = that.Bmob.Pointer('_User')
				const reportId = User.set(that.userInfo.objectId)
				const beReportedUserId = User.set(that.beReportedUserId)
				var query = that.Bmob.Query('accusation');
				
				query.set('reportId',reportId)	// 举报者id
				query.set('beReportedUserId',beReportedUserId)	// 被举报者
				query.set("contents", that.list[that.currentIndex].name)
				query.save().then(res => {
					uni.showToast({
						title: '提交成功',
						icon: 'success',
						duration: 1500
					})
					setTimeout( () => {
						uni.navigateBack()
					}, 1000);
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
