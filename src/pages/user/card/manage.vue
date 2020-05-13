<template>
	<view class="address-manage rf-row-wrapper">
		
		<view class="row b-b">
			<text class="tit">接收人</text>
			<input class="input" type="number" v-model="cardData.mobile" @blur="handleMobileChange" placeholder="接收人手机号码" placeholder-class="placeholder" />
		</view>
		<view class="row b-b">
			<text class="tit">转出数量</text>
			<input class="input" type="number" v-model="cardData.realname" @blur="handleRealNameChange" placeholder="填写转出数量" placeholder-class="placeholder" />
		</view>
		<view class="row b-b">
			<text class="tit">起始卡号</text>
			<input class="input" type="number" v-model="cardData.cardNo" @blur="handlecardNoChange"  placeholder="填写起始卡号" placeholder-class="placeholder" />
		</view>
		<view class="row b-b">
			<text class="tit">截止卡号</text>{{endNo}}
		</view>
		<button class="add-btn" :disabled="btnLoading" :loading="btnLoading"  @tap="confirm">提交</button>

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
	import {cardChange, cardBegin} from '@/api/userInfo';
	export default {
        components: {
            
        },
		data() {
			return {
				cardData: {
					realname: '',
					mobile: '',
					cardNo: '',
					endNo: ''
				},
				endNo: '',
				btnLoading: false,
				loading: true
			}
		},
		onLoad(options){
			this.initData(options);
		},
		methods: {
	    // 数据初始化
			async initData(options) {
				let title = '转出卡片';
				await this.getCardBegin();
				setTimeout(() => {this.loading = false;}, 1 * 1000);
				uni.setNavigationBarTitle({
					title
				});
			},
	    // 获取收货地址
			async getCardBegin() {
				await this.$http.get(`${cardBegin}`, {
				}).then(async r => {
					this.cardData = r.data;
					this.cardData.realname = 100;
					this.endNoChange();
			    setTimeout(() => {this.loading = false;}, 1 * 1000);
				}).catch(() => {
			    this.loading = false;
				})
			},
			handleRealNameChange (e) {
				this.cardData.realname = e.detail.value;
				this.endNoChange();
			},
			handlecardNoChange (e) {
				this.cardData.cardNo = e.detail.value;
				this.endNoChange();
			},
			handleMobileChange (e) {
				this.cardData.mobile = e.detail.value;
			},
			endNoChange () {
				this.endNo = parseInt(this.cardData.realname, 10) +  parseInt(this.cardData.cardNo, 10);
				console.log(this.endNo);
			},
			//提交
			confirm(){
				let data = this.cardData;
				data.endNo = this.endNo;
				if(!data.realname){
					this.$mHelper.toast('请填写转出数量');
					return;
				}
				if(!/(^1[3|4|5|7|8][0-9]{9}$)/.test(data.mobile)){
					this.$mHelper.toast('请输入正确的手机号码');
					return;
				}
				this.btnLoading = true;
				this.handleCardChange(data)
			},
			async handleCardChange (data) {
				await this.$http.post(`${cardChange}`, {
					realname: data.realname,
					mobile: data.mobile,
					cardNo: data.cardNo,
					endNo: data.endNo
				}).then(() =>{
            this.btnLoading = false;
						this.$mHelper.toast('转出成功！');
						this.$mRouter.back();
				}).catch(() => {
					this.btnLoading = false;
				});
			}
		}
	}
</script>

<style lang="scss">
	page {
		background: $page-color-base;
	}
	.address-manage {
		padding-top: 16upx;
	}
</style>
