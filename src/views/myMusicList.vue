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
                <el-dropdown trigger="click" @command="handleCommand">
                    <span class="expand-btn">
                        <el-icon size="20">
                            <Expand />
                        </el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="edit">编辑歌单</el-dropdown-item>
                            <el-dropdown-item command="delete">删除歌单</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <!-- 编辑歌单框 -->
                <el-drawer v-model="drawerVisible" :modal="false" modal-penetrable>
                    <template #header>
                        编辑歌单
                    </template>
                    <template #default>
                        <el-upload action="#" :show-file-list="false" class="change-cover" :before-upload="beforeUpload"
                            :http-request="handleCover">
                            <p>更换封面：</p>
                            <div class="cover-container">
                                <img :src="musicListCover" class="cover-image" />
                                <el-icon>
                                    <ArrowRight />
                                </el-icon>
                            </div>
                        </el-upload>
                        <div class="change-name" @click="handleName">
                            <p>名称：</p>
                            <div class="name-container">
                                <span>{{ musicListName }}</span>
                                <el-icon>
                                    <ArrowRight />
                                </el-icon>
                            </div>
                        </div>
                        <div class="change-desc">
                            <p>简介：</p>
                            <el-input v-model="musicListDesc" placeholder="简单介绍一下" type="textarea" :rows="10"
                                maxlength="1000" show-word-limit></el-input>
                        </div>

                    </template>
                    <template #footer>
                        <div class="drawer-footer">
                            <el-button @click="drawerVisible = false">取消</el-button>
                            <el-button type="primary" @click="handleDesc" >
                                确认更新
                            </el-button>
                        </div>
                    </template>
                </el-drawer>
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
import { getMusicDetail, deletePlaylist, uploadPlaylistCover, updatePlaylistName, updatePlaylistDesc } from '@/api/api'
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
const route = useRoute()
const router = useRouter()
//定义歌单详情
let musicList = ref<{ id: number, name: string, author: string, time: number, album: string, index: number }[]>([])
//定义歌单名字
let musicListName = ref('')
//定义歌单的封面
let musicListCover = ref('')
//定义歌单的简介
let musicListDesc = ref('')
//获取路由的传来的id
let id = computed(() => route.query.id)
//定义加载状态
let loading = ref(false)
//获取歌单详情
const getMusicList = (id: number) => {
    loading.value = true
    getMusicDetail(id).then(res => {
        console.log(res.data)
        const playList = res.data.playlist
        // console.log(playList)
        musicListName.value = playList.name || '歌单'
        musicListCover.value = playList.coverImgUrl || ''
        musicListDesc.value = playList.description || ''
        // console.log(musicListCover.value)
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
    })
        .catch(err => {
            ElMessage.error(("获取歌单详情失败,"+(err.response?.data?.message||err.response?.data?.msg))||'获取歌单详情失败')
            console.log('获取歌单详情失败：' + err)
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


//编辑歌单框可视
const drawerVisible = ref(false)
//点击下拉菜单，进行操作
const handleCommand = (command: string) => {
    if (command === 'edit') {
        // console.log('编辑歌单')
        drawerVisible.value = true
    }
    if (command === 'delete') {
        ElMessageBox.confirm(`确定要删除${musicListName.value}吗？`
            , '提示',
            {
                confirmButtonText: '确定删除',
                cancelButtonText: '取消',
                type: 'warning',
            })
            .then(() => {
                console.log('删除歌单')
                    deletePlaylist(Number(id.value)).then(res => {
                        ElMessage.success('删除成功')
                        router.back()
                        getMusicList(Number(id.value))
                    
                })
                    .catch(err => {
                        ElMessage.error(("删除失败，"+(err.response?.data?.message||err.response?.data?.msg))||'删除失败')
                        console.log('删除失败：' + err)
                    })
            })
            .catch(() => {
                ElMessage.info('取消删除')
            })
    }
}


//更新封面
//校验
const beforeUpload = (rawFile: File) => {
    if (!rawFile.type.startsWith('image/')) {
        ElMessage.error('请上传图片格式')
        return false
    } else if (rawFile.size / 1024 / 1024 > 5) {
        ElMessage.error('请上传5MB以下的图片格式')
        return false
    }
    return true
}
//上传封面
const handleCover = ({ file }: { file: File }) => {
    console.log(file)
    uploadPlaylistCover(file, Number(id.value)).then(res => {
        console.log(res)
        const { data: { data } } = res
        if (data.code === 200) {
            musicListCover.value = data.url || ''
            ElMessage.success('上传成功')
        } else {
            ElMessage.error('上传失败')
        }
    })
        .catch(err => {
            ElMessage.error('上传失败')
            console.log('上传失败' + err)
        })
}

//更新名称
const handleName = () => {
    ElMessageBox.prompt('请输入歌单名称', 'Tip', {
        confirmButtonText: '确认',
        showCancelButton: false,

    })
        .then(({ value }) => {
            if (value.trim() === '') {
                ElMessage({
                    type: 'info',
                    message: '修改名称取消',
                })
                return
            }
          updatePlaylistName({
            id:Number(id.value),
            name:value
          }).then(res=>{
            console.log(res)
            if(res.data.code===200){
                musicListName.value=value
                ElMessage.success('修改成功')
            }
          })
          .catch(err=>{
            ElMessage.error('修改失败')
            console.log('修改失败' + err)
          })
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: '修改名称取消',
            })
        })
}

//按钮加载
const loadingDesc = ref(false)
//更新歌单描述
const handleDesc = () => {
    loadingDesc.value=true
    updatePlaylistDesc({
        id:Number(id.value),
        desc:musicListDesc.value
    }).then(res=>{
        console.log(res)
        if(res.data.code===200){
            ElMessage.success('修改描述成功')
            drawerVisible.value=false
            loadingDesc.value=false
        }
    })
    .catch(err=>{
        ElMessage.error('修改描述失败')
        console.log('修改描述失败' + err)
        drawerVisible.value=false
        loadingDesc.value=false
    })
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
    gap: 40px;
    text-align: center;
}

.title {
    margin: 0 0 16px;
    font-size: 20px;
    font-weight: 600;
}

.expand-btn {
    margin-bottom: 13px;
    border: none;
    border-radius: 40px;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    letter-spacing: 0.5px;
}

/* 悬停效果 */
.expand-btn:hover {
    transform: translateY(-2px);
}

.expand-btn span {
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


.cover {
    width: 160px;
    height: 160px;

}

.cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

/* 编辑框 */
/* 图片 */
.change-cover {
    display: flex;
    border-bottom: 2px solid #eeeded;
    height: 100px;
}

.change-cover p,
.change-name p {
    font-size: 16px;
    color: #333;
}

.cover-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #4b4949;
    margin-left: 210px
}

.cover-image {
    width: 100px;
    height: 100px;
    scale: 0.8;
    object-fit: cover;
}

.change-cover:hover,
.change-name:hover {
    background-color: #fafafa;
}

/* 名字 */
.change-name {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-bottom: 2px solid #eeeded;
    height: 100px;
}

.name-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #4b4949;
}

/* 描述 */
.change-desc {
    height: 100px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
}

.change-desc p {
    font-size: 16px;
    color: #333;
}

input {
    border: none
}
</style>