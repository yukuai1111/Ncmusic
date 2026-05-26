<template>
    <div class="self-page">
        <div class="self-inner">
            <div class="back-btn" @click="router.push('/')">
                <el-icon>
                    <ArrowLeft />
                </el-icon>
                <span>返回</span>
            </div>
            <div class="self-box">
                <div class="tip" v-if="dataLoading">加载中...</div>
                <div class="self-data" v-else>
                    <div class="avatar-placeholeder">
                        <div class="yes-avatar" @mousemove="changeAvatar = true" @mouseleave="changeAvatar = false">
                            <img :src="useUser.user?.avatar" alt="">
                            <el-upload action="#" :before-upload="beforeAvatarUpload" :http-request="handleAvatar"
                                :show-file-list="false">
                                <Transition name="fade">
                                    <el-button class="change-avatar" v-if="changeAvatar">修改头像</el-button>
                                </Transition>
                            </el-upload>
                        </div>
                    </div>
                    <!-- 用户信息框 -->
                    <div class="user-info">
                        <div class="name">
                            <span>{{ useUser.user.name }}</span>
                            <el-button type="primary" :icon="Edit" @click="handleData">
                                编辑资料
                            </el-button>
                        </div>
                        <hr style="margin-bottom: -10px;">
                        <div class="like-box">
                            <div class="item">
                                <p class="notes-number">{{ nodes }}</p>
                                <p class="item-name">笔记</p>
                            </div>
                            <div class="item" @click="handleFollows">
                                <p class="notes-number">{{ follows }}</p>
                                <p class="item-name">关注</p>
                            </div>
                            <div class="item" @click="handleFollowed">
                                <p class="notes-number">{{ followds }}</p>
                                <p class="item-name">粉丝</p>
                            </div>
                        </div>
                        <div class="place">所在地区：{{ areaName }}</div>
                        <div class="place">等级：Lv.{{ level }}</div>
                    </div>
                </div>
                <!-- 最近播放 -->
                <div class="mycollection">
                    <h3 class="title">最近播放</h3>
                    <hr class="line">
                    <div v-if="playLoading">加载中...</div>
                    <div v-else-if="playList.length === 0" class="tip">暂无最近播放记录，快去听歌吧！</div>
                    <ul class="track-list" v-else>
                        <li class="track-item" v-for="item in playList" :key="item.id"
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
                </div>
                <!-- 我的歌单 -->
                <div class="mycollection">
                    <h3 class="title">我创建的歌单({{ myMusic?.length || 0 }})</h3>
                    <hr class="line">
                    <div v-if="musicLoading">加载中...</div>
                    <div v-else-if="myMusic.length === 0" class="collection-add"><el-icon size="60" color="#ccc">
                            <Plus />
                        </el-icon>
                    </div>
                    <ul class="collection-list" v-else>
                        <li class="collection-item" v-for="item in myMusic" :key="item.id"
                            @click="handleMyPlay(item.id)">
                            <div class="item-cover">
                                <img :src="item.cover" :alt="item.name">
                            </div>
                            <div class="name-container">
                                <el-icon color="#999" v-if="item.privacy === 10">
                                    <Lock />
                                </el-icon>
                                <p class="collection-name">{{ item.name }}</p>
                            </div>
                            <p class="collection-count">{{ item.count }}次播放</p>
                        </li>
                        <li class="collection-item collection-add" @click="handleAdd">
                            <el-icon size="60" color="#ccc">
                                <Plus />
                            </el-icon>
                        </li>
                    </ul>
                    <!-- 新建歌单弹窗 -->
                    <el-drawer v-model="drawerVisible" :modal="false" modal-penetrable>
                        <el-form :model="listForm" :rules="rule">
                            <el-form-item label="歌单名称" prop="name">
                                <el-input type="text" v-model="listForm.name" placeholder="请输入歌单名称" show-word-limit
                                    maxlength="20" word-limit-position="outside"></el-input>
                            </el-form-item>
                            <el-form-item label="是否设为隐私歌单" prop="privacy">
                                <el-switch v-model="listForm.privacy" />
                            </el-form-item>
                        </el-form>
                        <template #footer>
                            <div>
                                <el-button @click="drawerVisible = false">取消</el-button>
                                <el-button type="primary" @click="handleCreate">
                                    确认创建
                                </el-button>
                            </div>
                        </template>
                    </el-drawer>
                </div>
                <div class="mycollection">
                    <h3 class="title">我收藏的歌单({{ otherMusic?.length || 0 }})</h3>
                    <hr class="line">
                    <div v-if="musicLoading">加载中...</div>
                    <div v-else-if="otherMusic.length === 0" class="tip">暂无收藏的歌单，快去收藏一个吧！</div>
                    <ul class="collection-list" v-else>
                        <li class="collection-item" v-for="item in otherMusic" :key="item.id"
                            @click="handlePlay(item.id)">
                            <div class="item-cover">
                                <img :src="item.cover" :alt="item.name">
                            </div>
                            <p class="collection-name">{{ item.name }}</p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup name="selfCenter" lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useUserStore } from '@/stores/users'
