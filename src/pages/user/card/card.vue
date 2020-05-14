<template>
  <view class="address-list">
    <view class="rf-list" v-if="cardList.length > 0">
	<text v-if="cardList.length > 0" class="tips">
	  卡片总数：{{cardList.length}}
	</text>
      <view class="rf-list-item" v-for="(item, index) in cardList" :key="index" >
        <view class="mid">
          <view class="address-box">
            <text v-if="parseInt(item.status, 10) === 0" class="tag">已使用</text>
            <text class="address in1line">{{item.cardNo}}</text>
          </view>
        </view>
        <view class="right">
          <text class="iconfont iconbianji" @tap="showPopupService('attributeValueClass', item.cardNo, item.code)"></text>
        </view>
      </view>
	  
      
      <rf-load-more v-if="cardList.length > 0" :status="loadingType"/>
    </view>
	
    <view class="add-btn-wrapper">
      <button class="add-btn" @tap="addAddress('add')">卡片转出</button>
    </view>
	<rf-item-popup @hide="hideService" :specClass="attributeValueClass" >
		<view slot="popup" class="service">
			<view class="content detail-desc">
				<view class="d-header">
					<text class="tips">{{cardNo}}</text>
				</view>
				
				<image class="swiper-slide-image" :src="newsBg"></image>
			</view>
		</view>
	</rf-item-popup>
    <rf-empty :info="`暂无数据`" v-if="cardList.length === 0 && !loading"></rf-empty>
    <!--加载动画-->
    <rf-loading v-if="loading"></rf-loading>
  </view>
</template>

<script>
	/**
	 * @des 收货地址列表
	 *
	 * @author stav stavyan@qq.com
	 * @date 2020-03-10 18:00
	 * @copyright 2019
	 */
	import {addressDelete, cardList} from "@/api/userInfo";
	import rfItemPopup from '@/components/rf-item-popup';

	import rfLoadMore from '@/components/rf-load-more/rf-load-more';

	export default {
		components: {
			rfItemPopup,
			rfLoadMore
		},
		data() {
			return {
				timeOutEvent: 0,
				source: 0,
				page: 1,
				cardList: [],
				attributeValueClass: 'none',//scss类，控制开关动画
				type: null,
				loadingType: 'more',
				loading: true
			}
		},
		//下拉刷新
		onPullDownRefresh() {
			this.page = 1;
			this.cardList = [];
			this.getcardList('refresh');
		},
		//加载更多
		onReachBottom() {
			this.page++;
			this.getcardList();
		},
		onLoad(option) {
			this.source = option.source;
		},
		onShow() {
			this.initData()
		},
		methods: {
			goTouchStart(id) {
				clearTimeout(this.timeOutEvent);//清除定时器
				this.timeOutEvent = 0;
				this.timeOutEvent = setTimeout(() => {
					uni.showModal({
						content: '确定要删除该收货地址吗',
						success: (e) => {
							if (e.confirm) {
								this.handleAddressDelete(id);
							}
						}
					});
				}, 0.5 * 1000);//这里设置定时
			},
      // 删除地址
      async handleAddressDelete(id) {
				await this.$http.delete(`${addressDelete}?id=${id}`).then(() => {
          this.page = 1;
          this.cardList.length = 0;
          this.getcardList();
        })
      },
			//手释放，如果在500毫秒内就释放，则取消长按事件，此时可以执行onclick应该执行的事件
			goTouchEnd() {
				clearTimeout(this.timeOutEvent);
			},
			//如果手指有移动，则取消所有事件，此时说明用户只是要移动而不是长按
			goTouchMove() {
				clearTimeout(this.timeOutEvent);//清除定时器
				this.timeOutEvent = 0;
			},
			// 弹窗
			showPopupService(type, cardNo, code) {
				this.cardNo = cardNo;
				this.code = code;
				this[type] = 'show';
			},
			//关闭服务弹窗
			hideService() {
				this.attributeValueClass = 'none';
			},
			// 数据初始化
			initData() {
				this.page = 1;
				this.cardList.length = 0;
				this.getcardList();
			},
			// 获取收货地址列表
			async getcardList(type) {
				await this.$http.get(`${cardList}`, {
					page: this.page
				}).then(r => {
					this.loading = false;
					if (type === 'refresh') {
						uni.stopPullDownRefresh();
					}
					this.loadingType = r.data.length === 10 ? 'more' : 'nomore';
					this.cardList = [...this.cardList, ...r.data];
				}).catch(() => {
					this.loading = false;
					if (type === 'refresh') {
						uni.stopPullDownRefresh();
					}
				});
			},
			// 选择地址
			checkAddress(item) {
				if (parseInt(this.source, 10) === 1) {
					//this.$mHelper.prePage()获取上一页实例，在App.vue定义
					this.$mHelper.prePage().addressData = item;
				  this.$mRouter.back();
				}
			},
			// 跳转添加地址页面
			addAddress(type, id) {
				this.$mRouter.push({route: `/pages/user/card/manage?type=${type}&id=${id}`});
			}
		}
	}
</script>

<style lang='scss'>
	page{
    background-color: $page-color-base;
	}
	.detail-desc{
		background: #fff;
		margin-top: 16upx;
		padding: 0 10upx;
		.d-header{
			display: flex;
			justify-content: center;
			align-items: center;
			height: 80upx;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			position: relative;
			text{
				padding: 0 20upx;
				background: #fff;
				position: relative;
				z-index: 1;
			}
			&:after{
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translateX(-50%);
				width: 300upx;
				height: 0;
				content: '';
				border-bottom: 1px solid #ccc;
			}
		}
	}
	.address-list {
		position: relative;
    .address-box {
      display: flex;
      align-items: center;

      .tag {
        font-size: 20upx;
        color: $base-color;
        background: #fffafb;
        border: 1px solid #ffb4c7;
        border-radius: 4upx;
        padding: 4upx 6upx;
        line-height: 1;
      }

      .address {
        font-size: 30upx;
        color: $font-color-dark;
      }
    }

    .u-box {
      font-size: 28upx;
      color: $font-color-light;
      margin-top: 16upx;

      .name {
        margin-right: 30upx;
      }
    }
  }
</style>
