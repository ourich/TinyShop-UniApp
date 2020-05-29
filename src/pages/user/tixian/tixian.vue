<template>
	<view class="recharge">
		<view class="block">
			<view class="title">
				我的账户
			</view>
			<view class="content">
				<view class="my">
					我的账户余额：
					<text class="balance">{{ userInfo.account && userInfo.account.user_money || '0' }}</text>
					元
				</view>
			</view>
		</view>
		<view class="block">
			<view class="title">
				提现金额
			</view>
			<view class="content">
				<view class="amount">
					<view class="list">
						<view class="box" v-for="(amount,index) in amountList" :key="index" @tap="select(amount)"
						      :class="{'on':amount.price == inputAmount}">
							<view class="real">{{amount.price}}元</view>
							<text class="give">手续费 {{ amount.give_price }}元</text>
						</view>
					</view>
					<view class="num">
						<view class="text">
							自定义提现金额
						</view>
						<view class="input">
							<input type="number" @input="handleInputAmountChange" v-model="inputAmount"/>
						</view>
						<text class="give" v-if="inputAmountGive > 0">手续费 {{ inputAmountGive }}元</text>
					</view>
				</view>
			</view>
		</view>
		<view class="block">
			<view class="title">
				选择提现方式
			</view>
			<view class="content">
				<view class="pay-list">
					<view class="row" @tap="payType='3'">
						<i class="icon iconfont iconqia"></i>
						<view class="center">
							银行卡提现
						</view>
						<view class="right">
							<radio :checked="payType=='3'" color="#f06c7a"/>
						</view>
					</view>
					<view class="row" @tap="payType='2'">
						<i class="icon iconfont iconalipay"></i>
						<view class="center">
							支付宝提现
						</view>
						<view class="right">
							<radio :checked="payType=='2'" color="#f06c7a"/>
						</view>
					</view>
					<view class="row" @tap="payType='1'">
						<i class="icon iconfont iconweixinzhifu"></i>
						<view class="center">
							微信提现
						</view>
						<view class="right">
							<radio :checked="payType=='1'" color="#f06c7a"/>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="block">
			<view class="title">
				收款账户
			</view>
			<view class="input-content">
				<view class="input-item">
					<text class="tit">开户姓名</text>
					<input
						type="text"
						v-model="profileInfo.name"
						placeholder="请输入开户姓名"
					/>
				</view>
				<view class="input-item">
					<text class="tit">联系电话</text>
					<input
						type="number"
						v-model="profileInfo.mobile"
						placeholder="请输入联系电话"
					/>
				</view>
				
			</view>
			<view class="input-content" v-if="payType=='3'">
				<view class="input-item">
					<text class="tit">开户银行</text>
					<input
						type="number"
						v-model="profileInfo.bank_name"
						placeholder="请输入开户银行"
					/>
				</view>
				<view class="input-item">
					<text class="tit">银行账号</text>
					<input
						type="text"
						v-model="profileInfo.account"
						placeholder="请输入银行账号"
					/>
				</view>
			</view>
			<view class="input-content" v-else>
				<view class='feedback-title'>
					<text>收款码(提供收款码截图,总大小10M以下)</text>
				</view>
				<view class="feedback-body feedback-uploader rf-uploader">
					<view class="uni-uploader">
						<view class="uni-uploader-body">
							<view class="uni-uploader__files">
								<block v-for="(image,index) in imageList" :key="index">
									<view class="uni-uploader__file" style="position: relative;">
										<rf-image class="uni-uploader__img" :src="image"></rf-image>
										<view class="close-view" @tap="close(index)">x</view>
									</view>
								</block>
								<view class="uni-uploader__input-box" v-if="imageList.length < 1">
									<view class="uni-uploader__input" @tap="uploadImage"></view>
								</view>
							</view>
						</view>
					</view>
				</view>
				
			</view>
		</view>
		<view class="add-btn-wrapper">
				<button class="add-btn" @tap="toUpdateInfo">提交申请</button>
		</view>

		<!--加载动画-->
		<rf-loading v-if="pageLoading"></rf-loading>
	</view>
</template>

