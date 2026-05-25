<template>
    <div class="player-page">
        <div class="player-inner">
            <div class="action">
                <div class="back-btn" @click="router.back()">
                    <el-icon>
                        <ArrowLeftBold />
                    </el-icon>
                    <span class="back-text">返回</span>
                </div>
                <div class="get-btn">
                    <el-button @click='handleGet(Number(id))'
                        style="border: none;background: transparent;font-size: 20px;">
                        <span class="get-text">听不过瘾？获取相似歌曲吧！</span>
                        <el-icon>
                            <Promotion />
                        </el-icon>
                    </el-button>
                    <!-- 弹窗 -->
                    <el-dialog v-model="dialogVisible" title="相似歌曲" width="80%">
                        <div class="tip" v-if="similarLoading">歌曲加载中...</div>
                        <ul class="track-list">
                            <li class="track-item" v-for="item in similarSong" :key="item.id"
                                @click="router.push({ path: '/player', query: { id: item.id } })">
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
                    </el-dialog>
                </div>
            </div>
            <div class="player-main">
                <!-- 左侧 -->
                <div class="player-left">
                    <div class="cover-wrap">
                        <div class="cover-disc">
                            <img :src="songCover" alt="" class="cover-img">
                        </div>
                    </div>
                    <div class="song-meta">
                        <div class="song-title">{{ songName }}</div>
                        <div class="song-artist">{{ songAuthor }}</div>
                        <div class="song-album">{{ songAlbum }}</div>
                    </div>
                </div>
                <!-- 右侧 -->
                <div class="player-right">
                    <div class="lyrics-card ">
                        <h3 class="lyrics-title">歌词</h3>
                        <div class="lyrics-content">
                            <p v-if="songLyric?.length > 0" v-for="(item, index) in songLyric" :key="item.time"
                                class="lyrics-line" :class="{ 'lyrics-line--highlight': currentIndex === index }"
                                :ref="(el) => { if (index === currentIndex) { activeRef = el } }">
                                {{ item.text }}</p>
                            <p v-else class="lyrics-line">暂无歌词</p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 底部 -->
            <div class="player-controls">
                <div class="controls-main">
                    <!-- 按钮 -->
                    <el-button class="btn-circle btn-large" @click="handlePlay">{{ isPlay ? '⏸' : '▶' }}</el-button>
                    <div class="btn-action">
                        <el-button circle size="large" style="font-size: 22px;" @click="handleLike">{{ isLike ? '❤' :
                            '♡' }}</el-button>
                        <el-button circle size="large" @click="handleComment"><el-icon size="20">
                                <ChatDotSquare />
                            </el-icon></el-button>
                    </div>
                </div>
                <!-- 进度条 -->
                <div class="progress-wrap ">
                    <!-- 当前时间 -->
                    <div class="time-label">{{ currentTime }}</div>
                    <!-- 进度条 -->
                    <div class="progress-bar" @click="handleProgress">
                        <div class="progress-inner" :style="{ width: totalTime ? `${progressWidth}%` : '0%' }"></div>
                    </div>
                    <!-- 总时间 -->
                    <div class="time-label">{{ totalTime }}</div>
                </div>
                <!-- 播放器 -->
                <audio :src="audioUrl" v-if="audioUrl" class="audio-hidden" ref="audioRef"
                    @loadedmetadata="handleLoadedmetadata" @timeupdate="handleTimeupdate" @ended="handleEnd"></audio>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts" name="player">
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { getSongDetail, getLyric, getPlayUrl, getSimilarSongs, getLikeList, likeSong } from '@/api/api'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useUserStore } from '@/stores/users'
const route = useRoute()
const router = useRouter()
const id = computed(() => (route.query.id))

const userStore = useUserStore()

//弹窗可见与否
const dialogVisible = ref(false)

