<template>
	<view class="coupon-detail oil-detail" :style="{backgroundColor: couponList.length === 0 ? '#fff' : '' }">
		<view class="bg-gradual-orange padding text-center shadow-blur oiltop">
		</view>
		<!-- 优惠券详情 -->
		<view class="sub-list valid" :style="{marginTop: state === 3 ? '-150upx' : '-150upx'}">
				<view class="row" v-for="(item,index) in couponList" :key="index" >
					<!-- content -->
					<view class="carrier">
						<view class="left">
						  <view class="f-header">
						  	<!-- <i class="iconfont icontuijian"/> -->
						  	<image class="portrait"
						  	       :src="item.gasLogoSmall || headImg">
						  	</image>
						  	<view class="tit-box">
						  		<text class="tit">{{item.gasName}}</text>
						  		<text class="tit2 text-xs">{{ item.gasAddress }}</text>
						  		<view class="price">
						  			{{ item.priceYfq }} 
						  			<span class="jiang"><i class="iconfont iconjiantour-copy"></i>已降{{ item.priceDiscount }}</span>
						  			<span class="guobiao">国标价：{{ item.priceOfficial }}</span>
						  		</view>
						  		<view class="tit2 text-xs">
						  			<span class="fuwu">服</span>
						  			请确认加油后再支付
						  		</view>
						  	</view>
						  	<view class="tit-right">
						  		<text class="tit2 text-xs"><i class="iconfont iconshouhuodizhi"></i></text>
						  		<text class="tit2 text-xs">{{ item.distance }}Km</text>
						  	</view>
						  </view>
						  <view class="attr-list">
						  	<text>选择油号：</text>
						  	<view class="item-list">
								<view class="tit"
									v-for="(childItem, childIndex) in item.oilPriceList"
									:key="childIndex"
									:class="{selected: type == childIndex}"
									@tap="switchType(childIndex)"
								>
						  			<text>
						  				{{childItem.oilName }}
						  			</text>
						  		</view>
						  	</view>
						  	
						  </view>
						  <view class="attr-list">
						  	<text>选择枪号：</text>
						  	<view class="item-list" v-for="(oilItem, oilindex) in gunNos" :key="oilindex">
								<!-- <view v-for="(oilItem, oilindex) in gunNos" :key="oilindex"> -->
									<view class="tit"
										v-for="(gunItem, gunindex) in oilItem"
										:key="gunindex"
										:class="{selected:  gunNo == gunItem.gunNo}"
										@tap="switchGunindex(gunItem.gunNo)"
										v-if="type === oilindex"
									>
										<text>
											{{gunItem.gunNo }}号
										</text>
									</view>
						  	</view>
						  	
						  </view>
						</view>
					</view>
				</view>
			</view>
			<view class="cu-bar tabbar bg-white shadow foot btn-group">
				<button class="cu-btn bg-red round block shadow-blur lg go" @tap="goToH5">下一步</button>
			</view>
			
		<uni-drawer class="rf-drawer" :visible="showRight" mode="right" @close="closeDrawer()">
				<view class="rf-drawer-title">可用商品列表</view>
				<view class="rf-drawer-list">
	        <view class="rf-drawer-item" @tap="navTo(`/pages/product/product?id=${item.id}`)" v-for="item in currentCoupon.usableProduct" :key="item.id">
		        <view class="left">
		          <view class="title">{{ item.name.split('】')[0].split('【').join('') }}</view>
		          <text class="desc in2line">{{item.name.split('】')[1]}}</text>
		        </view>
		        <text class="iconfont iconyou"></text>
	        </view>
	      </view>
				<view class="close">
					<button class="btn" plain="true" size="small" type="primary" @tap="hide">关闭</button>
				</view>
		</uni-drawer>

		<rf-empty :info="'暂无优惠券'" v-if="couponList.length === 0 && !loading"></rf-empty>
		<!--加载动画-->
		<rf-loading v-if="loading"></rf-loading>
	</view>
