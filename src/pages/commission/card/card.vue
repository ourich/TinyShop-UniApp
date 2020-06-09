<template>
  <view class="my-coupon">
    <!--顶部导航栏-->
    <view class="tabr" :style="{top:headerTop}">
      <view :class="{on:typeClass=='valid'}" @tap="switchType('valid', 1)">可用
        <text v-if="state === 1">({{couponList.length}})</text>
      </view>
      <view :class="{on:typeClass=='used'}" @tap="switchType('used', 2)">已使用
        <text v-if="state === 2">({{couponList.length}})</text>
      </view>
      <view :class="{on:typeClass=='invalid'}" @tap="switchType('invalid', 3)">已失效
        <text v-if="state === 3">({{couponList.length}})</text>
      </view>
      <view class="border" :class="typeClass"></view>
    </view>
    <!--占位符-->
    <view class="place"></view>
    <!--优惠券列表-->
    <view class="coupon-list">
      <view v-if="state === 3 && couponList.length > 0" class="empty-invalid" @tap.stop="emptyInvalidCoupon">
        <view class="icon shanchu"></view>
        清空失效优惠券
      </view>
      <!-- 优惠券列表 -->
      <view class="sub-list valid" :style="{marginTop: state === 3 ? '50upx' : 0}">
		  <view class="tui-coupon-item tui-top20" v-for="(row,index) in couponList" :key="index">
		  	<image :src="webURL+'/static/images/mall/coupon/bg_coupon_3x.png'" class="tui-coupon-bg" mode="widthFix"></image>
		  	<image :src="webURL+getSignUrl(state)" class="tui-coupon-sign" v-if="state>1"></image>
		  	<view class="tui-coupon-item-left">
		  		<view class="tui-coupon-price-box" :class="{'tui-color-grey':state>1}">
		  			<view class="tui-coupon-price-sign" >￥</view>
		  			<!--tui-price-small 面值>4位数的时候为true-->
		  			<view class="tui-coupon-price">100</view>
		  			<!-- <view class="tui-coupon-price-sign" v-if="coupon.type==1">折</view> -->
		  		</view>
		  		<view class="tui-coupon-intro">全国通用</view>
		  	</view>
		  	<view class="tui-coupon-item-right">
		  		<view class="tui-coupon-content">
		  			<view class="tui-coupon-title-box">
		  				<view class="tui-coupon-btn" :class="{'tui-bg-grey':state>1}">抵扣金</view>
		  				<view class="tui-coupon-title">限加油使用</view>
		  			</view>
		  			<view class="tui-coupon-rule">
		  				<view class="tui-rule-box tui-padding-btm">
		  					<view class="tui-coupon-circle"></view>
		  					<view class="tui-coupon-text">加油时抵扣部分现金</view>
		  				</view>
		  				<view class="tui-rule-box">
		  					<view class="tui-coupon-circle"></view>
		  					<view class="tui-coupon-text">No:{{row.title}}</view>
		  				</view>
		  			</view>
		  		</view>
		  	</view>
		  	<view class="tui-btn-box" v-if="state===1">
		  		<tui-button type="danger" width="152rpx" height="52rpx" :size="24" shape="circle" plain>立即使用</tui-button>
		  	</view>
		  </view>
        <!--  -->
      </view>
      <rf-load-more :status="loadingType" v-if="couponList.length > 0"></rf-load-more>
	  <tui-nomore ></tui-nomore>
    </view>
    <rf-empty :info="'暂无优惠券'" v-if="couponList.length === 0 && !loading"></rf-empty>
    <!--显示部分商品的抽屉-->
    <uni-drawer class="rf-drawer" :visible="showRight" mode="right" @close="closeDrawer()">
      <view class="rf-drawer-title">可用商品列表</view>
      <view class="rf-drawer-list">
        <view class="rf-drawer-item" @tap="navTo(`/pages/product/product?id=${item.id}`)" v-for="item in currentCoupon.usableProduct" :key="item.id">
          <view class="left">
            <view class="title">{{ item.name.split('】')[0].split('【').join('') }}</view>
            <view class="desc in2line">{{item.name.split('】')[1]}}</view>
          </view>
          <text class="iconfont iconyou"></text>
        </view>
      </view>
      <view class="close">
        <button class="btn" plain="true" size="small" type="primary" @tap="hide">关闭</button>
      </view>
    </uni-drawer>
    <rf-loading v-if="loading"></rf-loading>
  </view>
</template>