//定义歌曲详情数据
let songCover = ref('')
let songName = ref('')
let songAuthor = ref('')
let songAlbum = ref('')
let songLyric = ref<any>([])
let currentIndex = ref(-1)   //当前选中的歌词索引，先是-1（取不到）
//获取歌曲详情
const getSong = (id: number) => {
    //获取封面，歌名，歌手和专辑
    getSongDetail(id).then(res => {
        const data = res.data
        // console.log(data)
        songCover.value = data.songs[0]?.al?.picUrl || 'https://tse1-mm.cn.bing.net/th/id/OIP-C.LVkCQLB0TS18zQxTvW-WJAAAAA?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3'
        songName.value = data.songs[0]?.name || '正在播放的歌曲'
        songAuthor.value = data.songs[0]?.ar?.map((item: any) => item.name).join('/') || '歌手'
        songAlbum.value = data.songs[0]?.al?.name || '专辑'
        // console.log(songCover.value, songName.value, songAuthor.value,songAlbum.value)
        //获取歌曲详情成功后才获取歌词
        getLyric(id).then(res => {
            // console.log(res)
            const data = res.data
            // console.log(data)
            songLyric.value = handleLyric(data.lrc.lyric)   //result赋值给了songLyric.value
            // console.log(songLyric.value)
        })
            .catch(err => {
                ElMessage.error('获取歌词失败')
                console.log('获取歌词失败' + err)
                songLyric.value = []
            })
        //获取歌曲详情成功后才获取播放地址
        getUrl(id)
    })
        .catch(err => {
            ElMessage.error('获取歌曲详情失败')
            console.log('获取歌曲详情失败' + err)
        })

}

//整合歌词
const handleLyric = (lyric: any) => {
    // console.log(lyric)
    const lines = lyric.split('\n')
    // console.log(lines)
    const result: any[] = []   //最后整合完的数据
    const timeReg = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/  // 匹配 [00:12.00] 或 [00:12.000]
    lines.map((item: any) => {
        const match = timeReg.exec(item)
        // console.log(match)
        if (match) {
            const min = match[1]
            const sec = match[2]
            const mil = match[3]
            // console.log(min,sec,mil)
            const time = Number(min) * 60 + Number(sec) + Number(mil) / 1000
            // console.log(time)   //拿到每一句的时间
            const text = item.replace(timeReg, '')
            // console.log(text)   //拿到每一句歌词
            if (text) {
                result.push({ time, text })
            }
        }
        return result
    })
    result.sort((a, b) => a.time - b.time)   //根据时间排序
    // console.log(result)   //获取到了整合的数据
    return result
}


//播放数据
let isPlay = ref(false)
let currentTime = ref('')
let totalTime = ref('')
let audioUrl = ref('')
let audioRef = ref<any>(null)
let activeRef = ref<any>(null)   //当前的歌词，用于滚动
const getUrl = (id: number) => {
    getPlayUrl(id).then(res => {
        const data = res.data
        audioUrl.value = data.data[0].url || ''
        currentTime.value = '00:00'
        totalTime.value = '00:00'

    })
        .catch(err => {
            ElMessage.error('获取播放地址失败')
            console.log('获取播放地址失败' + err)
        })
}
//获取歌曲元数据
const handleLoadedmetadata = () => {
    //获取audio对象
    const audio = audioRef.value
    if (!audio) return
    totalTime.value = dayjs(Math.floor(Number(audio.duration) * 1000)).format('mm:ss') || '00:00'
    // console.log(totalTime.value)
}
//开始播放
const handlePlay = () => {
    //获取audio对象
    const audio = audioRef.value
    if (!audio || !audioRef.value) return
    if (audio.paused) {
        //如果一开始是暂停，就开启
        audio.play().then(() => {
            isPlay.value = true
        })
            .catch((err: any) => {
                ElMessage.error('播放失败')
                console.log('播放失败' + err)
            })
    } else {
        //如果一开始是开启，就暂停
        audio.pause()
        isPlay.value = false
    }

}