<script>
    import {memberInfo, tixianCreate, uploadImage} from '@/api/userInfo';

    export default {
        data() {
            return {
                inputAmount: 0,//金额
                inputAmountGive: 0,//金额
                // amountList: [],//预设3个可选快捷金额
				amountList: [
					{
						price: '100',
						give_price: '5'
					},
					{
						price: '200',
						give_price: '10'
					},
					{
						price: '500',
						give_price: '25'
					}],
                payType: 1,//支付类型
                userInfo: {},
				profileInfo: {},
				imageList: [],
                loading: false,
                providerList: [],
                code: null,
                pageLoading: true
            };
        },
        onLoad(options) {
            this.initData(options);
        },
        methods: {
        	  // 计算充值送的钱 后台配置
            handleInputAmountChange(e) {
                this.inputAmount = parseFloat(e.detail.value);
                this.inputAmountGive = parseFloat(e.detail.value * 0.05);
            },
			// 更新用户信息
			async toUpdateInfo(){
				this.handleUpdateInfo();
			},
			// 更新用户信息
			async handleUpdateInfo () {
				this.profileInfo.account_img = JSON.stringify(this.imageList[0]);
				this.btnLoading = true;
				this.loadProgress = this.loadProgress + 6;
			const timer = setInterval(() => {
					this.loadProgress = this.loadProgress + 6;
			}, 50);
				await this.$http.post(`${tixianCreate}`, {
					...this.profileInfo,
					type: this.payType,
					money: this.inputAmount,
					fee: this.inputAmountGive
				}).then(() =>{
				    clearInterval(timer);
						this.loadProgress = 0;
				    this.$mHelper.toast('提交成功，请等待审核打款!');
				    setTimeout(() => {
					    this.$mRouter.back();
				    }, 1 * 1000);
				}).catch(() => {
					this.btnLoading = false;
				});
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
            // 充值成功后更新用户信息
            async getMemberInfo() {
                this.$http.get(memberInfo).then(r => {
                    uni.setStorage({
                        key: 'userInfo',
                        data: r.data
                    })
                    this.userInfo = r.data || undefined;
                })
            },
            toTipDetail() {
            	this.$mRouter.push({route: '/pages/set/about/detail?field=protocol_recharge&title=充值协议'});
            },
            // 初始化数据
            async initData(options) {
                this.code = options.code;
                this.userInfo = uni.getStorageSync('userInfo') || undefined;
				this.inputAmount = this.amountList[0] && this.amountList[0].price || 0.01;
				this.inputAmountGive = this.amountList[0] && this.amountList[0].give_price || 0;
				this.pageLoading = false;
            },
            select(item) {
                this.inputAmount = item.price;
                this.inputAmountGive = item.give_price;
            }
        }
    }
</script>

<style lang="scss">
	page {
		background-color: $color-white;
	}

	.block {
		width: 100%;
		padding: 20upx;

		.title {
			width: 100%;
			font-size: 34upx;
		}
		.input-content{
			padding: 20upx 20upx;
			.input-item{
				display:flex;
				padding: 0 30upx;
				background: $page-color-light;
				height: 80upx;
				line-height: 80upx;
				border-radius: 4px;
				margin-bottom: 30upx;
				&:last-child{
					margin-bottom: 0;
				}
				.tit{
					width: 120upx;
					font-size: $font-sm+2upx;
					color: $font-color-base;
				}
				input {
					height: 80upx;
					line-height: 80upx;
					font-size: $font-base + 2upx;
					color: $font-color-dark;
				}
				.date {
					height: 80upx;
					line-height: 80upx;
					font-size: $font-base + 2upx;
					color: $font-color-dark;
				}
				.gender-item {
					margin-right: 20upx;
					.gender-item-text {
						padding: 0 5upx;
					}
					radio .wx-radio-input.wx-radio-input-checked {
						background: $uni-color-primary;
						border-color: $uni-color-primary;
					}
				}
			}
		}

		.content {
			.my {
				width: 100%;
				height: 120upx;
				display: flex;
				align-items: center;
				font-size: $font-lg;
				border-bottom: solid 1upx #eee;

				.balance {
					margin-right: 6upx;
					color: $base-color;
					font-size: $font-lg + 4upx;
				}
			}

			.amount {
				width: 100%;

				.list {
					display: flex;
					justify-content: space-between;
					padding-top: 20upx;
					flex-wrap: wrap;

					.box {
						width: 31%;
						margin-bottom: 20upx;
						height: 120upx;
						text-align: center;
						border-radius: 10upx;
						box-shadow: 0upx 5upx 20upx rgba(0, 0, 0, 0.05);
						background-color: #f1f1f1;
						color: 333;

						&.on {
							background-color: #f06c7a;
							color: #fff;

							.give {
								color: #fff;
							}
						}

						.real {
							font-size: $font-lg;
							margin-top: 10upx;
						}

						.give {
							display: block;
							font-size: $font-sm;
							color: $base-color;
						}
					}
				}

				.num {
					margin-top: 10upx;
					display: flex;
					justify-content: flex-end;
					align-items: center;

					.text {
						padding-right: 10upx;
						font-size: 30upx;
					}

					.give {
						font-size: $font-sm;
						color: $base-color;
					}

					.input {
						width: 28.2vw;
						border-bottom: solid 2upx #999;
						justify-content: flex-end;
						align-items: center;

						input {
							margin: 0 20upx;
							height: 60upx;
							font-size: 30upx;
							color: #f06c7a;
							justify-content: flex-end;
							align-items: center;
						}
					}
				}
			}

			.pay-list {
				width: 100%;
				border-bottom: solid 1upx #eee;

				.row {
					width: 100%;
					height: 120upx;
					display: flex;
					align-items: center;

					.icon {
						width: 100upx;
						font-size: 52upx;
						margin-left: 15upx;
					}

					.iconerjiye-yucunkuan {
						color: #fe8e2e;
					}

					.iconweixinzhifu {
						color: #36cb59;
					}

					.iconalipay {
						color: #01aaef;
					}

					.center {
						width: 100%;
						font-size: 30upx;
					}

					.right {
						width: 100upx;
						flex-shrink: 0;
						display: flex;
						justify-content: flex-end;
					}
				}
			}
		}
	}

	.pay {
		margin-top: 20upx;
		width: 100%;
		display: flex;
		justify-content: center;
		flex-wrap: wrap;

		.btn {
			width: 70%;
			height: 80upx;
			border-radius: 80upx;
			display: flex;
			justify-content: center;
			align-items: center;
			color: #fff;
			background-color: #f06c7a;
			box-shadow: 0upx 5upx 10upx rgba(0, 0, 0, 0.2);
		}

		.tis {
			margin-top: 10upx;
			width: 100%;
			font-size: 24upx;
			display: flex;
			justify-content: center;
			align-items: baseline;
			color: #999;

			.terms {
				color: #5a9ef7;
			}
		}
	}

	.rmbLogo {
		font-size: 40upx;
	}

	button {
		background-color: #007aff;
		color: #ffffff;
	}

	.uni-h1.uni-center {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: flex-end;
	}

	.price {
		border-bottom: 1px solid #eee;
		width: 200upx;
		height: 80upx;
		padding-bottom: 4upx;
	}

	.ipaPayBtn {
		margin-top: 30upx;
	}
</style>