import { getBasicData, getMyMusic, getRecentPlayList, createPlaylist, updateAvatar } from '@/api/api'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { Edit } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const useUser = useUserStore()
const router = useRouter()

//加载中状态
const dataLoading = ref(false)
const musicLoading = ref(false)


//基本数据
const nodes = ref('')             //笔记
const followds = ref('')            //粉丝
const follows = ref('')            //关注
const areaName = ref('')            //地区名称
const level = ref('')           //等级
//获取基本数据
const getBasic = (id: number) => {
    if (!id) return
    dataLoading.value = true
    getBasicData(id).then(async res => {
        const data = res.data
        //   console.log(data)
        nodes.value = data.profile.eventCount
        followds.value = data.profile.followeds
        follows.value = data.profile.follows
        const areaCode = data.profile.city
        //根据地区编码获取地区名称
        const response1 = await fetch(`https://openapi.dwo.cc/api/convert?code=${areaCode}`)
        const areaInfo = await response1.json()
        // console.log(areaInfo.name)
        areaName.value = areaInfo.name.split(',').join('-')
        // console.log(areaName.value)
        level.value = data.level
        dataLoading.value = false

    }).catch(err => {
        console.log("获取基本数据失败：" + err)
        ElMessage.error(("获取基本数据失败,"+(err.response?.data?.message||err.response?.data?.msg))||'获取基本数据失败')
        dataLoading.value = false
    })
}


//更换头像,仅作页面展示
//鼠标hover显示修改头像
const changeAvatar = ref(false)
//定义头像数据
const avatarBase64 = ref('')
//上传前校验
const beforeAvatarUpload = (file: any) => {
    if (!file.type.startsWith('image/')) {
        ElMessage.error('请上传图片文件')
        return false
    } else if (file.size / 1024 / 1024 > 5) {
        ElMessage.error('请上传5MB以下的图片文件')
        return false
    }
    return true
}

//上传后显示+保存
const handleAvatar = ({ file }: { file: File }) => {
    // console.log('更换头像')
    // console.log(file)
    try {
        const reader = new FileReader()
        reader.onload = (e) => {
            const Base64 = e.target?.result as string
            // console.log(Base64)
            avatarBase64.value = Base64
            //本地存储
            useUser.user.avatar = avatarBase64.value
            localStorage.setItem('user', JSON.stringify(useUser.user))
            ElMessage.success('头像更换成功')
        }
        reader.readAsDataURL(file)
    } catch (err) {
        ElMessage.error('头像更换失败')
    }
    // console.log(file)
    // updateAvatar(file).then(res => {
    //     console.log(res)
    // })
}


//最近播放列表
const playLoading = ref(false)
const playList = ref<{ id: number, name: string, author: string, album: string, time: number, index: number }[]>([])
const getRecentPlay = (id: number) => {
    if (!id) return
    playLoading.value = true
    getRecentPlayList().then(res => {
        const { data: { data: { list } } } = res
        // console.log(list)
        playList.value = (list.map((item: any, index: number) => {
            return {
                id: item.resourceId,
                name: item.data.name,
                author: item.data.ar.map((item: any) => item.name).join('/'),
                album: item.data.al.name,
                time: item.data.dt,
                index: index + 1
            }
        })).slice(0, 10)
        // console.log(playList.value)
        playLoading.value = false
    })
        .catch(err => {
            console.log("获取最近播放列表失败：" + err)
            ElMessage.error(("获取最近播放列表失败,"+(err.response?.data?.message||err.response?.data?.msg))||'获取最近播放列表失败')
            playLoading.value = false
        })

}