//时间变化事件
const handleTimeupdate = () => {
    const audio = audioRef.value
    if (!audio) return
    //获取当前时间
    currentTime.value = dayjs(Math.floor(Number(audio.currentTime) * 1000)).format('mm:ss') || '00:00'
    // console.log(audio.currentTime)
    // console.log(songLyric.value)
    songLyric.value.forEach((item: any, index: number) => {
        // console.log(item.time)
        if (item.time <= audio.currentTime) {
            // console.log(item)
            currentIndex.value = index
        }
    })
}
//播放结束
const handleEnd = () => {
    isPlay.value = false
}

//转换时间
const time = (time: string) => {
    // console.log(time) 
    const [min, sec] = time.split(':')   //拆成分、秒
    // console.log(min,sec)
    return Number(min) * 60 + Number(sec) //全部转成秒
}
//进度条宽度
const progressWidth = computed(() => {
    // console.log(currentTime.value)
    // console.log(totalTime.value)
    const current = time(currentTime.value)
    // console.log(current)   //得到当前时间
    const total = time(totalTime.value)
    // console.log(total)   //得到总时间
    return (current / total) * 100
})

//进度条点击事件
const handleProgress = (e: any) => {
    // console.log(e.currentTarget)   //点击事件绑定的那个元素
    const bar = e.currentTarget
    const rect = bar.getBoundingClientRect()
    // console.log(rect)   //元素的宽高，和边界和视口的距离
    // console.log(e.clientX)  //点击的位置到左边视口的距离
    const total = time(totalTime.value)
    const newTime = ((e.clientX - rect.left) / rect.width) * total   //得到新的当前时间，秒单位
    const audio = audioRef.value
    if (!audio) return
    audio.currentTime = newTime

}

//歌词滚动
watch(() => currentIndex.value, async (newValue) => {
    await nextTick()   //等到新的dom渲染完毕
    const active = activeRef.value
    if (!newValue) return
    if (active) {
        active.scrollIntoView({
            behavior: 'smooth',
        })
    }
})


//相似歌曲加载中
const similarLoading = ref(false)
//定义相似歌曲数据
const similarSong = ref<{ id: number, name: string, author: string, time: number, album: string, index: number }[]>([])
//获取相似歌曲
const handleGet = (id: number) => {
    if (!id) return
    //音乐暂停
    audioRef.value?.pause()
    isPlay.value = false
    //弹窗显示
    dialogVisible.value = true
    //获取数据
    getSimilar(id)
}
const getSimilar = (id: number) => {
    if (!id) return
    similarLoading.value = true
    getSimilarSongs(id).then(res => {
        const { data: { songs } } = res
        console.log(songs)
        similarSong.value = songs.map((item: any, index: number) => {
            return {
                id: item.id,
                name: item.name,
                author: item.artists?.map((item: any) => item.name).join('/') || '',
                time: item.duration || 0,
                album: item.album?.name || '',
                index: index + 1
            }
        })
        console.log(similarSong.value)
        similarLoading.value = false
    })
        .catch(() => {
            ElMessage.error('获取相似歌曲失败')
            similarLoading.value = false
        })
}

//喜欢/取消喜欢
const isLike = ref<boolean>()
const handleLike = () => {
   
    // console.log('喜欢/取消喜欢' + id.value)
    if (!userStore.isLogin) {
        ElMessage.warning('您未登录，无法喜欢/取消喜欢')
        return
    }
    if (isLike.value) {
        // console.log('将要取消喜欢')
        likeSong(Number(id.value), false).then(res => {
            console.log(res)
            isLike.value = false

        })
    }
    else {
        // console.log('将要喜欢')
        likeSong(Number(id.value), true).then(res => {
            console.log(res)
            isLike.value = true
        })
    }
}

