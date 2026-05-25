<template>
    <div>
        <h1 class="title">专辑</h1>
        <div class="tip" v-if="albumLoading">专辑加载中...</div>
        <div class="tip" v-else-if="!albums||albums.length===0">暂无专辑</div>
        <ul class="playlist-list" v-else>
            <li class="playlist-item" v-for="item in albums" :key="item.id" @click="handleList(item.id)">
                <div class="cover">
                    <img :src="item.cover" alt="歌单封面" :title="item.name"> 
                </div>
                <div class="info">
                    <p class="name">{{ item.name }}<span v-if="item.transNames">({{ item.transNames }})</span></p>
                    <p class="count">{{ (new Date(item.publishTime).toLocaleDateString()).replace(/\//g, '-') }}</p>
                    <p class="count">共{{ item.size }}首</p>
                </div>

            </li>
        </ul>
    </div>
</template>

<script setup lang="ts" name="SongAlbum">
import { getSingerAlbum } from '@/api/api'
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import router from '@/router'
const route = useRoute()
const id = computed(() => route.query.id)

const albumLoading = ref(false)
//专辑数据
const albums = ref<{ id: number, name: string, transNames: string, cover: string, publishTime: number, size: number }[]>([])
const getAlbum = (id: number) => {
    if (!id) return
    albumLoading.value = true
    getSingerAlbum(id, 20).then(res => {
        const { data: { hotAlbums } } = res
        // console.log(hotAlbums)
        albums.value = hotAlbums.map((item: any) => {
            return {
                id: item.id,
                name: item.name,
                transNames: item.transNames?.map((item: any) => item).join('/') || '',
                cover: item.picUrl || '',
                publishTime: item.publishTime || '',
                size: item.size || ''
            }
        })
        // console.log(albums.value)
        albumLoading.value = false
    })
        .catch(err => {
            ElMessage.error('获取专辑失败')
            console.log('获取专辑失败' + err)
            albumLoading.value = false
        })
}

//获取专辑的歌曲
const handleList=(id:number)=>{
    if(!id) return
    router.push({path:'/albumList',query:{id}})
}
onMounted(() => {
    console.log(id.value)
    getAlbum(Number(id.value))
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

.name span {
    margin-left: 6px;
    font-size: 12px;
    color: #999;
}

.count {
    margin: 3px 0;
    font-size: 12px;
    color: #999;
}
.tip {
    margin-top: 16px;
    font-size: 14px;
    color: #777;
}
</style>