//定义歌单数据
const myMusic = ref<{ id: number, name: string, cover: string, count: number, updateTime: number, privacy: number }[]>([])
const otherMusic = ref<{ id: number, name: string, cover: string, count: number }[]>([])
//获取歌单
const getMusic = (id: number) => {
    if (!id) return
    musicLoading.value = true
    getMyMusic(id).then(res => {
        const { data: { playlist } } = res
        // console.log(playlist)
        //创建的歌单
        myMusic.value = playlist.filter((item: any) => item.subscribed === false || item.subscribed === null).map((item: any) => {
            return {
                id: item.id,
                name: item.name,
                cover: item.coverImgUrl,
                count: item.playCount,
                updateTime: item.updateTime,
                privacy: item.privacy
            }
        })
        //按照时间排序（越新越前<降序>）
        myMusic.value = myMusic.value.sort((a: any, b: any) => {
            return b.updateTime - a.updateTime
        })
        // console.log(myMusic.value)


        //收藏的歌单
        otherMusic.value = playlist.filter((item: any) => item.subscribed === true).map((item: any) => {
            return {
                id: item.id,
                name: item.name,
                cover: item.coverImgUrl,
                count: item.playCount
            }
        })
        // console.log(otherMusic.value)
        musicLoading.value = false
    })
        .catch(err => {
            console.log("获取歌单失败：" + err)
            ElMessage.error(("获取歌单失败,"+(err.response?.data?.message||err.response?.data?.msg))||'获取歌单失败')
            musicLoading.value = false
        })
}
//进入我的歌单
const handleMyPlay = (id: number) => {
    router.push({
        path: '/myMusicList',
        query: {
            id
        }
    })
}
//进入收藏的歌单
const handlePlay = (id: number) => {
    router.push({
        path: '/musicList',
        query: {
            id
        }
    })
}



//修改个人资料
const handleData = () => {
    router.push('/editData')
}

//进入粉丝列表
const handleFollowed = () => {
    router.push({
        path: '/followedList',
        query: {
            id: useUser.user.id
        }
    })
}
//进入关注列表
const handleFollows = () => {
    router.push({
        path: '/followsList',
        query: {
            id: useUser.user.id
        }
    })
}



//新建歌单数据
const listForm = ref({
    name: '',
    privacy: false,
})

//校验
const rule = reactive({
    name: [
        { required: true, message: '请输入歌单名称', trigger: 'blur' },
        { min: 0, max: 20, message: '歌单名称长度必须在0到20之间', trigger: 'blur' },
    ],
})
//弹窗
const drawerVisible = ref(false)
//按钮加载
const loadingAdd = ref(false)
//新建歌单
const handleAdd = () => {
    //清空表单
    listForm.value.name = ''
    listForm.value.privacy = false
    drawerVisible.value = true
}

const handleCreate = () => {
    // console.log(listForm.value)
    loadingAdd.value = true
    if (!listForm.value.name) {
        ElMessage.error('请输入歌单名称')
        loadingAdd.value = false
        return
    }
    if (listForm.value.privacy) {
        createPlaylist({
            name: listForm.value.name,
            privacy: 10
        }).then(res => {
            const { data: { playlist } } = res
            // console.log(playlist)
            myMusic.value.unshift({
                id: playlist.id,
                name: playlist.name,
                cover: playlist.coverImgUrl,
                count: playlist.playCount,
                updateTime: 0,
                privacy: playlist.privacy
            })
            // console.log(myMusic.value)
            drawerVisible.value = false
            loadingAdd.value = false
        })
            .catch(err => {
                ElMessage.error(("创建歌单失败,"+(err.response?.data?.message||err.response?.data?.msg))||'创建歌单失败')
                console.log('创建歌单失败：' + err)
                drawerVisible.value = false
                loadingAdd.value = false
            })
    } else {
        createPlaylist({
            name: listForm.value.name,
            privacy: 0
        }).then(res => {
            const { data: { playlist } } = res
            myMusic.value.unshift({
                id: playlist.id,
                name: playlist.name,
                cover: playlist.coverImgUrl,
                count: playlist.playCount,
                updateTime: 0,
                privacy: playlist.privacy
            })
            console.log(myMusic.value)
            drawerVisible.value = false
            loadingAdd.value = false
        })
            .catch(err => {
                ElMessage.error(("创建歌单失败,"+(err.response?.data?.message||err.response?.data?.msg))||'创建歌单失败')
                console.log('创建歌单失败：' + err)
                drawerVisible.value = false
                loadingAdd.value = false
            })
    }
}
onMounted(() => {
    if (!useUser.isLogin) {
        router.push('/')
    } else {
        getBasic(useUser.user.id)
        getMusic(useUser.user.id)
        useUser.initUser()
        getRecentPlay(useUser.user.id)
        // console.log(useUser.user)
    }

})
</script>

