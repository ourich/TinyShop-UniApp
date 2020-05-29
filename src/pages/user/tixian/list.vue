<template>
	<view class="feedback-list">
		<view class="rf-list" v-if="feedbackList">
			<view class="rf-list-item" v-for="(item, index) in feedbackList" :key="index" >
				<view class="wrapper">
					<view class="address-box">
						<text class="address in1line">收款人：{{item.name}}</text>
					</view>
					<view class="u-box">
						<text class="mobile">收款平台：{{item.type | feedbackFilter}}</text>
						<text class="mobile">联系电话：{{item.mobile || '暂无'}}</text>
						<text class="mobile">申请时间：{{item.created_at | time}}</text>
						<text class="name">备注：{{item.remark || '无'}}</text>
					</view>
				</view>
				<view class="right">
					<text class="address in1line">{{item.money}}</text>
					<text class="cu-tag line-gray" v-if="item.status === 0">待审核</text>
					<text class="cu-tag bg-green" v-if="item.status === 1">已打款</text>
					<text class="cu-tag bg-red" v-if="item.status === 2">已驳回</text>
				</view>
			</view>
			<rf-load-more v-if="feedbackList.length > 0 && !loading" :status="loadingType"/>
		</view>
    <view class="add-btn-wrapper">
			<button class="add-btn" @tap="navTo(`/pages/user/tixian/tixian`)">创建申请</button>
    </view>
		<rf-empty :info="'您还没有提现申请'" v-if="feedbackList.length === 0 && !loading"></rf-empty>
		<rf-loading v-if="loading"></rf-loading>
	</view>
</template>

<script>
    import {tixianList} from "@/api/userInfo";

    import rfLoadMore from '@/components/rf-load-more/rf-load-more';
	import moment from '@/common/moment';

    export default {
        components: {
            rfLoadMore
        },
        data() {
            return {
                page: 1,
                feedbackList: [],
                loadingType: 'more',
                loading: true
            }
        },
        filters: {
            feedbackFilter(type) {
                const feedbackType = ['', '微信', '支付宝', '银行卡']
                return feedbackType[parseInt(type, 10)]
            },
			// 时间格式化
			time(val) {
				return moment(val * 1000).format('YYYY-MM-DD HH:mm')
			}
        },
        //下拉刷新
        onPullDownRefresh() {
            this.page = 1;
            this.feedbackList.length = 0;
            this.getFeedbackList('refresh');
        },
        //加载更多
        onReachBottom() {
            this.page++;
            this.getFeedbackList();
        },
        onShow () {
            this.initData()
        },
        methods: {
            // 数据初始化
            initData() {
                this.page = 1;
                this.feedbackList.length = 0;
                this.getFeedbackList();
            },
            // 获取意见反馈列表
            async getFeedbackList(type) {
                await this.$http.get(`${tixianList}`, {page: this.page}).then(r => {
                    this.loading = false;
                    if (type === 'refresh') {
                        uni.stopPullDownRefresh();
                    }
                    this.loadingType = r.data.length === 10 ? 'more' : 'nomore';
                    this.feedbackList = [...this.feedbackList, ...r.data];
                }).catch(() => {
                    this.loading = false;
                    if (type === 'refresh') {
                        uni.stopPullDownRefresh();
                    }
                })
            },
            navTo(route) {
                this.$mRouter.push({route});
            }
        }
    }
</script>

<style lang='scss'>

	page {
		background-color: $page-color-base;
	}

	.feedback-list {
		position: relative;

		.wrapper {
			display: flex;
			flex-direction: column;
			flex: 1;
		}

		.address-box {
			display: flex;
			align-items: center;

			.tag {
				font-size: 24upx;
				color: $base-color;
				margin-right: 10upx;
				background: #fffafb;
				border: 1px solid #ffb4c7;
				border-radius: 4upx;
				padding: 4upx 10upx;
				line-height: 1;
			}
			.tag.not {
				font-size: 24upx;
				color: $base-color;
				margin-right: 10upx;
				background: #fffafb;
				border: 1px solid #fffafb;
				border-radius: 4upx;
				padding: 4upx 10upx;
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
			display: flex;
			flex-direction: column;

			.name {
				margin-right: 30upx;
			}
		}
	}

</style>
