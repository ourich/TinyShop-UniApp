<template>
	<view class="page">
		<view class='feedback-title'>
			<text>提取数量</text>
		</view>
		<view class="feedback-body">
			<input class="feedback-input" v-model="sendDate.cardNum" placeholder="请填写提取数量"/>
		</view>
		<view class='feedback-title'>
			<text>收件人</text>
		</view>
		<view class="feedback-body">
			<input class="feedback-input" v-model="sendDate.name" placeholder="请填写收件人姓名"/>
		</view>
		<view class='feedback-title'>
			<text>手机号</text>
		</view>
		<view class="feedback-body">
			<input class="feedback-input" v-model="sendDate.mobile" placeholder="请填写收件人电话"/>
		</view>
		<view class='feedback-title'>
			<text>收货地址</text>
		</view>
		<view class="feedback-body">
			<textarea placeholder="请填写详细收货地址" v-model="sendDate.address" class="feedback-textare"/>
		</view>
		
		<button class="confirm-btn" :disabled="btnLoading" :loading="btnLoading" @tap="send">提交</button>
		<view class='feedback-title'>
			<text>反馈结果可在设置 -> 意见反馈 -> 点击列表后查看！</text>
		</view>
	</view>
</template>

<script>
    import {deliveryCreate, uploadImage} from '@/api/userInfo';
    export default {
        data() {
            return {
                msgContents: ['界面显示错乱', '启动缓慢，卡出翔了', 'UI无法直视，丑哭了', '偶发性崩溃'],
                stars: [1, 2, 3, 4, 5],
                imageList: [],
                feedbackType: [
                    {
                        value: '1',
                        name: '功能建议'
                    },
                    {
                        value: '2',
                        name: 'BUG反馈'
                    },
                    {
                        value: '3',
                        name: '业务咨询'
                    }],
                sendDate: {
                    type: '1'
                },
	            btnLoading: false
            }
        },
        methods: {
          //   监听反馈类型事件
            handleFeedbackTypeChange(e) {
                this.sendDate.type = e.detail.value
            },
            // 打开相册选图
            uploadImage() {
                const _this = this;
                uni.chooseImage({
                    count: 6,
                    sizeType: ['original', 'compressed'],
                    sourceType: ['album'],
                    success: function (res) {
                        _this.handleUploadFile(res.tempFilePaths)
                    }
                });
            },
            // 依次上传图片
            handleUploadFile(data) {
                const _this = this;
                data.forEach(item => {
                    _this.$http.upload(uploadImage, {filePath: item, name: 'file'}).then(r => {
                        _this.imageList.push(r.data.url)
                    });
                })
            },
            // 删除已选中图片
            close(e) {
                this.imageList.splice(e, 1);
            },
            // 快速输入
            chooseMsg() { //快速输入
                uni.showActionSheet({
                    itemList: this.msgContents,
                    success: (res) => {
                        this.sendDate.content = this.msgContents[res.tapIndex];
                    }
                })
            },
           // 发送反馈
            async send() {
              this.btnLoading = true;
              await this.$http.post(`${deliveryCreate}`, {
                  ...this.sendDate
              }).then(() => {
                  this.btnLoading = false;
                  this.$mRouter.back();
              }).catch(() => {
                  this.btnLoading = false;
              });
            }
        }
    }
</script>

<style lang='scss'>
	page {
		background-color: $page-color-base;
	}
	/*问题反馈*/
	.feedback-title {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		padding: 20upx;
		color: #8f8f94;
		font-size: 28upx;
	}

	.feedback-star-view.feedback-title {
		justify-content: flex-start;
		margin: 0;
	}

	.feedback-quick {
		position: relative;
		padding-right: 40upx;
    .iconfont {
      font-size: $font-sm;
    }
	}

	.feedback-body {
		background: #fff;

		.feedback-type {
			padding: 20upx;

			.feedback-type-item {
				margin-right: 20upx;
			}
		}
	}

	.feedback-textare {
		height: 200upx;
		font-size: 34upx;
		line-height: 50upx;
		width: 100%;
		box-sizing: border-box;
		padding: 20upx 30upx 0;
	}

	.feedback-input {
		font-size: 28upx;
		height: 72upx;
		min-height: 50upx;
		padding: 15upx 20upx;
		line-height: 72upx;
	}

	.feedback-uploader {
		padding: 22upx 20upx;
	}
</style>
