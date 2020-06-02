const CONFIG = {
    //开发环境配置
    development: {
        assetsPath: '/static', // 静态资源路径
		baseUrl: 'http://ra.com/api',  // 后台接口请求地址
        // baseUrl: 'http://192.168.1.7/api',  // 后台接口请求地址
		baseUrl: 'https://open.jiangsuwxw.com/api',  // 后台接口请求地址
        hostUrl: 'http://localhost:8080',        // H5地址(前端运行地址)
		// hostUrl: 'https://h5.jiangsuwxw.com/',        // H5地址(前端运行地址)
        websocketUrl: '',        // websocket服务端地址
        weixinAppId: '' // 微信公众号appid
    },
    //生产环境配置
    production: {
        assetsPath: '/static', // 静态资源路径
        baseUrl: 'https://open.jiangsuwxw.com/api',  // 后台接口请求地址
        hostUrl: 'https://h5.jiangsuwxw.com/',        // H5地址(前端运行地址)
        websocketUrl: '',        // websocket服务端地址
        weixinAppId: '' // 微信公众号appid
    }

};
export default CONFIG[process.env.NODE_ENV];
