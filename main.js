import Vue from 'vue'
import App from './App'

import bmob from '@/utils/bmob.js' // 接口数据
Vue.prototype.Bmob = bmob

Vue.config.productionTip = false

App.mpType = 'app'

// app.js
var Bmob = require('./utils/bmob.js')
// 初始化 Bmob.initialize('你的Application ID', '你的REST API Key');
// Bmob.initialize("11b490997d4e4d1d227a163820dfd9f2", "063abec0a1a26012e881b5f851d28937");

// Bmob.initialize("你的Secret Key", "你的API 安全码");
Bmob.initialize("dbf17fd96b967950", "930426");
// var coolsite360 = require('./coolsite/index.js');
				
const app = new Vue({
    ...App
})
app.$mount()