//评论
const handleComment = () => {
    if (!userStore.isLogin) {
        ElMessage.warning('您未登录，无法评论')
        return
    }

    router.push({ name: 'songComment', query: { id: Number(id.value) } })
}
//监视路由参数变化
watch(() => id.value, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        dialogVisible.value = false
        getSong(Number(newValue))
    }
})
onMounted(() => {
    // console.log((Number(id.value)))
    getSong(Number(id.value))
    if (userStore.isLogin) {
        getLikeList(userStore.user.id).then(res => {
            const { data: { ids } } = res
            // console.log(ids)
            const index = ids.findIndex((item: number) => item === Number(id.value))
            console.log(index)
            if (index === -1) {
                isLike.value = false
            } else {
                isLike.value = true
            }
            // console.log(isLike.value)
        })
    }
})
</script>

<style scoped>
.player-page {
    min-height: calc(100vh - 90px);
    background: radial-gradient(circle at top left, #2b2b2b, #000);
    color: #f5f5f5;
    display: flex;
    justify-content: center;
    padding: 40px 0;
    box-sizing: border-box;
}

.player-inner {
    width: 100%;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 32px;
}

.player-main {
    width: 100%;
    display: flex;
    gap: 32px;
}

.player-left {
    width: 320px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.cover-wrap {
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: radial-gradient(circle, #444, #111);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
}

.cover-disc {
    width: 220px;
    height: 220px;
    border-radius: 50%;
    overflow: hidden;
}

.cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.song-meta {
    margin-top: 20px;
    text-align: center;
}

.song-title {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
}

.song-artist,
.song-album {
    margin: 6px 0 0;
    font-size: 13px;
    color: #cfcfcf;
}

/* 歌词 */
.player-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.lyrics-card {
    width: 100%;
    max-height: 520px;
    padding: 18px 24px;
    border-radius: 16px;
    background: transparent;
    box-shadow: none;
    box-sizing: border-box;
}

.lyrics-title {
    margin: 0 0 16px;
    font-size: 18px;
    color: #fff;
    text-align: center;
    letter-spacing: 1px;
}

.lyrics-content {
    max-height: 460px;
    overflow-y: auto;
    /*垂直方向超出时显示滚动条 */
    overflow-x: hidden;
    /*水平方向不滚动，隐藏溢出内容 */
    padding-right: 0;
    scrollbar-width: none;
    /*隐藏滚动条 */
    scrollbar-color: transparent transparent;
}

.lyrics-line {
    margin: 6px 0;
    font-size: 16px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.65);
    text-align: center;
    transition: color 0.2s ease, transform 0.2s ease;
    white-space: normal;
}

/* 第一条line高亮 */
.lyrics-line--highlight {
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    transform: scale(1.02);
}

.lyrics-content::-webkit-scrollbar {
    width: 0;
    height: 0;
}

/* 底部 */
.player-controls {
    width: 100%;
    padding: 16px 24px 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.audio-hidden {
    /* 隐藏原来的进度条 */
    display: none;
}

.controls-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.btn-circle {
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background: #fff;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
}

.btn-large {
    width: 56px;
    height: 56px;
    font-size: 22px;
}


.btn-circle:hover {
    transform: translateY(-1px);
}

.progress-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
}

.time-label {
    /*时间标签*/
    font-size: 12px;
    color: #c0c0c0;
}

.progress-bar {
    /*进度条*/
    flex: 1;
    height: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
    overflow: hidden;
    cursor: pointer;
}

.progress-inner {
    /* 进度条内部 */
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #ff4b2b, #ff416c);
}

.controls-extra {
    display: none;
}

.extra-left,
.extra-right {
    display: none;
}

.action {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* 返回按钮 */
.back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.back-text {
    font-size: 15px;
    color: #fff;
}

/* 获取按钮 */
.get-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.get-text {
    font-size: 15px;
    color: #999;
}

/* 弹窗样式 */
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

@media (max-width: 960px) {
    .player-inner {
        flex-direction: column;
    }

    .player-main {
        flex-direction: column;
        align-items: center;
    }

    .player-left {
        width: auto;
    }
}
</style>