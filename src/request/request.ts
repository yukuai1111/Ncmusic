import axios from "axios";

const BASE_Url = "http://localhost:3000";
//创建axios实例
const server = axios.create({
    baseURL: BASE_Url,
    timeout: 5000,
    //跨域处理，出现跨域的时候是否运行携带凭证
    withCredentials: true,
})

//请求拦截器
server.interceptors.request.use(
    (config) => {
        return config
    },
    (err) => {
        return Promise.reject(err)
    }
)

//响应拦截器
server.interceptors.response.use(
    (res) => {
        return res
    },
    (err) => {
        return Promise.reject(err)
    }
)

export default server
