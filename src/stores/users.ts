import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface userInterface{
    id:number,
    name:string,
    avatar:string
}

export const useUserStore = defineStore('user', () => {
    //定义一个用户信息
    const user = ref<userInterface|null>(null)
    //判断登陆状态
    const isLogin = computed(() => {
        return !!user.value   //要return的是布尔值，直接写user.value返回的是对象
    })

    // 设置加入用户状态的方法
    const setUser = (info: userInterface) => {
        if (!info) return
        const userInfo = {
            id: info.id,
            name: info.name,
            avatar: info.avatar,
        }
        user.value = userInfo 
        //本地存储
        localStorage.setItem('user', JSON.stringify(userInfo))
    }

    //设置清除用户信息的方法
    const clearUser = () => {
        user.value = null
        //清除本地存储
        localStorage.removeItem('user')
        //清除cookie
        localStorage.removeItem('cookie')
    }

    //初始化用户信息
    const initUser = () => {
        const data = localStorage.getItem('user')
        if (data) {
            user.value = JSON.parse(data)
        }
    }
    initUser()  //一进来就直接调用,让isLogin可以实现响应式
    return {
        user,
        isLogin,
        setUser,
        clearUser,
        // initUser
    }
})