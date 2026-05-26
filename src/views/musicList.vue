<template>
    <div class="musiclist-page">
        <!-- 返回按钮 -->
        <div class="back-btn" @click="router.back()">
            <el-icon>
                <ArrowLeft />
            </el-icon>
            <span>返回</span>
        </div>
        <div class="musiclist-inner">
            <div class="title-container">
                <h2 class="title">{{ musicListName }}</h2>
                <div class="actions" v-if="musicListName&&musicList.length!==0">
                    <span class="action-btn">
                        <span @click="handleSubscribe">
                            <el-icon v-if="!subscribed" size="24">
                                <Star />
                            </el-icon>
                            <el-icon v-else size="24">
                                <StarFilled />
                            </el-icon>
                        </span>
                        <span>{{ subscribedCount }}</span>
                    </span>
                </div>
                <el-dropdown placement="bottom" v-if="similarList.length !== 0">
                    <el-button class="similar-btn">
                        <el-icon>
                            <CaretBottom />
                        </el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <ul class="similar-list">
                                <li v-for="item in similarList" :key="item.id" class="similar-item"
                                    @click="router.push({ path: '/musicList', query: { id: item.id } })">
                                    <div class="cover">
                                        <img :src="item.cover" :title="item.name">
                                    </div>
                                    <div class="similar-name">{{ item.name }}</div>
                                    <div class="similar-tags">{{ item.tag }}</div>
                                    <div class="similar-tags">播放量：{{ item.playcount }}万</div>
                                </li>
                            </ul>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
            <!-- 歌曲记载中 -->
            <div class="tip" v-if=loading>歌曲加载中...</div>
            <!-- 暂无歌曲 -->
            <div class="tip" v-else-if="!musicList || musicList.length === 0">暂无歌曲</div>
            <ul class="track-list" v-else>
                <li class="track-item" v-for="item in musicList" :key="item.id" @click="handlePlay(item.id)">
                    <span class="track-index">{{ item.index }}</span>
                    <div class="track-main">
                        <div class="track-name">{{ item.name }}</div>
                        <div class="track-artist">{{ item.author }}</div>
                    </div>
                    <div class="track-extra">
                        <div class="track-album">{{ item.album }}</div>
                        <div class="track-duration">{{ dayjs(item.time).format('mm:ss') }}</div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup name="musicList" lang="ts">
import { getMusicDetail, getSimilarPlaylists, subscribePlaylist } from '@/api/api'
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
const route = useRoute()
const router = useRouter()
//定义歌单详情
let musicList = ref<
    {
        id: number,
        name: string,
        author: string,
        time: number,
        album: string,
        index: number,
    }[]>([])
//定义歌单名字
let musicListName = ref('')
//定义收藏状态
let subscribed = ref(false)
//定义收藏数
let subscribedCount = ref('')
//获取路由的传来的id
let id = computed(() => route.query.id)
//定义加载状态
let loading = ref(false)
//获取歌单详情
const getMusicList = (id: number) => {
    loading.value = true
    getMusicDetail(id).then(res => {
        // console.log(res.data)
        const playList = res.data.playlist
        console.log(playList)
        musicListName.value = playList.name || '歌单'
        subscribed.value = playList.subscribed
        subscribedCount.value = playList.subscribedCount

        if (playList.subscribedCount > 10000) {
            subscribedCount.value = Number((playList.subscribedCount / 10000).toFixed(2)) + '万'
        }

        musicList.value = playList.tracks.map((item: any, index: number) => {
            return {
                id: item.id,
                name: item.name,
                author: (item.ar || item.artists || []).map((item: any) => item.name).join('/'),  //作者可能有多个，用/连接起来
                time: item.dt || item.duration || 0,
                album: (item.al || item.album).name || '',
                index: index + 1,
            }
        }) || []

        // console.log(musicList.value)
        loading.value = false
        //获取相似歌单
        getSimilar(id)
    })
        .catch(err => {
            ElMessage.error('获取歌单详情失败')
            console.log('获取歌单详情失败' + err)
            loading.value = false
        })
}

