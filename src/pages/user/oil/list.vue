<template>
	<view class="coupon-center">
	<view class="coupon-list">
	  <!-- 优惠券列表 -->
	  <view class="sub-list valid">
	    <view class="row" v-for="(item,index) in oilList" :key="index" >
	      <view class="carrier">
			  <view class="f-header">
			  	<!-- <i class="iconfont icontuijian"/> -->
			  	<view class="tit-box" @tap="navTo(`/pages/user/oil/detail?id=${item.gasId}`)">
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
				<view class="tit-right" @tap="showPopupService('attributeValueClass', item.gasAddressLongitude, item.gasAddressLatitude)">
					<view class="tit2 text-xs">{{ item.distance }} Km</view>
					<view class="content">
						<text class="tit2 text-xs"><i class="iconfont iconshouhuodizhi"></i>导航</text>
					</view>
				</view>
			  </view>
	      </view>
	    </view>
	  </view>
	  <rf-item-popup title="" @hide="hideService" :specClass="attributeValueClass" >
	  	<view slot="popup" class="service">
	  		<view class="content">
				<button class="cu-btn block line-red margin-sm lg" @tap="hideService(1)">高德地图</button>
				<button class="cu-btn block line-red margin-sm lg" @tap="hideService(2)">百度地图</button>
				<button class="cu-btn block line-black margin-sm lg" @tap="hideService()">取消</button>
	  		</view>
	  	</view>
	  </rf-item-popup>
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
	import rfItemPopup from '@/components/rf-item-popup';
    import moment from '@/common/moment';
    export default {
        components: {
			rfItemPopup,
            rfLoadMore
        },
        data() {
            return {
                oilList: [],
                mapList: ['百度地图','高德地图'],
				attributeValueClass: 'none',//scss类，控制开关动画
                type: null,
				latitude: '',
				longitude: '',
				gasAddressLongitude: '',
				gasAddressLatitude: '',
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
			// 弹窗
			showPopupService(type, gasAddressLongitude, gasAddressLatitude) {
				// console.log(list)
				this.gasAddressLongitude = gasAddressLongitude;
				this.gasAddressLatitude = gasAddressLatitude;
				this[type] = 'show';
			},
			//关闭服务弹窗
			hideService(index) {
				// console.log(this.gasAddressLongitude);
				this.attributeValueClass = 'none';
				if (this.gasAddressLongitude && this.gasAddressLatitude && index ) {
					this.goGd(index, this.gasAddressLongitude, this.gasAddressLatitude);
				} 
			},
			//高德导航
			goGd(index, longitude, latitude) {
				if (index === 1) {
					//高德
					var Name = '高德地图';
					var packageName = 'com.autonavi.minimap';
					var url = "androidamap://navi?sourceApplication=yiqi" + "&poiname=&lat=" + latitude + "&lon=" + longitude + "&dev=0"; 
				} else{
					//百度
					var Name = '百度地图';
					var packageName = 'com.baidu.BaiduMap';
					var url = "baidumap://map/geocoder?location=" + latitude + "," + longitude + "&coord_type=gcj02&src=andr.yiqi.openAPI";
					console.log(url);
				}
				var main = plus.android.runtimeMainActivity();    
				var packageManager = main.getPackageManager();    
				var PackageManager = plus.android.importClass(packageManager)    
				var packageInfo = packageManager.getPackageInfo(packageName,PackageManager.GET_ACTIVITIES);    
				if(packageInfo){
					console.log(Name);
					var Uri = plus.android.importClass("android.net.Uri");  
					// var url="androidamap://route?sourceApplication=yiqi" + "&poiname=&lat=" + latitude + "&lon=" + longitude + "&dev=0";    
					var Intent = plus.android.importClass('android.content.Intent');    
					var intent = new Intent();  
					intent.setAction(Intent.ACTION_VIEW);  
					intent.addCategory(Intent.CATEGORY_DEFAULT);  
					var uri = Uri.parse(url);  
					//将功能Scheme以URI的方式传入data  
					intent.setData(uri);  
					intent.setPackage(packageName);  
					var main = plus.android.runtimeMainActivity();    
					main.startActivity(intent);    
				}  
				else  
				{  
					this.$mHelper.toast('您没有安装' + Name);    
				}
			},
            //读取油站列表
			async getOilList(type) {
				if (this.longitude == '' || this.latitude == '') {
					this.getLocation();	//重新定位
				} else{
					await this.$http.get(`${oilList}`, {
					    page: this.page,
					    longitude: this.longitude,
					    latitude: this.latitude,
						// longitude: '114.371297',
						// latitude: '30.352309'
					}).then(r => {
					    this.loading = false;
					    if (type === 'refresh') {
					        uni.stopPullDownRefresh();
					    }
					    this.loadingType = r.data.length === 10 ? 'more' : 'nomore';
					    this.oilList = [...this.oilList, ...r.data];
						this.gasAddressLongitude = '';
						this.gasAddressLatitude = '';
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
						console.log('当前位置的经度：' + res.longitude);
						console.log('当前位置的纬度：' + res.latitude);
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
			//跳转详情
			navTo(route) {
				this.$mRouter.push({ route });
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
<style lang='scss' scoped>
	
</style>
