<template>
    <div class="mymusic-page">
        <div class="mymusic-inner">
            <h2 class="title">我的音乐</h2>
            <!-- 未登录 -->
            <div v-if="!useUser.isLogin">
                <div class="login-hint">
                    <div class="hint-text">您还未登录，请先登录后查看个人歌单</div>
                    <button class="hint-btn" @click="handleLogin">去登陆</button>
                </div>
            </div>
            <!-- 已登录 -->
           <div v-else>
             <p class="subtitle" >我的歌单</p>
            <div class="tip" v-if="loading">歌单加载中...</div>
            <!-- 没有歌曲 -->
            <div class="tip" v-else-if="!myMusicList||myMusicList.length===0">暂无歌单，快去音乐馆收藏一些音乐吧</div>
            <!-- 有歌曲 -->
            <ul class="playlist-list" v-else>
                <li class="playlist-item" v-for="item in myMusicList" :key="item.id" @click="handleDetail(item.id)">
                    <div class="cover">
                        <img :src="item.cover" alt="歌单封面">
                    </div>
                    <div class="info">
                        <div class="name-container">
                            <el-icon color="#999" v-if="item.privacy">
                                    <Lock />
                                </el-icon>
                         <p class="name">{{ item.name }}</p>
                        </div>
                        
                        <p class="count">共{{ item.count }}首</p>
                    </div>

                </li>
            </ul>
           </div>
        </div>

    </div>
</template>

<script setup lang="ts" name="myMusic">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/users';
import { useRouter } from 'vue-router'
import { getMyMusic } from '@/api/api'
const useUser = useUserStore()
const router = useRouter()

const loading=ref(false)
//去登录
const handleLogin = () => {
    router.push('/login')
}

//定义歌单数据
const myMusicList = ref<{ id: number, name: string, cover: string, count: number,privacy:boolean }[]>([])
//获取歌单
const getMYMusicList = (id: number) => {
    if (!id) return
    loading.value=true
    getMyMusic(id).then(res => {
        const { data: { playlist } } = res
        console.log(playlist)
        myMusicList.value = playlist.map((item: any) => {
            return {
                id: item.id,
                name: item.name,
                cover: item.coverImgUrl,
                count: item.trackCount,
                privacy:item.privacy===0?false:true

            }
        }) || []
        // console.log(myMusicList.value)
        loading.value=false
    })
        .catch(err => {
            console.log('获取歌单失败' + err)
            loading.value=false
        })

}

//跳转歌单详情页
const handleDetail = (id: number) => {
    console.log("跳转歌单详情页", id)
    router.push({
        path:'/myMusicList',
        query:{
            id
        }
    })
}
onMounted(() => {
    if (useUser.isLogin) {
        // console.log(myMusicList.value)
        // console.log(useUser.user.id)
        getMYMusicList(useUser.user.id)
    }
})
</script>

<style scoped>
.mymusic-page {
    min-height: calc(100vh - 90px);
    padding: 24px 32px;
    box-sizing: border-box;
}

.mymusic-inner {
    max-width: 1200px;
    margin: 0 auto;
}

.title {
    margin: 0 0 16px;
    font-size: 20px;
    font-weight: 600;
}

/* 没登陆 */
.login-hint {
    margin-top: 24px;
    padding: 24px 28px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.hint-text {
    margin: 0 0 12px;
    font-size: 14px;
    color: #555;
}

.hint-btn {
    padding: 6px 16px;
    border-radius: 16px;
    border: none;
    background: #c20c0c;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
}

.hint-btn:hover {
    background: #a00a0a;
}

/* 已登录 */
.subtitle {
    margin: 0 0 12px;
    font-size: 16px;
    color: #333;
}

.tip {
    margin-top: 16px;
    font-size: 14px;
    color: #777;
}

.playlist-list {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    list-style: none;
    margin: 12px 0 0;
    padding: 0;
}

.playlist-item {
    cursor: pointer;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.cover {
    width: 100%;
    aspect-ratio: 1/1;
    overflow: hidden;
}

.cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease-in-out;
}
.cover:hover img {
    transform: scale(1.1);
}
.info {
    padding: 8px 10px 10px;
}
.name-container{
    display: flex;
    gap:8px;
    align-items: center;
}
.name {
    margin: 0 0 4px;
    font-size: 14px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.count {
    margin: 0;
    font-size: 12px;
    color: #999;
}
</style>