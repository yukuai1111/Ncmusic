<template>
    <div>
        <h1 class="title">MV详情</h1>
        <ul class="playlist-list" >
            <li class="playlist-item" v-for="item in MvList" :key="item.id" @click="handlePlay(item.id)">
                <div class="cover">
                    <img :src="item.cover" alt="歌单封面" :title="item.name">
                </div>
                <div class="info">
                    <p class="name">{{ item.name }}</p>
                    <p class="count">{{ item.publishTime }}</p>
                    <p class="count">播放量：{{ item.playcount }}万</p>
                    <p class="count">时长：{{ dayjs(item.duration).format('mm:ss')  }}</p>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts" name="SongMv">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMvList } from '@/api/api'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
const route = useRoute()
const router = useRouter()
const id = computed(() => Number(route.query.id))

//Mv数据
const MvList = ref<{ id: number, name: string, cover: string, duration: number, playcount: number, publishTime: string }[]>([])
const getMv = (id: number) => {
    if (!id) return
    
    getMvList(id).then(res => {
        const { data: { mvs } } = res
        // console.log(mvs)
        MvList.value = mvs.map((item: any) => {
            return {
                id: item.id,
                name: item.name,
                cover: item.imgurl,
                duration: item.duration,
                playcount: ((item.playCount)/10000).toFixed(2),
                publishTime: item.publishTime,
            }
        })
        console.log(MvList.value)
    })
        .catch((err) => {
            ElMessage.error("获取MV列表失败")
            console.log('获取MV列表失败', err)
        })
}
//点击播放MV
const handlePlay = (id: number) => {
    if (!id) return
    router.push({path:'/mvDetails',query:{id}})
 
}
onMounted(() => {
    getMv(id.value)
})
</script>

<style scoped>
.title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 20px;
    margin-left: 20px;
}

.playlist-list {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
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

.name {
    margin: 0 0 4px;
    font-size: 14px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.count {
    margin: 4px 0;
    font-size: 12px;
    color: #999;
}

.tip {
    margin-top: 16px;
    font-size: 14px;
    color: #777;
}
</style>