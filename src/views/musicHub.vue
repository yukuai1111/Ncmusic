<template>
    <div class="hall-wrapper">
        <div class="hall-inner">
            <!-- 推荐歌单 -->
            <h2 class="section-title">推荐歌单</h2>
            <div class="tip" v-if="recommendLoading">推荐歌单加载中...</div>
            <ul class="playlist-list" v-else="!recommendLoading">
                <li class="playlist-item" v-for="item in recommendList" :key="item.id" @click="handleList(item.id)">
                    <div class="cover-wrapper">
                        <img :src="item.cover" alt=""></img>
                    </div>
                    <div class="info">
                        <div class="title">{{ item.name }}</div>
                        <div class="desc">{{ item.desc }}</div>
                    </div>
                </li>
            </ul>
            <!-- 推荐新音乐 -->
            <h2 class="section-title section-title--sub">推荐新音乐</h2>
             <div class="tip" v-if="newSongLoading">推荐新音乐加载中...</div>
            <ul class="song-list" v-else="!newSongLoading">
                <li class="song-item" v-for="item in newSongList" :key="item.id" @click="handlePlay(item.id)" >
                    <div class="song-cover">
                        <img :src="item.cover" :alt="item.name" :title="item.name">
                    </div>
                    <div class="song-info">
                        <p class="song-name">{{ item.name }}</p>
                        <p class="song-artist">{{ item.author }}</p>
                    </div>
                </li>
            </ul>
            <!-- 歌手榜单 -->
            <h2 class="section-title section-title--sub section-title--singer">歌手榜单</h2>
             <div class="tip" v-if="singerLoading">歌手榜单加载中...</div>
            <ul class="singer-list" v-else="!singerLoading">
                <li class="singer-item" v-for="item in singerList" :key="item.id" @click="handleSinger(item.id)">
                    <div class="singer-avatar">
                        <img :src="item.avatar" :alt="item.name" :title="item.name">
                    </div>
                    <div class="singer-name">{{ item.name }}</div>
                </li>
            </ul>
            <el-pagination layout="prev, pager, next" :total="60" 
                @change="handleChange" v-model:current-page="currentPage" class="pagination-btn" />
        </div>
    </div>
</template>

<script setup lang="ts" name="musicHub">
import { getRecommend, getNewSongs, getSingers } from '@/api/api.ts'
import { onMounted, ref } from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
const router = useRouter()
//定义推荐列表数据
let recommendList = ref<{
    id: number,
    name: string,
    cover: string,
    desc: string
}[]>([])   //ref<内部数据的类型>[]（初始值）   //数组里面是对象（初始值是空数组）
//定义推荐列表加载中
let recommendLoading=ref(false)
//获取推荐歌单
const getRecommendList = () => {
    recommendLoading.value =true
    getRecommend(5).then(res => {
        const { result } = res.data
        // console.log(result)
        recommendList.value = result.map((item: any) => {
            return {
                id: item.id,
                name: item.name,
                cover: item.picUrl,
                desc: item.copywriter || ''
            }

        }) || []
        // console.log(recommendList.value)
        recommendLoading.value =false
    })
        .catch(err => {
            ElMessage.error('获取推荐列表失败')
            console.log('获取推荐列表失败：' + err)
            recommendLoading.value =false
        })
}


//定义新音乐数据
let newSongList = ref<{
    id: number,
    name: string,
    cover: string,
    author: string
}[]>([])
//定义新音乐加载中
let newSongLoading=ref(false)
//获取新音乐
const getNewSongList = () => {
    newSongLoading.value =true
    getNewSongs(10).then(res => {
        // console.log(res.data)
        const { result } = res.data
        // console.log(result)
        newSongList.value = result.map((item: any) => {
            return {
                id: item.id,
                name: item.name,
                cover: item.picUrl,
                author: item.song.artists.map((item:any)=>item.name).join('/')|| ''
            }
        }) || []
        // console.log(newSongList.value)
        newSongLoading.value =false
    })
        .catch(err => {
            ElMessage.error('获取新音乐失败')
            console.log('获取新音乐失败' + err)
            newSongLoading.value =false
        })
}