</template>

<script>
	/**
 * @des 优惠券详情
 *
 * @author stav stavyan@qq.com
 * @date 2019-12-09 10:13
 * @copyright 2019
 */
import { oilDetail, couponReceive} from "@/api/userInfo";
import moment from '@/common/moment';
import uniDrawer from '@/components/uni-drawer/uni-drawer';
export default {
	components: {
		uniDrawer,
	},
	data() {
		return {
			headerTop:0,
			//控制滑动效果
			typeClass:'valid',
			theIndex: null,
			oldIndex: null,
			state: 1,
			isStop:false,
			couponList: [],
			oilPriceList: [],
			gunNos: [],
			type: 92,
			gunNo: '',
			mobile: '',
			url: '',
			latitude: '',
			longitude: '',
			loadingType: 'more',
			token: null,
			page: 1,
			showRight: false,
			currentCoupon: {},
			loading: true
		}
	},
	filters: {
		time(val) {
			return moment(val * 1000).format('YYYY-MM-DD')
		},
		timeFull(val) {
			return moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')
		}
	},
	onLoad(options) {
		this.initData(options);
	},
	methods: {
		show(item) {
			if (item.usableProduct.length === 0) return;
			this.currentCoupon = item;
			this.showRight = true
		},
		hide() {
			this.showRight = false
		},
		closeDrawer() {
			this.showRight = false
		},
		// 初始化数据
		initData (options) {
			// console.log(options.id);
			this.getMyCouponDetail(options.id);
		},
		//切换油号
		switchType(type) {
			if (this.type === type) {
				return;
			}
			this.type = type;
			this.gunNo = '';
		},
		switchGunindex(gunNo) {
			if (this.gunNo === gunNo) {
				return;
			}
			this.gunNo = gunNo;
		},
		goToH5() {
			if (!this.gunNo) {
				this.$mHelper.toast('请选择枪号');
				return;
			}
			if (!this.mobile) {
				this.$mHelper.toast('请先登录');
				return;
			}
			let url = this.url + this.gunNo;
			// 链接拼接编码网址（同时用模板字符串放置所需要的数据）
			url = encodeURIComponent(url);
			uni.navigateTo({
				url: '/pages/public/pubview?url=' + url
			});
		},
		// 获取优惠券
		async getCoupon(item) {
			if (!this.$mStore.getters.hasLogin) {
				this.$mHelper.toast('请您先登录！');
				return;
			}
			if (parseInt(item.is_get, 10) === 0) {
				this.$mHelper.toast('该优惠券暂不可领取！');
				return;
			}
			await this.$http.post(`${couponReceive}`, {
				id: item.id
			}).then(() => {
        this.$mHelper.toast('领取成功');
				setTimeout(() => {
					this.couponList = [];
					this.getMyCouponDetail(item.id);
				}, 1.5 * 1000)
			})
		},
		// 统一跳转接口
		navTo(route){
			this.$mRouter.push({route});
		},
		// 初始化定位
		async getLocation(id) {
			const that = this;
			await uni.getLocation({
			    type: 'wgs84',
			    success: function (res) {
					that.latitude = res.latitude;
					that.longitude = res.longitude;
					// console.log('当前位置的经度：' + res.longitude);
					// console.log('当前位置的纬度：' + res.latitude);
					that.getMyCouponDetail(id);
			    },
				fail: (err) => {
				    console.log(err)
				    // this.$api.msg('获取定位失败');
				  }
			});
		},
		// 获取我的收货地址列表
		async getMyCouponDetail (id) {
			if (this.longitude == '' || this.latitude == '') {
				this.getLocation(id);	//重新定位
			} else{
				// console.log('发送：' + id);
				await this.$http.get(`${oilDetail}`, {
					id: id,
					longitude: this.longitude,
					latitude: this.latitude
				}).then(r=>{
				this.loading = false;
					this.couponList.push(r.data);
					this.oilPriceList = r.data.oilPriceList;
					this.gunNos = r.data.gunNos;
					this.mobile = r.data.mobile;
					this.url = r.data.url;
					this.type = '92';
					// console.log(r.data.mobile);
				}).catch(() => {
				this.loading = false;
				})
			}
			
		}
	}
}
</script>
<style lang="scss">
	.list{
		display: flex;
		width: 100%;
		position: relative;
	}
	.btn{
		height: 66upx;
		line-height: 66upx;
		border-radius: 100upx;
		background: $uni-color-primary;
		font-size: $font-base + 2upx;
		color: #fff;
		margin: 30upx 30upx 20upx;
	}
	.cu-bar{
		.go{
			max-width: 100%;
		}
	}
	.sub-list{
		width: 100%;
		padding-top: 10upx;
		.row{
			width: 92%;
			height: 120vw;
			margin: 10upx auto;
			border-radius: 8upx;
			align-items: center;
			position: relative;
			overflow: hidden;
			z-index: 4;
			border: 0;
			
			.carrier{
				background-color: #fff;
				position: absolute;
				width: 100%;
				padding: 0 0;
				height: 100%;
				z-index: 3;
				display: flex;
				.left{
					flex: 1;
					.attr-list{
						display: flex;
						flex-direction: column;
						font-size: $font-base + 2upx;
						color: $font-color-base;
						padding: 15upx 30upx;
					}
					.item-list{
						padding: 10upx 0 0;
						display: flex;
						flex-wrap: wrap;
						.tit{
							display: flex;
							align-items: center;
							justify-content: center;
							// background: #eee;
							border: 1px solid #eee;
							margin-right: 20upx;
							margin-bottom: 20upx;
							border-radius: 20upx;
							min-width: 60upx;
							height: 60upx;
							padding: 0 50upx;
							font-size: $font-base;
							color: $font-color-dark;
							.img {
								width: 36upx;
								height: 24upx;
								margin: 0 4upx;
							}
						}
						.selected{
							background: #fbebee;
							border: 1px solid $uni-color-primary;
							color: $uni-color-primary;
						}
					}
					.title{
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
					.term{
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
					position: relative;
					.gap-top,.gap-bottom{
						position: absolute;
						width: 20upx;
						height: 20upx;
						right: -10upx;
						border-radius: 100%;
						background-color: #f5f5f5;
					}
					.gap-top{
						top: -10upx;
					}
					.gap-bottom{
						bottom: -10upx;
					}
					.used {
						position: absolute;
						right: 10upx;
						bottom: 5upx;
						font-size: $font-sm;
						color: $base-color;
					}
					.shixiao{
						position: absolute;
						right: 0;
						top: -20upx;
						font-size: 150upx;
						z-index: 6;
						color: rgba(153,153,153,0.2)
					}
				}
				.right{
					width: 28%;
					color: #fff;
					text-align: center;
					background:linear-gradient(to right, rgba(250,67,106, 0.72), rgba(250,67,106, 0.64));
					.ticket,.criteria{width: 100%;}
					.ticket{
						padding-top: 20upx;
						.num{
							font-size: $font-lg + 12upx;
							font-weight: 600;
							line-height: 1.2;
						}
						.unit{
							font-size: 24upx;
						}
					}
					.criteria{
						font-size: $font-base;
					}
					.btn-group {
						display: flex;
						justify-content: space-between;
						align-items: center;
						.use{
							flex: 1;
							margin: 0 6upx;
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
	}
	.drawer {
		.close {
			.btn{
	      width: 320upx;
	      height: 76upx;
	      line-height: 76upx;
	      border-radius: 50px;
	      margin-top: 70upx;
	      background: $uni-color-primary;
	      color: #fff;
	      font-size: $font-lg;
	      border: none;
	      &:after{
	        border-radius: 100px;
	      }
	    }
		}
	}
</style>
