<template>
    <div>
        <div class="back-btn" @click="router.back()">
            <el-icon>
                <ArrowLeft />
            </el-icon>
            返回
        </div>
        <h1 class="title">{{alName}}</h1>
        <div class="tip" v-if="listLoading">歌曲加载中...</div>
        <div class="tip" v-else-if="!albumList || albumList.length === 0">暂无歌曲</div>
        <ul class="track-list" v-else>
            <li class="track-item" v-for="item in albumList" :key="item.id" @click="handlePlay(item.id)">
                <span class="track-index">{{ item.index }}</span>
                <div class="track-main">
                    <div class="track-name">{{ item.name }}</div>
                    <div class="track-artist">{{ item.author }}</div>
                </div>
                <div class="track-extra">
                    <div class="track-duration">{{ dayjs(item.time).format('mm:ss') }}</div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts" name="albumList">
import { getAlbumDetail } from '@/api/api';
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
const route = useRoute()
const router = useRouter()
const id = computed(() => Number(route.query.id))

const listLoading = ref<boolean>(false)



//专辑歌曲数据
const albumList = ref<{ id: number, name: string, author: string, time: number, index: number }[]>([])
const alName=ref<string>('')
const getAlbumList = (id: number) => {
    if (!id) return
    listLoading.value = true
    //获取专辑详情
    getAlbumDetail(id).then(res => {
        const { data: { songs } } = res
        // console.log(songs)
        alName.value=songs[0].al?.name||''

        albumList.value = songs.map((item: any, index: number) => {
            return {
                id: item.id || 0,
                name: item.name || '',
                author: item.ar?.map((item: any) => item.name).join('/') || '',
                time: item.dt || 0,
                index: index + 1
            }
        })
        // console.log(albumList.value)
        listLoading.value = false
    })
        .catch(err => {
            ElMessage.error((err.response?.data?.message||err.response?.data?.msg)||'获取专辑详情失败')
            console.log("获取专辑详情失败" + err)
            listLoading.value = false
        })
}

//点击播放
const handlePlay=(id:number)=>{
    if (!id) return
    router.push({
        path: '/player',
        query: {
            id
        }
    })
   
}
onMounted(() => {
    getAlbumList(id.value)
})
</script>

<style scoped>
.title {
    margin: 0 0 16px 50px;
    font-size: 20px;
    font-weight: 600;
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

/* 提示加载中 */
.tip {
    margin-top: 16px;
    font-size: 14px;
    color: #777;
}

/* 返回按钮 */
.back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-weight: 600;
    margin-bottom: 20px;
}

.back-btn span {
    font-size: 16px;
    color: #333;
}
</style>