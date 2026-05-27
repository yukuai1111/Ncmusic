<template>
    <div class="login-overlay" @click="handleClose">
        <div class="login-modal">
            <div class="login-header">
                <h2>扫码登陆网易云音乐</h2>
                <p>使用网易云音乐 APP 扫码登陆，更安全更快捷</p>
            </div>
            <div class="login-body">
                <div class="qrcode-box">
                    <div class="qrcode-placeholder">
                        <template v-if="Qrimg">
                            <img :src="Qrimg" alt="二维码">
                        </template>
                        <template v-else>
                            <span>二维码加载中...</span>
                        </template>
                    </div>
                    <div class="qrcode-tip">打开网易云音乐 APP ，扫一扫登录</div>
                </div>
                <ul class="login-features ">
                    <li>同步收藏的歌单、歌曲和播放记录</li>
                    <li>多端同步，随时随地畅听音乐</li>
                    <li>更安全的扫码登录方式</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" name="login">
import { ref, onMounted, watch,onUnmounted } from 'vue'
import { getQrcodeKey, getQrcodeImg, getQrcodeStatus, getLoginStatus } from '@/api/api'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/users.ts'
import { useRouter } from 'vue-router'
const useUser = useUserStore()
const router = useRouter()


//二维码数据
const Qrimg = ref<string>('')   //图片
const Qrkey = ref<string>('')   //key


//获取key
const getQrCode = () => {
    getQrcodeKey().then(res => {
        const { data: { data } } = res
        // console.log(data.unikey)
        Qrkey.value = data.unikey || ''
    })
        .catch(err => {
            ElMessage.error((err.response?.data?.message||err.response?.data?.msg)||'获取二维码失败')
            console.log(err)
        })
}

//获取img
const getQrImg = (key: string) => {
    getQrcodeImg(key, Date.now(), true, 'pc').then(res => {
        const { data: { data } } = res
        //  console.log(data.qrimg)
        Qrimg.value = data.qrimg || ''
    })
        .catch(err => {
            ElMessage.error((err.response?.data?.message||err.response?.data?.msg)||'获取二维码失败')
            console.log(err)
        })
}



//对于检查二维码状态，用户登陆时间不知道，所以采用轮询
//定义一个定时器
let timer = ref<number|null>(null)   //用于防止重复轮询
const checkQrStatus = (key: string) => {
    if (!key) return
    //如果一开始有定时器，先关掉
    if (timer.value) {
        clearInterval(timer.value)
    }
    //没有就开一个定时器，用于调用接口
    timer.value = setInterval(() => {
        getQrcodeStatus(key, Date.now()).then( res => {
            // 800 为二维码过期,801 为等待扫码,802 为待确认,803 为授权登录成功
            // console.log(res.data.code)
            if (res.data.code === 803) {
                getLoginStatus().then(res => {
                    // console.log(res)
                    const { data: { data } } = res
                    // console.log(data.profile)
                    if (data.profile) {
                        ElMessage.success('登陆成功')
                        useUser.setUser({
                            id: data.profile.userId,
                            name: data.profile.nickname,
                            avatar: data.profile.avatarUrl,
                        })
                        //跳转
                        router.push('/')
                    }
                })
                    .catch(err => {
                        ElMessage.error((err.response?.data?.message||err.response?.data?.msg)||'登陆失败')
                        console.log('获取登录状态失败：' + err)
                    })
                clearInterval(timer?.value || 0)
                timer.value = null
            }
            if (res.data.code === 800) {
                //过期重新获取二维码，包括 key 和 img，然后继续检查
                clearInterval(timer?.value || 0)
                timer.value = null
                getQrCode()
                getQrImg(key)
                checkQrStatus(key)
            }
        }).catch(err => {
            ElMessage.error((err.response?.data?.message||err.response?.data?.msg)||'检查二维码状态失败')
            console.log('检查二维码状态失败：' + err)
        })
    }, 3000)
}

//监听key，变化了就调用img
watch(() => Qrkey.value, (newValue) => {
    if (newValue) {
        getQrImg(newValue)
    }
})

//监听img，有了就可以检查二维码状态
watch(() => Qrimg.value, (newValue) => {
    if (newValue && Qrkey.value) {
        checkQrStatus(Qrkey.value)
    }
})

//关闭弹窗
const handleClose=(e:any)=>{
    // console.log(e.currentTarget)
    // console.log('关闭弹窗')
    //跳转
    if(e.target===e.currentTarget){
        router.back()
    }
}

onMounted(() => {
    getQrCode()

})

//卸载时，清除轮询
onUnmounted(()=>{
    clearInterval(timer?.value || 0)
    timer.value = null
})
</script>

<style scoped>
.login-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
}
.login-modal {
    position: relative;
    width: 420px;
    padding: 24px 32px 32px;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;
}

.login-header h2 {
    margin: 0;
    font-size: 20px;
    color: #333;
}

.login-header p {
    margin: 8px 0 0;
    font-size: 13px;
    color: #666;
}

.login-body {
    margin-top: 20px;
    display: flex;
    gap: 20px;
}

.qrcode-box {
    text-align: center;
}

.qrcode-placeholder {
    width: 140px;
    height: 140px;
    border-radius: 4px;
    background: #f5f5f5;
    border: 1px solid #e1e1e1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 14px;
}

.qrcode-placeholder img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.qrcode-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #666;
}

.login-features {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 13px;
    color: #555;
}

.login-features li+li {
    margin-top: 8px;
}
</style>