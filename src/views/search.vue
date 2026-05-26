<template>
    <div class="search-page">
        <div class="search-inner">
            <h2 class="title">搜索结果</h2>
            <p class="keyword">关键词：{{ keyWord }}</p>

            <div class="tip" v-if="loading">正在搜索...</div>

            <!-- 搜索不到 -->
            <div class="tip" v-if="keyWord && !searchList">未找到与 "{{ keyWord }}" 相关的歌曲</div>

            <!-- 搜索到了 -->
            <ul class="song-list" v-else>
                <li class="song-item" v-for="item in searchList" :key="item.id" @click="handlePlay(item.id)">
                    <div class="song-main">
                        <span class="song-name">{{ item.name }}</span>
                        <span class="song-artist">{{ item.author }}</span>
                    </div>
                    <div class="song-extra">
                        <span class="song-album">{{ item.album }}</span>
                        <span class="song-duration">{{ dayjs(item.time).format('mm:ss') || '00:00' }}</span>
                    </div>
                </li>
            </ul>
        </div>

    </div>
</template>

<script setup lang="ts" name="search">
import { getSearch } from '@/api/api'
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
const route = useRoute()
const router = useRouter()
const keyWord = computed(() => (route.query.keyword || '').toString())
// console.log(keyWord.value)
const loading = ref(false)
//定义搜索的数据
const searchList = ref<{ id: number, name: string, author: string, album: string, time: number }[]>([])
//获取搜索的数据
const getSearchList = (key: string) => {
    // console.log(key)
    loading.value = true
    if (!key) return
    //清空数据
    searchList.value = []
    getSearch(key, 20).then(res => {
        const { data: { result: { songs } } } = res
        // console.log(songs)
        searchList.value = songs.map((item: any) => {
            return {
                id: item.id,
                name: item.name,
                author: item.ar.map((item: any) => item.name).join('/'),
                album: item.al.name || '',
                time: item.dt || 0
            }
        }) || []
        // console.log(searchList.value)
        loading.value = false
    })
        .catch(err => {
            ElMessage.error(("搜索失败,"+(err.response?.data?.message||err.response?.data?.msg))||'搜索失败')
            router.back()
            console.log('搜索失败：' + err)
            loading.value = false
        })
}

//播放
const handlePlay = (id: number) => {
    if (!id) return
    router.push({
        path: '/player',
        query: {
            id
        }
    })
}

//监听关键词的变化，一变化重新执行
watch(() => keyWord.value, (newValue) => {
    if (!newValue) return
    getSearchList(newValue)
})
onMounted(() => {
    getSearchList(keyWord.value)
})
</script>

<style scoped>
.search-page {
    min-height: calc(100vh - 90px);
    padding: 24px 32px;
    box-sizing: border-box;
}

.search-inner {
    max-width: 1200px;
    margin: 0 auto;
}

.title {
    margin: 0 0 12px;
    font-size: 20px;
    font-weight: 600;
}

.keyword {
    margin: 0 0 16px;
    font-size: 14px;
    color: #666;
}

.tip {
    margin-top: 24px;
    font-size: 14px;
    color: #888;
}

.song-list {
    margin: 16px 0 0;
    padding: 0;
    list-style: none;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.song-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-bottom: 1px solid #f2f2f2;
    cursor: pointer;
    font-size: 13px;
}

.song-item:last-of-type {
    border-bottom: none;
}

.song-item:hover {
    background: #fafafa;
}

.song-main {
    display: flex;
    flex-direction: column;
    max-width: 60%;
}

.song-name {
    font-size: 14px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song-artist {
    margin-top: 2px;
    color: #999;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song-extra {
    display: flex;
    align-items: center;
    gap: 16px;
    max-width: 40%;
    justify-content: flex-end;
}

.song-album {
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song-duration {
    color: #999;
    flex-shrink: 0;
}
</style>