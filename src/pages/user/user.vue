<template>
	<view class="user">
		<!--头部-->
		<view class="user-section">
			<!-- <image class="bg" :src="userBg"></image> -->
			<!--用户信息-->
			<view class="user-info-box">
				<view class="portrait-box" @tap="navTo(userInfo ? '/pages/user/userinfo/userinfo' : 'login')">
					<image class="portrait"
					       :src="userInfo.head_portrait || headImg"></image>
					<text class="username">
						{{ userInfo.realname || userInfo.nickname|| userInfo.mobile ||'请先登录'}}
					</text>
				</view>
			</view>
			<!--vip信息-->
			<!-- <view class="vip-card-box">
				<image class="card-bg" :src="vipCardBg"></image>
				<view class="tit">
					<i class="iconfont iconiLinkapp-"/>
					欢迎来到易企商城
				</view>
				<text class="e-m">易企商城 版权所有</text>
			</view> -->
		</view>
		
		<view class="my-account">
				<!--账户信息面板-->
		  <view class="header">
		    <view class="account">
		      <view class="assets">
		        <view>总资产(元)</view>
		        <view class="money">
					{{ userInfo && userInfo.account && userInfo.account.user_money || '0.00' }}
		        </view>
		      </view>
		      <text @tap="navTo('/pages/user/account/recharge')" class="recharge" >充值</text>
		    </view>
		    <view class="cumulative">
		      <view class="item" v-for="item in amountList" :key="item.title" @tap="navTo(item.url)">
		        <view>{{ item.title }}</view>
		        <view class="money">
					{{ item.value }}
		        </view>
		      </view>
		    </view>
		  </view>
			  <!--余额/积分导航-->
		  <view class="nav">
		    <view class="item" v-for="item in navList" :key="item.title" @tap="navTo(item.url)">
		      <text class="iconfont" :class="item.icon"></text>
		      <text>{{ item.title }}</text>
		    </view>
		  </view>
			  <!--广告-->
		  <view class="advert">
		      <view
		        class="item on"
		        @tap="navTo('/pages/user/coupon/list')"
		      >
		        <view class="text">
		          <view class="name">领取优惠券</view>
		          <text class="desc">满减享优惠</text>
		        </view>
		        <text class="iconfont iconwodeyouhuiquan"></text>
		      </view>
		    </view>
		</view>
		<!-- 个人中心 内容区-->
		<view
				class="cover-container"
				:style="[{
				transform: coverTransform,
				transition: coverTransition
			}]"
				@touchstart="coverTouchstart"
				@touchmove="coverTouchmove"
				@touchend="coverTouchend"
		>

			<!--设置中心-->
			<view class="promotion-center">
				<list-cell icon="iconshezhi1" iconColor="#e07472" @eventClick="navTo('/pages/set/set')"
				           title="服务中心"></list-cell>
				<view class="tj-sction">

					<!-- 分类列表 -->
					<view class="category-list">
						<view
								class="category"
								v-for="(item, index) in settingList"
								:key="index"
								@tap.stop="navTo(item.url)"
						>
							<view v-if="item.title!=='分享'">
								<view class="img">
									<text class="iconfont" :style="{color: item.color}" :class="item.icon"></text>
								</view>
								<view class="text">{{ item.title }}</view>
							</view>
							<button class="share-btn" open-type="share" @tap.tap="shareToH5" v-else>
								<view class="img">
									<text class="iconfont" :style="{color: item.color}" :class="item.icon"></text>
								</view>
								<view class="text">{{ item.title }}</view>
							</button>
						</view>
					</view>
				</view>
			</view>
			<!-- 我的订单 -->
			<view class="promotion-center">
				<list-cell icon="iconfapiaoguanli" iconColor="#e07472"
				           @eventClick="navTo(`/pages/index/search/search?keyword=搜索我的订单&type=order`)" title="搜索订单"></list-cell>
				<view class="order-section">
					<view
							class="order-item"
							v-for="item in orderSectionList"
							:key="item.title"
							@tap="navTo(item.url)"
							hover-class="common-hover"
							:hover-stay-time="50">
						<i class="iconfont" :class="item.icon"/>
						<text>{{ item.title }}</text>
						<rf-badge type="error" size="small" class="badge" :text="item.num"></rf-badge>
					</view>
				</view>
			</view>
		</view>
		<!--页面加载动画-->
		<rf-loading v-if="loading"></rf-loading>
	</view>
