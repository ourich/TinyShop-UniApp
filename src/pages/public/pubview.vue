<template>
<web-view :src="url"></web-view>
</template>




<script>
	export default {
		data() {
			return {
				loadProgress: 0,
				url:''
			};
		},
		onLoad (options) {
			//动态获取的url
			this.url=decodeURIComponent(options.url)
		}
	}
</script>

<style lang='scss'>
	page{
		background: $page-color-base;
	}
</style>