<style scoped>
.self-page {
    min-height: calc(100vh - 90px);
    box-sizing: border-box;
}

.self-inner {
    width: 980px;
    max-width: 1200px;
    margin: 0 auto;
    background-color: #fff;
    border: 1px solid #e5e5e5;
}

.self-box {
    padding: 20px
}

.self-data {
    display: flex;
    padding: 30px;

}

.avatar-placeholeder {
    width: 200px;
    height: 200px;
    border-radius: 4px;
    background: #f5f5f5;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 14px;
    border: 1px solid #999;
    padding: 10px;

}

.yes-avatar {
    width: 100%;
    height: 100%;
    position: relative;
}

.yes-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.change-avatar {
    width: 111%;
    height: 30%;
    position: absolute;
    bottom: -11px;
    right: -11px;
    font-size: 17px;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 5px 10px;
    cursor: pointer;
    text-align: center;
    border: none;
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
    transform: translateY(10%);
    opacity: 0;
}

/* 用户信息框 */
.user-info {
    flex: 1;
    margin-left: 40px;
}

.name {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.name span {
    font-size: 24px;
    font-weight: 600;
    color: #333;
}


.like-box {
    display: flex;
    gap: 50px;

}

.item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
}

.notes-number {
    font-size: 24px;
    font-weight: 600;
    color: #333;
}

.item-name {
    margin-top: -20px;
    font-size: 14px;
    color: #999;
}

.fans {
    margin-top: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.fans-name {
    /* margin-top: 10px; */
    margin-top: 3px;
    font-size: 14px;
    color: #999;
}

.place {
    font-size: 14px;
    color: #999;
    margin-bottom: 10px;
}

/* 最近播放列表 */
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

/* 我的歌单 */
.mycollection {
    padding: 0 30px;
}

.title {
    font-size: 24px;
    font-weight: 500;
    color: #333;
    margin-bottom: -5px;
}

.line {
    width: 100%;
    height: 1px;
    background-color: red;
}

.collection-list {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 90px;
}

.collection-item {
    margin-left: -50px;
    cursor: pointer;
}

/* 新建我的歌单 */
.collection-add {
    width: 180px;
    height: 180px;
    background-color: #f5f5f5;
    text-align: center;
    line-height: 220px;
    cursor: pointer;
    border-radius: 4px;
}

.item-cover {
    width: 180px;
    height: 180px;
    border-radius: 4px;
    overflow: hidden;
    background: #eee;
    flex-shrink: 0;
    cursor: pointer;
}

.item-cover img {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    object-fit: cover;
    display: block;
    transition: all 0.3s ease-in-out;
}

.item-cover:hover img {
    transform: scale(1.1);
}

.name-container {
    display: flex;
    align-items: center;
    gap: 8px
}

.collection-name {
    max-width: 180px;
    font-size: 14px;
    color: #333;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

.collection-count {
    font-size: 13px;
    color: #777;
    margin-top: -10px
}

.tip {
    margin-top: 16px;
    font-size: 14px;
    color: #777;
}

.back-btn {
    margin: 30px 0 0 30px;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    font-size: 20px
}

.back-text {
    font-size: 15px;
    color: #fff;
}
</style>