</template>
<script>
    /**
     * @des 个人中心
     *
     * @author stav stavyan@qq.com
     * @date 2020-01-10 11:41
     * @copyright 2019
     */
    import {footPrintList, memberInfo} from '@/api/userInfo';
    import listCell from '@/components/rf-list-cell';
    import {mapMutations} from 'vuex';
    import rfBadge from '@/components/rf-badge/rf-badge'
    let startY = 0, moveY = 0, pageAtTop = true;
    export default {
        components: {
            listCell,
            rfBadge
        },
        data() {
            return {
                settingList: this.$mConstDataConfig.settingList,
                orderSectionList: this.$mConstDataConfig.orderSectionList,
                amountList: this.$mConstDataConfig.amountList,
                promotionList: this.$mConstDataConfig.promotionList,
                headImg: this.$mAssetsPath.headImg,
                vipCardBg: this.$mAssetsPath.vipCardBg,
                arc: this.$mAssetsPath.arc,
                userBg: this.$mAssetsPath.userBg,
                coverTransform: 'translateY(0px)',
                coverTransition: '0s',
                moving: false,
                userInfo: { // 用户信息
                    promoter: null  // 分销商信息
                },
                footPrintList: [], // 足迹列表
				navList: [
				  {title: '账单记录', icon: 'icondaifukuan', url: '/pages/user/account/bill'},
				  {title: '充值记录', icon: 'iconchongzhijilu', url: '/pages/user/account/bill?state=2'},
				  {title: '消费记录', icon: 'iconzuheduozhongxiaofeifangshizuhexiaofei', url: '/pages/user/account/bill?state=3'},
				  {title: '积分中心', icon: 'iconjifenqia', url: '/pages/user/account/integral'}
				],
                loading: true,
		            hasLogin: false
            }
        },
        // 小程序分享
        onShareAppMessage() {
            return {
                title: '欢迎来到易企商城',
                path: '/pages/index/index'
            }
        },
        async onShow() {
            // 初始化数据
            this.initData();
        },
        // #ifndef MP
        onNavigationBarButtonTap(e) {
            const index = e.index;
            if (index === 0) {
                this.navTo('/pages/set/set');
            } else if (index === 1) {
                // #ifdef APP-PLUS
                const pages = getCurrentPages();
                const page = pages[pages.length - 1];
                const currentWebview = page.$getAppWebview();
                currentWebview.hideTitleNViewButtonRedDot({
                    index
                });
                // #endif
                this.$mRouter.push({route: '/pages/index/notice/notice'});
            }
        },
        // #endif
        methods: {
            // h5分享
            shareToH5() {
                // #ifdef H5
                this.$mHelper.toast('请复制连接进行分享');
                // #endif
            },
            ...mapMutations(['login']),
            // 数据初始化
            async initData() {
            	this.hasLogin = this.$mStore.getters.hasLogin;
                if (this.hasLogin) {
                    await this.getMemberInfo();
                    await this.initCartItemCount();
                } else {
                    this.loading = false;
                    this.resetSectionData();
                }
            },
            // 设置购物车数量角标
            async initCartItemCount() {
							if (this.hasLogin && parseInt(uni.getStorageSync('cartNum'), 10) > 0) {
                await uni.setTabBarBadge({
                  index: this.$mConstDataConfig.cartIndex,
                  text: uni.getStorageSync('cartNum')
                });
							} else {
                uni.removeStorageSync('cartNum');
                uni.removeTabBarBadge({index: this.$mConstDataConfig.cartIndex});
							}
            },
            // 获取用户信息
            async getMemberInfo() {
                await this.$http.get(memberInfo).then(async r => {
                    this.loading = false;
                    this.userInfo = r.data;
                    await uni.setStorageSync('cartNum', r.data.cart_num);
                    // 获取足迹列表
                    await this.getFootPrintList();
                    await this.setSectionData(r.data);
                }).catch(() => {
                	  this.hasLogin = false;
                	  this.userInfo = {};
                    this.resetSectionData();
                    this.loading = false;
                });
            },
            // 清空个人中心的各模块状态
            resetSectionData() {
                uni.removeTabBarBadge({index: this.$mConstDataConfig.cartIndex});
                this.amountList[0].value = 0;
                this.amountList[1].value = 0;
                this.promotionList[0].value = 0;
                this.promotionList[1].value = 0;
                this.promotionList[2].value = 0;
                this.orderSectionList[0].num = 0;
                this.orderSectionList[1].num = 0;
                this.orderSectionList[2].num = 0;
                this.orderSectionList[3].num = 0;
                this.orderSectionList[4].num = 0;
            },
            // 给个人中心的各模块赋值
            setSectionData(data) {
                const orderSynthesizeNumArr = [];
                for (let item in data.order_synthesize_num) {
                    orderSynthesizeNumArr.push(data.order_synthesize_num[item])
                }
                for (let i = 0; i < this.orderSectionList.length; i++) {
                    this.orderSectionList[i].num = orderSynthesizeNumArr[i].toString();
                }
                this.amountList[0].value = data.coupon_num || 0;
                this.amountList[1].value = data.account.user_integral || 0;
                this.promotionList[0].value = data.promoter && data.promoter.accumulate_brokerage || 0;
                this.promotionList[1].value = data.promoter && data.promoter.user_brokerage || 0;
                this.promotionList[2].value = data.promoter && data.promoter.amount_drawn_brokerage || 0;
                // 更新userInfo缓存
                uni.setStorageSync('userInfo', data);
            },
            // 获取足迹列表
            async getFootPrintList() {
                await this.$http.get(`${footPrintList}`).then(r => {
                    this.footPrintList = r.data
                });
            },
            // 统一跳转接口,拦截未登录路由
            navTo(route) {
                if (!route) {
                    return;
                }
                if (!this.hasLogin) {
                    uni.showModal({
                        content: '你暂未登陆，是否跳转登录页面？',
                        success: (confirmRes) => {
                            if (confirmRes.confirm) {
                                this.$mRouter.push({route: '/pages/public/logintype'});
                            }
                        }
                    });
                } else {
                    this.$mRouter.push({route});
                }
            },
            /**
             *  会员卡下拉和回弹
             *  1.关闭bounce避免ios端下拉冲突
             *  2.由于touchmove事件的缺陷（以前做小程序就遇到，比如20跳到40，h5反而好很多），下拉的时候会有掉帧的感觉
             *    transition设置0.1秒延迟，让css来过渡这段空窗期
             *  3.回弹效果可修改曲线值来调整效果，推荐一个好用的bezier生成工具 http://cubic-bezier.com/
             */
            coverTouchstart(e) {
                if (pageAtTop === false) {
                    return;
                }
                this.coverTransition = 'transform .1s linear';
                startY = e.touches[0].clientY;
            },
            coverTouchmove(e) {
                moveY = e.touches[0].clientY;
                let moveDistance = moveY - startY;
                if (moveDistance < 0) {
                    this.moving = false;
                    return;
                }
                this.moving = true;
                if (moveDistance >= 80 && moveDistance < 100) {
                    moveDistance = 80;
                }
                if (moveDistance > 0 && moveDistance <= 80) {
                    this.coverTransform = `translateY(${moveDistance}px)`;
                }
            },
            coverTouchend() {
                if (this.moving === false) {
                    return;
                }
                this.moving = false;
                this.coverTransition = 'transform 0.3s cubic-bezier(.21,1.93,.53,.64)';
                this.coverTransform = 'translateY(0px)';
            }
        }
    }
