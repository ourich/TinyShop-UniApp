<template>
	<view class="coupon-center">
	<view class="coupon-list">
	  <!-- 优惠券列表 -->
	  <view class="sub-list valid">
	    <view class="row" v-for="(item,index) in oilList" :key="index" @tap.stop="getCoupon(item)">
	      <view class="carrier">
			  <view class="f-header">
			  	<!-- <i class="iconfont icontuijian"/> -->
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
	        
	        
	      </view>
	    </view>
	  </view>
	  <rf-load-more :status="loadingType" v-if="oilList.length > 0"></rf-load-more>
	</view>
		<rf-empty :info="errorInfo || '暂无数据'" v-if="oilList.length === 0 && !loading"></rf-empty>
		<!--页面加载动画-->
		<rf-loading v-if="loading"></rf-loading>
	</view>
</template>

<script>
    /**
     * @des 领取中心
     *
     * @author stav stavyan@qq.com
     * @date 2020-01-13 11:28
     * @copyright 2019
     */
    import {oilList, couponReceive} from "@/api/userInfo";
    import rfLoadMore from '@/components/rf-load-more/rf-load-more';
    import moment from '@/common/moment';
    export default {
        components: {
            rfLoadMore
        },
        data() {
            return {
                oilList: [],
                type: null,
				latitude: '',
				longitude: '',
                loadingType: 'more',
                page: 1,
                loading: true,
                errorInfo: ''
            }
        },
        filters: {
            time(val) {
              return moment(val * 1000).format('YYYY-MM-DD HH:mm')
            }
        },
        onLoad(options) {
            this.type = options.type;
            this.initData();
        },
        //下拉刷新
        onPullDownRefresh() {
            this.page = 1;
            this.oilList.length = 0;
            this.getOilList('refresh');
        },
        //加载更多
        onReachBottom() {
            this.page++;
            this.getOilList();
        },
        methods: {
            // 数据初始化
            initData() {
                this.getLocation();
            },
            //读取油站列表
			async getOilList(type) {
				if (this.longitude == '' || this.latitude == '') {
					this.getLocation();	//重新定位
				} else{
					await this.$http.get(`${oilList}`, {
					    page: this.page,
					    longitude: this.longitude,
					    latitude: this.latitude
					}).then(r => {
					    this.loading = false;
					    if (type === 'refresh') {
					        uni.stopPullDownRefresh();
					    }
					    this.loadingType = r.data.length === 10 ? 'more' : 'nomore';
					    this.oilList = [...this.oilList, ...r.data];
					}).catch(err => {
					    this.oilList.length = 0;
					    this.errorInfo = err;
					    this.loading = false;
					    if (type === 'refresh') {
					        uni.stopPullDownRefresh();
					    }
					})
				}
			},
			// 初始化定位
			async getLocation() {
				const that = this;
				await uni.getLocation({
				    type: 'wgs84',
				    success: function (res) {
						that.latitude = res.latitude;
						that.longitude = res.longitude;
						// console.log('当前位置的经度：' + res.longitude);
						// console.log('当前位置的纬度：' + res.latitude);
						that.getOilList();
				    },
					fail: (err) => {
					    console.log(err)
					    // this.$api.msg('获取定位失败');
					  }
				});
			},
            // 获取优惠券
            async getCoupon(item) {
                if (this.type) return;
                // 优惠券是否可领取 is_get 0 不可领取
                if (parseInt(item.is_get, 10) === 0) {
                    this.$mHelper.toast('该优惠券不可领取');
                    return;
                }
                await this.$http.post(`${couponReceive}`, {
                    id: item.id
                }).then(() => {
                    this.$mHelper.toast('领取成功');
                    this.loading = true;
                    this.page = 1;
                    this.oilList.length = 0;
                    this.getOilList();
                })
            },
			checkOpenGPSService() {
			    if (uni.getSystemInfoSync().platform == 'android') {
			        // 判断平台
			        var context = plus.android.importClass("android.content.Context");
			        var locationManager = plus.android.importClass("android.location.LocationManager");
			        var main = plus.android.runtimeMainActivity();
			        var mainSvr = main.getSystemService(context.LOCATION_SERVICE);
			        if (!mainSvr.isProviderEnabled(locationManager.GPS_PROVIDER)) {
			            uni.showModal({
			                title: '提示',
			                content: '请打开定位服务功能',
			                showCancel: false, // 不显示取消按钮
			                success() {
			                    if (!mainSvr.isProviderEnabled(locationManager.GPS_PROVIDER)) {
			                        var Intent = plus.android.importClass('android.content.Intent');
			                        var Settings = plus.android.importClass('android.provider.Settings');
			                        var intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
			                        main.startActivity(intent); // 打开系统设置GPS服务页面
			                    } else {
			                        console.log('GPS功能已开启');
			                    }
			                }
			            });
			        }
			    } else {
			        var cllocationManger = plus.ios.import("CLLocationManager");
			        var enable = cllocationManger.locationServicesEnabled();
			        var status = cllocationManger.authorizationStatus();
			        plus.ios.deleteObject(cllocationManger);
			        console.log("enable:" + enable);
			        console.log("status:" + status);
			        if (enable && status != 2) {
			            console.log("手机系统的定位已经打开");
			        } else {
			            console.log("手机系统的定位没有打开");
			            uni.showModal({
			                title: '提示',
			                content: '请打开定位服务功能',
			                showCancel: false, // 不显示取消按钮
			                success() {
			                    var UIApplication = plus.ios.import("UIApplication");
			                    var application2 = UIApplication.sharedApplication();
			                    var NSURL2 = plus.ios.import("NSURL");
			                    // var setting2 = NSURL2.URLWithString("prefs:root=LOCATION_SERVICES");
			                    // var setting2 = NSURL2.URLWithString("App-Prefs:root=LOCATION_SERVICES");
			                    // var setting2 = NSURL2.URLWithString("app-settings");
			                    var setting2 = NSURL2.URLWithString("App-Prefs:root=Privacy&path=LOCATION");
			                    // var setting2 = NSURL2.URLWithString("App-Prefs:root=Privacy&path=LOCATION_SERVICES");
			                    application2.openURL(setting2);
			                    plus.ios.deleteObject(setting2);
			                    plus.ios.deleteObject(NSURL2);
			                    plus.ios.deleteObject(application2);
			                }
			            });
			        }
			    }
			}

        }
    }
</script>
<style lang='scss'>
</style>
