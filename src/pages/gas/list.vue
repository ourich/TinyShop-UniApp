<template>
	<view class="coupon-center">
    <view class="coupon-list">
      <!-- 优惠券列表 -->
      <view class="sub-list valid">
        <view class="row" v-for="(item,index) in stationList" :key="index" >
          <view class="carrier">
            <view class="f-header">
            	<!-- <i class="iconfont icontuijian"/> -->
            	<view class="tit-box" @tap="navTo(`/pages/gas/detail?id=${item.gasId}`)">
            		<text class="tit">{{item.gasName}}</text>
            		<view class="tit2 text-xs">
						<tui-icon :name="'gps'" :size="12" :color="'#999'"></tui-icon>
						{{ item.gasAddress }}
					</view>
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
				<view class="tit-right" @tap="openMap(item.gasName, item.gasAddressLongitude, item.gasAddressLatitude)">
					<view class="tit2 text-xs">{{ item.juli }} Km</view>
					<text class="tit2 text-xs"><i class="iconfont iconzuoshang"></i>导航</text>
					<view class="content">
						
					</view>
				</view>
            </view>
          </view>
        </view>
      </view>
      <rf-load-more :status="loadingType" v-if="stationList.length > 0"></rf-load-more>
    </view>
		<rf-empty :info="errorInfo || '暂无数据'" v-if="stationList.length === 0 && !loading"></rf-empty>
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
    import {stationList, couponReceive} from "@/api/userInfo";
    import rfLoadMore from '@/components/rf-load-more/rf-load-more';
    import moment from '@/common/moment';
	import Map from '@/utils/openMap.js';
    export default {
        components: {
            rfLoadMore
        },
        data() {
            return {
                stationList: [],
				latitude: '',
				longitude: '',
				gasAddressLongitude: '',
				gasAddressLatitude: '',
                type: null,
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
			// this.$mHelper.checkOpenGPSService();
            this.initData();
        },
        //下拉刷新
        onPullDownRefresh() {
            this.page = 1;
            this.stationList.length = 0;
            this.getstationList('refresh');
        },
        //加载更多
        onReachBottom() {
            this.page++;
            this.getstationList();
        },
        methods: {
            // 数据初始化
            initData() {
                this.getstationList();
            },
			openMap(name, gasAddressLongitude, gasAddressLatitude) {
				Map.openMap(gasAddressLatitude, gasAddressLongitude, name, 'gcj02')
			},
			//跳转详情
			navTo(route) {
				this.$mRouter.push({ route });
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
						that.getstationList();
				    },
					fail: (err) => {
					    console.log(err)
					    // this.$api.msg('获取定位失败');
					  }
				});
			},
            //获取收货地址列表
            async getstationList(type) {
				if (this.longitude == '' || this.latitude == '') {
					this.getLocation();	//重新定位
				} else{
					await this.$http.get(`${stationList}`, {
					    page: this.page,
						longitude: this.longitude,
						latitude: this.latitude,
						longitude: '114.371297',
						latitude: '30.352309'
					}).then(r => {
					    this.loading = false;
					    if (type === 'refresh') {
					        uni.stopPullDownRefresh();
					    }
					    this.loadingType = r.data.length === 10 ? 'more' : 'nomore';
					    this.stationList = [...this.stationList, ...r.data];
					}).catch(err => {
					    this.stationList.length = 0;
					    this.errorInfo = err;
					    this.loading = false;
					    if (type === 'refresh') {
					        uni.stopPullDownRefresh();
					    }
					})
				}
                
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
                    this.stationList.length = 0;
                    this.getstationList();
                })
            }
        }
    }
</script>
<style lang='scss'>
	
</style>
