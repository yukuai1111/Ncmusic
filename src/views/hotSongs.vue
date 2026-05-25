<template>
    <div>
        <h2 class="title">热门歌曲50首</h2>
        <div class="tip" v-if="songLoading">歌曲加载中...</div>
        <div class="tip" v-else-if="!hotSongs||hotSongs.length===0">暂无歌曲</div>
        <ul class="track-list" v-else>
                <li class="track-item" v-for="item in hotSongs" :key="item.id" @click="handlePlay(item.id)">
                    <span class="track-index">{{item.index}}</span>
                    <div class="track-main">
                        <div class="track-name">{{item.name}}</div>
                        <div class="track-artist">{{item.author}}</div>
                    </div>
                    <div class="track-extra">
                        <div class="track-album">{{item.album}}</div>
                        <div class="track-duration">{{dayjs(item.time).format('mm:ss')}}</div>
                    </div>
                </li>
            </ul>
    </div>
</template>

<script setup lang="ts" name="HotSongs">
import { getSingerHotSongs } from '@/api/api'
import { ref,onMounted,computed } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
const route = useRoute()
const router = useRouter()

const id=computed(()=>route.query.id)
const songLoading=ref(false)
//歌曲数据
const hotSongs = ref<{id:number,name:string,author:string,time:number,album:string,index:number}[]>([])

const getHot=(id:number)=>{
    if(!id) return 
    songLoading.value=true
    getSingerHotSongs(id).then(res=>{
        const {data:{songs}}=res
        // console.log(songs)
        hotSongs.value=songs.map((item:any,index:number)=>{
            return {
                id: item.id,
                name: item.name,
                author: (item.ar || item.artists || []).map((item: any) => item.name).join('/'),  //作者可能有多个，用/连接起来
                time: item.dt || item.duration || 0,
                album: (item.al || item.album).name || '',
                index: index + 1
            }
        })
        // console.log(hotSongs.value)
        songLoading.value=false
    })
    .catch(err=>{
        ElMessage.error("获取热门歌曲失败")
        console.log('获取热门歌曲失败', err)
        songLoading.value=false
    })
}

//点击播放音乐
const handlePlay=(id:number)=>{
    if(!id) return 
    router.push({path:'/player',query:{id}})
}

onMounted(()=>{
    // console.log(id.value)
    getHot(Number(id.value))
})
</script> 

<style  scoped>
.title{
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 20px;
    margin-left: 20px;
}
.track-list {
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.track-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    border-bottom: 1px solid #f2f2f2;
    cursor: pointer;
    font-size: 13px;
}

.track-item:last-of-type {
    border-bottom: none;
}

.track-item:hover {
    background: #fafafa;
}

.track-index {
    width: 32px;
    text-align: right;
    margin-right: 12px;
    color: #999;
    flex-shrink: 0;
}

.track-main {
    display: flex;
    flex-direction: column;
    max-width: 50%;
}

.track-name {
    font-size: 14px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.track-artist {
    margin-top: 2px;
    color: #999;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.track-extra {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-left: auto;
    max-width: 40%;
}

.track-album {
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.track-duration {
    color: #999;
    flex-shrink: 0;
}
.tip {
    margin-top: 16px;
    font-size: 14px;
    color: #777;
}
</style>