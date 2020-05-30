import axios from 'axios'

// 导入NProgress包对应的JS和CSS
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export function request(config) {
  const instance = axios.create({
    baseURL: 'https://www.liulongbin.top:8888/api/private/v1/',
    timeout: 5000
  })

  // 请求拦截
  instance.interceptors.request.use(config => {
    // 显示进度条
    NProgress.start();
    config.headers.Authorization = window.sessionStorage.getItem('token');
    return config;
  }, err => {
    console.log(err);
  })

  // 响应拦截
  instance.interceptors.response.use(res => {
    // 隐藏进度条
    NProgress.done();
    return res.data;
  }, err => {
    console.log(err);
  })

  return instance(config);
}