//点击跳转到播放页面
const handlePlay = (id: number) => {
    if (!id) return
    router.push({
        path: '/player',
        query: {
            id
        }
    })
}

//定义相似歌单数据
const similarList = ref<{ id: number, name: string, cover: string, tag: string, playcount: number }[]>([])
//获取相似歌单
const getSimilar = (id: number) => {
    if (!id) return
    getSimilarPlaylists(id).then(res => {
        const { data: { playlists } } = res
        // console.log(playlists)
        similarList.value = playlists.map((item: any) => {
            return {
                id: item.id,
                name: item.name,
                cover: item.coverImgUrl,
                tag: item.tags.map((item: any) => item).join('/'),
                playcount: Number((item.playCount / 10000).toFixed(2))
            }
        })
        // console.log(similarList.value)
    })
}


//收藏/取消收藏
const handleSubscribe = () => {
    console.log(id.value, subscribed.value, subscribedCount.value)
    if (subscribed.value === false) {
        //将要收藏
        subscribePlaylist(Number(id.value), 1).then(res => {
            console.log(res.data)
           ElMessage.success('收藏成功')
           subscribed.value = true
           if (typeof subscribedCount.value === "number") {
                subscribedCount.value = String(Number(subscribedCount.value) + 1)
           }else{
            subscribedCount.value = Number((Number(subscribedCount.value.slice(0,-1))*10000+1)/10000).toFixed(2)+'万'
           }
        })
            .catch(err => {
                // console.log(err.code)
                ElMessage.error('收藏失败,'+(err.response?.data?.message||err.response?.data?.msg))
                console.log('收藏失败' + err)
            })
    } else {
        //将要取消收藏
        subscribePlaylist(Number(id.value), 0).then(res => {
            console.log(res.data)
            if (res.data.code === 200) {
                ElMessage.success('取消收藏成功')
                subscribed.value = false
                if (typeof subscribedCount.value === "number") {
                    subscribedCount.value = String(Number(subscribedCount.value) - 1)
                }
            }
        })
            .catch(err => {
                ElMessage.error('取消收藏失败')
                console.log('取消收藏失败' + err)
            })
    }
}
//监视路由参数
watch(() => id.value, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        // console.log(newValue)
        getMusicList(Number(newValue))
    }
})
onMounted(() => {
    // console.log(Number(id.value))
    if (!id.value) return
    //获取歌单详情
    getMusicList(Number(id.value))
})
</script>

<style scoped>
.musiclist-page {
    min-height: calc(100vh - 90px);
    padding: 24px 32px;
    box-sizing: border-box;
}

.musiclist-inner {
    max-width: 1200px;
    margin: 0 auto;
}

.title-container {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 20px
}

.title {
    margin: 0 0 16px;
    font-size: 20px;
    font-weight: 600;
}

.actions {
    display: flex;
    gap: 16px;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 15px;
    color: #5b6e8c;
    cursor: pointer;
    transition: all 0.2s;
    background: none;
    border: none;
    padding: 0;
}


.action-btn:hover {
    opacity: 0.7;
}

.similar-btn {
    margin-bottom: 13px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 40px;
    color: white;
    font-size: 20px;
    font-weight: 500;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    letter-spacing: 0.5px;
}

/* 悬停效果 */
.similar-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    background: linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%);
}

.similar-btn span {
    font-size: 16px;
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

/* 相似歌单 */
.similar-list {
    width: 1200px;
    display: flex;
    justify-content: space-evenly;
    gap: 20px;
    overflow: auto;
}

.similar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    border: 1px solid #f0f0f0;
    cursor: pointer;
    padding: 10px;
}

.cover {
    width: 160px;
    height: 160px;

}

.cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.similar-name {
    font-size: 20px;
    font-weight: 400;
}

.similar-tags {
    font-size: 13px;
    color: #777;
    font-weight: 400;
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
}

.back-btn span {
    font-size: 16px;
    color: #333;
}
</style>