<script>
	/**
	 * @des 优惠券管理
	 *
	 * @author stav stavyan@qq.com
	 * @date 2019-12-09 10:13
	 * @copyright 2019
	 */
	import {couponClear, myCouponList} from "@/api/userInfo";
	import rfLoadMore from '@/components/rf-load-more/rf-load-more';

	import moment from '@/common/moment';
	import uniDrawer from '@/components/uni-drawer/uni-drawer'

	export default {
		components: {
			rfLoadMore,
			uniDrawer
		},
		data() {
			return {
				headerTop: 0,
				//控制滑动效果
				typeClass: 'valid',
				theIndex: null,
				oldIndex: null,
				state: 1,
				isStop: false,
				couponList: [],
				loadingType: 'more',
				token: null,
				page: 1,
				showRight: false,
				currentCoupon: {},
				loading: true,
				webURL: "https://www.thorui.cn/wx"
			}
		},
		filters: {
			// 格式化时间
			time(val) {
				return moment(val * 1000).format('YYYY-MM-DD')
			},
			// 格式化时间
			timeFull(val) {
				return moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')
			}
		},
		//下拉刷新，需要自己在page.json文件中配置开启页面下拉刷新 "enablePullDownRefresh": true
		onPullDownRefresh() {
			this.page = 1;
			this.couponList = [];
			this.getMyCouponList('refresh');
		},
		//加载更多
		onReachBottom() {
			this.page++;
			this.getMyCouponList();
		},
		onLoad() {
			// 数据初始化
			this.initData();
			//兼容H5下排序栏位置
			// #ifdef H5
			//定时器方式循环获取高度为止，这么写的原因是onLoad中head未必已经渲染出来。
			let Timer = setInterval(() => {
				let uniHead = document.getElementsByTagName('uni-page-head');
				if (uniHead.length > 0) {
					this.headerTop = uniHead[0].offsetHeight + 'px';
					clearInterval(Timer);//清除定时器
				}
			}, 1);
			// #endif
		},
		methods: {
			// 显示抽屉(可使用商品)
			show(item) {
				if (item.usableProduct.length === 0) return;
				this.currentCoupon = item;
				this.showRight = true
			},
			// 隐藏抽屉
			hide() {
				this.showRight = false
			},
			// 关闭抽屉
			closeDrawer() {
				this.showRight = false
			},
			getSignUrl: function(index) {
				let url = "";
				if (index == 1) {
					url = "/static/images/mall/coupon/img_coupon_beused_3x.png"
				} else if (index == 2) {
					url = "/static/images/mall/coupon/img_coupon_failure_3x.png"
				}
				return url
			},
			// 切换顶部优惠券类型
			switchType(type, state) {
				if (this.typeClass === type) {
					return;
				}
				uni.pageScrollTo({
					scrollTop: 0,
					duration: 0
				})
				this.typeClass = type;
				this.state = state;
				this.page = 1;
				this.couponList = [];
				this.loading = true;
				this.getMyCouponList();
			},
			// 清空失效优惠券
			async emptyInvalidCoupon() {
				await this.$http.get(`${couponClear}`).then(() => {
					this.getMyCouponList();
				})
			},
			// 占位方法
			discard() {
				//丢弃
			},
			// 初始化数据
			initData() {
				this.page = 1;
				this.couponList = [];
				this.getMyCouponList();
			},
			// 统一跳转接口
			navTo(route, type) {
				if (type) {
					this.$mRouter.switchTab({route});
				} else {
					this.$mRouter.push({route});
				}
			},
			// 获取我的优惠券列表
			async getMyCouponList(type) {
				await this.$http.get(`${myCouponList}`, {
					page: this.page,
					state: this.state
				}).then(r => {
					this.loading = false;
					if (type === 'refresh') {
						uni.stopPullDownRefresh();
					}
					this.loadingType = r.data.length === 10 ? 'more' : 'nomore';
					this.couponList = [...this.couponList, ...r.data]
				}).catch(() => {
					this.loading = false;
					if (type === 'refresh') {
						uni.stopPullDownRefresh();
					}
        });
			}
		}
	}