</script>
<style lang='scss' scoped>
	page {
		background-color: $page-color-base;
	}

	.user {
		.my-account {
			padding: 32upx 30upx 0;
			margin-top: -200upx;
			width: 100%;
			background-color: #FFFFFF;
			.header {
			  padding: 30upx;
			  height: 320upx;
			  background-color: $base-color;
			  /* opacity: 0.9; */
			  border-radius: 20upx;
			  color: rgba(255, 255, 255, 0.6);
			  font-size: $font-sm;
			  position: relative;
			  .account {
				width: calc(100% - 60upx);
				display: flex;
				position: absolute;
				z-index: 2;
				justify-content: space-between;
				.assets {
				  .money {
					color: #fff;
					font-size: $font-lg + 10upx;
					margin: 0;
				  }
				}
				.recharge {
				  font-size: $font-base;
				  width: 150upx;
				  height: 54upx;
				  line-height: 54upx;
				  border-radius: $font-base;
				  background-color: #fff9f8;
				  text-align: center;
				  color: $base-color;
				  margin-top: 10upx;
				}
			  }
			  .cumulative {
				width: calc(100% - 240upx);
				position: absolute;
				bottom: 20upx;
				display: flex;
				justify-content: space-between;
				.money {
				  color: #fff;
				  font-size: $font-lg + 4upx;
				  margin: 0;
				}
			  }
			  .header-bg {
				position: absolute;
				width: 100%;
				height: 320upx;
				z-index: 1;
				top: 0;
				image {
				  width: 100%;
				  height: 320upx
				}
			  }
			}
			.nav{
			  border-bottom:1px solid #f5f5f5;
			  display: flex;
			  .item{
				flex:1;
				margin: 20upx;
				font-size: $font-base - 4upx;
				display: inline-block;
				text-align:center;
				color:#999;
				.iconfont {
				  display: block;
				  margin: 0 auto;
				  font-size: $font-lg + 20upx;
				  color: $base-color;
				}
			  }
			}
			.advert{
			  display: flex;
			  .item{
				background-color:#fff6d1;
				flex: 1;
				border-radius: 24upx;
				padding: 10upx 0;
				margin: 20upx 10upx;
				color: $base-color;
				display: flex;
				justify-content: space-between;
				.iconfont {
				  font-size: $font-lg + 20upx;
				  margin-right: 20upx;
				}
				.text {
				  margin-left: 20upx;
				  .name{
					font-size: $font-base;
					font-weight: bold;
					height: 40upx;
					color: $base-color;
				  }
				  .desc {
					font-size: $font-sm - 2upx;
				  }
				}
			  }
			  .on{
				  background-color:#fff3f3;
				}
			}
		  }
		.user-section {
			background-color: #FFFFFF;
			height: 450upx;
			padding: 100upx 30upx 0;
			position: relative;

			.bg {
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;
				filter: blur(1px);
				/* opacity: .7; */
			}

			.user-info-box {
				height: 180upx;
				display: flex;
				align-items: center;
				position: relative;
				z-index: 1;
				justify-content: space-between;

				.portrait-box {
					display: flex;
					align-items: center;

					.portrait {
						width: 130upx;
						height: 130upx;
						border: 5upx solid #fff;
						border-radius: 50%;
					}

					.username {
						font-size: $font-lg + 6upx;
						color: $font-color-dark;
						margin-left: 20upx;
					}

					button {
						background-color: transparent;
						font-size: $font-lg + 6upx;
						color: $font-color-dark;
						border: none;
					}

					button::after {
						border: none;
					}
				}
			}

			.vip-card-box {
				display: flex;
				flex-direction: column;
				color: #f7d680;
				height: 240upx;
				background: linear-gradient(to left, rgba(0, 0, 0, .7), rgba(0, 0, 0, .8));
				border-radius: 16upx 16upx 0 0;
				overflow: hidden;
				position: relative;
				padding: 20upx 24upx;

				.card-bg {
					position: absolute;
					top: 20upx;
					right: 0;
					width: 380upx;
					height: 260upx;
				}

				.tit {
					font-size: $font-base+2upx;
					color: #f7d680;
					margin-bottom: 28upx;

					.iconfont {
						color: #f6e5a3;
						display: inline-block;
						margin-right: 16upx;
					}
				}
			}
		}

		.cover-container {
			/* margin-top: -150upx; */
			padding: 0 30upx 20upx;
			position: relative;
			background-color: $page-color-base;

			.arc {
				position: absolute;
				left: 0;
				top: -34upx;
				width: 100%;
				height: 36upx;
			}

			.promotion-center {
				background: #fff;
				margin: 20upx 0;
				/*分类列表*/
				.category-list {
					width: 100%;
					padding: 0 0 30upx 0;
					border-bottom: solid 2upx #f6f6f6;
					display: flex;
					flex-wrap: wrap;

					.category {
						width: 33.3%;
						margin-top: 50upx;
						display: flex;
						justify-content: center;
						flex-wrap: wrap;

						.img {
							width: 100%;
							display: flex;
							justify-content: center;

							.iconfont {
								font-size: $font-lg + 24upx;
							}
						}

						.text {
							width: 100%;
							display: flex;
							justify-content: center;
							font-size: 24upx;
							color: #3c3c3c;
						}

						.share-btn {
							height: 142upx;
							text-align: left;
							background: none;
							padding: 0;
							margin: 0;
						}

						.share-btn:after {
							border: none;
							border-radius: none;
						}
					}
				}
			}

			.tj-sction {
				@extend %section;
				display: flex;

				.tj-item {
					@extend %flex-center;
					flex: 1;
					flex-direction: column;
					margin: 30upx 0;
					font-size: $font-sm;
					color: #75787d;
					/*border-right: 2upx solid rgba(0, 0, 0, 0.2);*/
				}

				/*.tj-item:last-child {*/
				/*border-right: none;*/
				/*}*/
				.num {
					font-size: $font-base;
					color: $font-color-dark;
				}

				.red {
					color: $base-color;
				}
			}

			.order-section {
				@extend %section;
				padding: 28upx 0;

				.order-item {
					@extend %flex-center;
					width: 120upx;
					height: 120upx;
					border-radius: 10upx;
					font-size: $font-sm;
					color: $font-color-dark;
					position: relative;
				}

				.badge {
					position: absolute;
					top: 0;
					right: 4upx;
				}

				.iconfont {
					font-size: 48upx;
					color: #fa436a;
				}

				.icon-shouhoutuikuan {
					font-size: 44upx;
				}
			}

			.history-section {
				background: #fff;
				border-radius: 10upx;
				.sec-header {
					display: flex;
					align-items: center;
					font-size: $font-base;
					color: $font-color-dark;
					.iconfont {
						color: #5eba8f;
						margin-right: 16upx;
						line-height: 40upx;
					}
					.content {
						flex: 1;
					}
					.iconyou {
						font-size: $font-base + 2upx;
						color: $font-color-base;
						margin-left: $uni-spacing-row-sm;
					}
				}
				.h-list {
					white-space: nowrap;
					padding: 20upx 30upx 0;
					.h-item {
						display: inline-block;
						font-size: $font-sm;
						color: $font-color-base;
						width: 160upx;
						margin-right: 20upx;
						border-radius: 10upx;
						.h-item-img {
							width: 160upx;
							height: 160upx;
						}
						.h-item-text {
							font-size: $font-sm;
						}
					}
				}

				.no-foot-print {
					text-align: center;
					padding: 48upx 0;

					.no-foot-print-icon {
						color: $base-color;
						font-size: $font-lg + 2upx;
						margin-right: 10upx;
					}
				}

				.share-btn {
					height: 102upx;
					text-align: left;
					background: none;
					padding: 0;
					margin: 0;
				}

				.share-btn:after {
					border: none;
					border-radius: none;
				}
			}
		}
	}

	%flex-center {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	%section {
		justify-content: space-around;
		display: flex;
		align-content: center;
		background: #fff;
		border-radius: 10upx;
	}
</style>