//定义歌手榜单数据
let singerList = ref<{ id: number, name: string, avatar: string }[]>([])
//当前页数
let currentPage = ref(1)
//每页的数量
const pageSize = 5
//定义歌手榜单加载中
let singerLoading=ref(false)
//获取歌手榜单
const getSingerList = () => {
    singerLoading.value =true
    //首页
    const startPage = (currentPage.value - 1) * pageSize
    //尾页
    const endPage = startPage + pageSize
    // console.log(currentPage.value, startPage, endPage)
    getSingers(30).then(res => {
        // console.log(res.data)
        const { artists } = res.data
        singerList.value = artists.map((item: any) => {
            return {
                id: item.id,
                name: item.name,
                avatar: item.picUrl,
            }
        }) || []
        singerList.value = singerList.value.slice(startPage, endPage)
        // console.log(singerList.value)
        singerLoading.value =false
    })
        .catch(err => {
            ElMessage.error('获取歌手榜单失败')
            console.log('获取歌手榜单失败' + err)
            singerLoading.value =false
        })
}

//分页切换
const handleChange = () => {
    // console.log('切换页码', currentPage.value)
    getSingerList()
}


//点击获取歌单
const handleList=(id:number)=>{
    if(!id) return
    router.push({
        name:'musicList',
        query:{
            id
        }
    })
}


//点击音乐，播放音乐
const handlePlay=(id:number)=>{
    // console.log('播放音乐',id)
    router.push({
        path:'/player',
        query:{
            id
        }
    })

}

//点击获取歌手详情
const handleSinger=(id:number)=>{
    if(!id) return
    router.push({
       path:'/singerData',
        query:{
            id
        }
    })
}
onMounted(() => {
    //挂载完获取推荐歌单
    getRecommendList()
    //获取新音乐
    getNewSongList()
    //获取歌手榜单
    getSingerList()
})

</script>

<style scoped>
.hall-wrapper {
    display: flex;
    justify-content: center;
}

.hall-inner {
    width: 100%;
    max-width: 1200px;
}

/* 推荐歌单 */
.section-title {
    margin: 0 0 16px;
    margin-top: 40px;
    font-size: 20px;
    font-weight: 600;
    color: #333;
}

.playlist-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    list-style: none;
    padding: 0;
    margin: 0;
}

.playlist-item {
    /* flex: 1; */
    max-width: 220px;
    cursor: pointer;
}

.cover-wrapper {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 4px;
    overflow: hidden;
    background: #eee;
    cursor: pointer;
}

.cover-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
}

.cover-wrapper:hover img {
    transform: scale(1.06);
}

.info {
    margin-top: 8px;
}

.title {
    font-size: 14px;
    color: #333;
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.desc {
    font-size: 12px;
    color: #999;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 推荐新音乐 */
.section-title--sub {
    margin-top: 40px;
}

.song-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 40px;
    list-style: none;
    padding: 0;
    margin: 0;
}

.song-item {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}

.song-cover {
    width: 82px;
    height: 82px;
    border-radius: 4px;
    overflow: hidden;
    background: #eee;
    flex-shrink: 0;
    cursor: pointer;
}

.song-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
}

.song-cover:hover img {
    transform: scale(1.2);
}

.song-info {
    flex: 1;
}

.song-name {
    font-size: 14px;
    color: #333;
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song-artist {
    font-size: 12px;
    color: #999;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 歌手轮播图 */
.section-title--singer {
    margin-top: 68px;
    font-size: 22px;
    text-align: center;
}

.singer-list {
    margin: 16px 0 0;
    padding: 0;
    list-style: none;
    display: flex;
    justify-content: space-between;
}

.singer-item {
    width: 20%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.singer-avatar {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    overflow: hidden;
    background: #eee;
    flex-shrink: 0;
}

.singer-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.singer-name {
    font-size: 16px;
    color: #333;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 左右按钮 */
.pagination-btn {
    margin-top: 40px;
    display: flex;
    justify-content: center;
}

/* 提示加载中 */
.tip {
    margin-top: 16px;
    font-size: 14px;
    color: #777;
}
</style>