</script>
<style lang="scss">
  view {
    display: flex;
    flex-wrap: wrap;
  }

  page {
    position: relative;
    background-color: $page-color-base
  }
  .tui-coupon-item {
  	height: 210rpx;
  	position: relative;
  	display: flex;
  	align-items: center;
  	padding-right: 30rpx;
  	box-sizing: border-box;
  	overflow: hidden;
	width: 92%;
	margin: 20upx auto 10upx;
  }
  
  .tui-coupon-bg {
  	width: 100%;
  	height: 210rpx;
  	position: absolute;
  	left: 0;
  	top: 0;
  	z-index: 1;
  }
  
  .tui-coupon-sign {
  	height: 110rpx;
  	width: 110rpx;
  	position: absolute;
  	z-index: 9;
  	top: -30rpx;
  	right: 40rpx;
  }
  
  .tui-coupon-item-left {
  	width: 218rpx;
  	height: 210rpx;
  	position: relative;
  	z-index: 2;
  	display: flex;
  	align-items: center;
  	justify-content: center;
  	flex-direction: column;
  	flex-shrink: 0;
  }
  
  .tui-coupon-price-box {
  	display: flex;
  	color: #e41f19;
  	align-items: flex-end;
  }
  
  .tui-coupon-price-sign {
  	font-size: 30rpx;
  }
  
  .tui-coupon-price {
  	font-size: 70rpx;
  	line-height: 68rpx;
  	font-weight: bold;
  }
  
  .tui-price-small {
  	font-size: 58rpx !important;
  	line-height: 56rpx !important;
  }
  
  
  .tui-coupon-intro {
  	background: #F7F7F7;
  	padding: 8rpx 10rpx;
  	font-size: 26rpx;
  	line-height: 26rpx;
  	font-weight: 400;
  	color: #666;
  	margin-top: 18rpx;
  }
  
  .tui-coupon-item-right {
  	flex: 1;
  	height: 210rpx;
  	position: relative;
  	z-index: 2;
  	display: flex;
  	align-items: center;
  	justify-content: space-between;
  	padding-left: 24rpx;
  	box-sizing: border-box;
  	overflow: hidden;
  }
  
  .tui-coupon-content {
  	width: 82%;
  	display: flex;
  	flex-direction: column;
  	justify-content: center;
  }
  
  .tui-coupon-title-box {
  	display: flex;
  	align-items: center;
	flex-wrap: nowrap;
  }
  
  .tui-coupon-btn {
  	padding: 6rpx;
  	background: #FFEBEB;
  	color: #e41f19;
  	font-size: 25rpx;
  	line-height: 25rpx;
  	display: flex;
  	align-items: center;
  	justify-content: center;
  	transform: scale(0.9);
  	transform-origin: 0 center;
  	border-radius: 4rpx;
  	flex-shrink: 0;
  }
  
  .tui-color-grey {
  	color: #888 !important;
  }
  
  .tui-bg-grey {
  	background: #F0F0F0 !important;
  	color: #888 !important;
  }
  
  .tui-coupon-title {
  	width: 100%;
  	font-size: 26rpx;
  	color: #333;
  	white-space: nowrap;
  	overflow: hidden;
  	text-overflow: ellipsis;
  }
  
  .tui-coupon-rule {
  	padding-top: 52rpx;
  }
  
  .tui-rule-box {
  	display: flex;
  	align-items: center;
  	transform: scale(0.8);
  	transform-origin: 0 100%;
  }
  
  .tui-padding-btm {
  	padding-bottom: 6rpx;
  }
  
  .tui-coupon-circle {
  	width: 8rpx;
  	height: 8rpx;
  	background: rgb(160, 160, 160);
  	border-radius: 50%;
  }
  
  .tui-coupon-text {
  	font-size: 28rpx;
  	line-height: 28rpx;
  	font-weight: 400;
  	color: #666;
  	padding-left: 8rpx;
  	white-space: nowrap;
  }
  
  .tui-top20 {
  	margin-top: 20rpx;
  }
  
  .tui-coupon-title {
  	font-size: 28rpx;
  	line-height: 28rpx;
  }
  
  .tui-btn-box {
  	position: absolute;
  	width: 146rpx;
  	height: 52rpx;
  	right: 20rpx;
  	bottom: 40rpx;
  	z-index: 10;
  }

  .my-coupon {
    .place {
      width: 100%;
      height: 95upx;
    }

   .tabr {
      background-color: #fff;
      width: 100%;
      height: 95upx;
      padding: 0 3%;
      border-bottom: solid 1upx #dedede;
      position: fixed;
      top: 0;
      z-index: 10;

      view {
        width: 33.3%;
        height: 90upx;
        justify-content: center;
        align-items: center;
        font-size: 32upx;
        color: #999;
      }

      .on {
        color: $base-color;
      }

      .border {
        height: 4upx;
        background-color: $base-color;
        transition: all .3s ease-out;

        &.used {
          transform: translate3d(100%, 0, 0);
        }

        &.invalid {
          transform: translate3d(200%, 0, 0);
        }
      }

    }
  }

  .coupon-list {
    width: 100%;
    display: block;
    position: relative;
    .empty-invalid {
      position: absolute;
      right: 20upx;
      top: 10upx;
      font-size: $font-base;
      color: $base-color;

      .icon {
        font-size: $font-base;
        color: $base-color;
        margin-right: 8upx;
      }
    }
  }
  @keyframes showValid {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(0);
    }
  }
  @keyframes showInvalid {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }
  .sub-list {
    width: 100%;
    &.invalid {
      position: absolute;
      top: 0;
      left: 100%;
      display: none;
    }

    &.showvalid {
      display: flex;
      animation: showValid 0.20s linear both;
    }

    &.showinvalid {
      display: flex;
      animation: showInvalid 0.20s linear both;
    }

    .tis {
      width: 100%;
      height: 60upx;
      justify-content: center;
      align-items: center;
      font-size: 32upx;
    }

    .row {
      width: 92%;
      height: 24vw;
      margin: 20upx auto 10upx auto;
      border-radius: 8upx;
      // box-shadow: 0upx 0 10upx rgba(0,0,0,0.1);
      align-items: center;
      position: relative;
      overflow: hidden;
      z-index: 4;
      border: 0;

      .menu {
        .icon {
          color: #fff;
          font-size: 50upx;
        }

        position: absolute;
        width: 28%;
        height: 100%;
        right: 0;
        justify-content: center;
        align-items: center;
        background-color: $base-color;
        color: #fff;
        z-index: 2;
      }

      .carrier {
        @keyframes showMenu {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-28%);
          }
        }
        @keyframes closeMenu {
          0% {
            transform: translateX(-28%);
          }
          100% {
            transform: translateX(0);
          }
        }

        &.open {
          animation: showMenu 0.25s linear both;
        }

        &.close {
          animation: closeMenu 0.15s linear both;
        }

        background-color: #fff;
        position: absolute;
        width: 100%;
        padding: 0 0;
        height: 100%;
        z-index: 3;
        flex-wrap: nowrap;

        .left {
          width: 100%;
          position: relative;

          .title {
            padding-top: 3vw;
            width: 90%;
            margin: 0 5%;
            font-size: 36upx;

            .cell-icon {
              display: inline-block;
              height: 32upx;
              margin-top: 15upx;
              width: 32upx;
              font-size: 22upx;
              color: #fff;
              text-align: center;
              line-height: 32upx;
              background: #f85e52;
              border-radius: 4upx;
              margin-right: 12upx;

              &.hb {
                background: #ffaa0e;
              }

              &.lpk {
                background: #3ab54a;
              }

            }
          }

          .term {
            width: 90%;
            margin: 0 5%;
            font-size: 26upx;
            color: #999;
          }

          .usage {
            width: 90%;
            margin: 0 5%;
            font-size: 26upx;
            color: $font-color-light;
          }

          .gap-top, .gap-bottom {
            position: absolute;
            width: 20upx;
            height: 20upx;
            right: -10upx;
            border-radius: 100%;
            background-color: #f5f5f5;
          }

          .gap-top {
            top: -10upx;
          }

          .gap-bottom {
            bottom: -10upx;
          }

          .overdue {
            position: absolute;
            right: 10upx;
            top: 0;

            .iconyiguoqi2 {
              font-size: $font-lg + 40upx;
              color: $base-color;
            }

            .iconyishiyong {
              font-size: $font-lg + 40upx;
              color: $font-color-base;
            }
          }
        }

        .right {
          flex-shrink: 0;
          width: 28%;
          color: #fff;
          background: linear-gradient(to right, rgba(250, 67, 106, 0.72), rgba(250, 67, 106, 0.64));

          &.invalid {
            background: linear-gradient(to right, #aaa, #999);

            .use {
              color: #aaa;
            }
          }

          justify-content: center;

          .ticket, .criteria {
            width: 100%;
          }

          .ticket {
            padding-top: 1vw;
            justify-content: center;
            align-items: baseline;
            height: 6vw;

            .num {
              font-size: 42upx;
              font-weight: 600;
            }

            .unit {
              font-size: 24upx;
            }
          }

          .criteria {
            justify-content: center;

            font-size: 28upx;
          }

          .use {
            width: 45%;
            margin: 0 2.5%;
            height: 40upx;
            justify-content: center;
            align-items: center;
            font-size: 24upx;
            background-color: #fff;
            color: $base-color;
            border-radius: 40upx;
            padding: 0 4upx;
          }
        }
      }
    }
  }
</style>
