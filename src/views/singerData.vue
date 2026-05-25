<template>
  <div class="singer-page">
    <div class="back-btn" @click="router.push('/')">
      <el-icon>
        <ArrowLeft />
      </el-icon>
      返回
    </div>
    <!-- 歌手基本信息 -->
    <div class="singer-data">
      <!-- 头像 -->
      <div class="tip" v-if="coverLoading">歌手图片加载中...</div>
      <div class="singer-cover" v-else>
        <img :src="singer.cover" alt="">
      </div>
      <!-- 简介 -->
      <div class="tip" v-if="dataLoading">歌手信息加载中...</div>
      <div class="singer-text" v-else>
        <div class="title-container">
          <h1 class="title">{{ singer.name }}</h1>
          <!-- 相似歌手下拉菜单 -->
          <el-dropdown placement="bottom" v-if="similarSinger.length !== 0">
            <el-button class="similar-artist-btn">
              <el-icon>
                <Headset />
              </el-icon>
              <span>相似歌手</span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <ul class="similar-list">
                  <li v-for="item in similarSinger" :key="item.id" class="similar-item" @click="handleClick(item.id)">
                    <div class="avatar">
                      <img :src="item.avatar" :title="item.name">
                    </div>
                    <div class="similar-name">{{ item.name }}</div>
                    <div class="similar-fans">粉丝量：{{ item.fans }}万</div>
                  </li>
                </ul>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

        </div>
        <p class="tag" v-if="singer.tag">{{ singer.tag }}</p>
        <div class="tip" v-if="!dataLoading && fansLoading">粉丝量加载中...</div>
        <p class="fans" v-else>粉丝量：{{ singer.fansCnt }}万</p>
        <p class="intro">{{ singer.intro }}</p>
      </div>
    </div>
    <!-- 歌曲列表 -->
    <div class="song-nav" v-if="!coverLoading && !dataLoading">
      <router-link :to="{ path: '/singerData/singerDesc', query: { id } }" class="nav-item active">
        歌手详情
      </router-link>
      <router-link :to="{ path: '/singerData/hotSongs', query: { id } }" class="nav-item">
        热门歌曲50首
      </router-link>
      <router-link :to="{ path: '/singerData/songMv', query: { id } }" class="nav-item">
        MV
      </router-link>
      <router-link :to="{ path: '/singerData/songAlbum', query: { id } }" class="nav-item">
        专辑列表
      </router-link>
    </div>
    <div class="singer-songs">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts" name="SingerData">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getSingerDetail, getSingerFanCount, getSimilarSingers} from '@/api/api'
import { ElMessage } from 'element-plus'
import { useRouter} from 'vue-router'


const router = useRouter()
const route = useRoute()
const id = computed(() => route.query.id)
// console.log(id.value)

//加载中
const coverLoading = ref(false)
const dataLoading = ref(false)
const fansLoading = ref(true)


//歌手数据
const singer = ref<any>({})
//获取歌手详情
const getSinger = (id: number) => {
  if (!id) return
  coverLoading.value = true
  dataLoading.value = true
  getSingerDetail(id).then(res => {
    const { data: { data } } = res
    // console.log(data)
    singer.value = {
      name: data.artist?.name,
      cover: data.artist?.cover,
      intro: data.artist?.briefDesc,
      tag: data.identify?.imageDesc
    }

    coverLoading.value = false
    dataLoading.value = false
    // 确保歌手基本信息加载完成后再获取粉丝量
    getFans(id)
    // 确保歌手基本信息加载完成后再获取相似歌手
    getSimilar(id)
  })
    .catch(err => {
      ElMessage.error("获取歌手详情失败")
      console.log('获取歌手详情失败', err)
      coverLoading.value = false
      dataLoading.value = false
    })
}
//获取粉丝量
const getFans = (id: number) => {
  if (!id) return
  fansLoading.value = true
  getSingerFanCount(id).then(res => {
    const { data: { data } } = res
    // console.log(data.fansCnt)
    singer.value = {
      ...singer.value,
      fansCnt: ((data.fansCnt) / 10000).toFixed(2)
    }
    // console.log(singer.value)
    fansLoading.value = false
  })
    .catch(err => {
      ElMessage.error("获取粉丝量失败")
      console.log('获取粉丝量失败', err)
      fansLoading.value = false
    })
}

//相似歌手数据
const similarSinger = ref<{ id: number, name: string, avatar: string, fans: string }[]>([])
//获取相似歌手
const getSimilar = (id: number) => {
  if (!id) return
  getSimilarSingers(id).then(res => {
    const { data: { artists } } = res
    // console.log(artists)
    similarSinger.value = artists.map((item: any) => {
      return {
        id: item.id,
        name: item.name,
        avatar: item.picUrl,
        fans: ((item.fansCount) / 10000).toFixed(2)
      }
    })
    // console.log(similarSinger.value)
  })
}
//点击获取歌手详情
const handleClick = (id: number) => {
  // console.log(id)
  router.push({
    path: '/singerData',
    query: {
      id: id
    }
  })
}

onMounted(async () => {
  getSinger(Number(id.value))
})

//监视路由参数
watch(() => id.value, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    // console.log(newValue)
    getSinger(Number(newValue))
  }
})

</script>

<style scoped>
.singer-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F0F7FF;
}

.singer-data {
  width: 100%;
  /* height: 50%; */
  /* background-color: pink; */
  display: flex;
  justify-content: space-between;
}

.singer-cover {
  width: 50%;
  height: 600px;
  border-radius: 50%;
  scale: 0.9;
}

.singer-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.singer-text {
  width: 50%;
  height: 500px;
  padding: 20px;
  overflow: auto;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 20px
}

.title {
  margin-top: 20px;
  letter-spacing: 10px;
}


/* 相似歌手按钮 */
.similar-artist-btn {
  gap: 8px;
  padding: 8px 20px;
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
.similar-artist-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%);
}

.similar-artist-btn span {
  font-size: 16px;
}

.tag {
  margin-top: 20px;
  padding: 0 10px;
  color: #E3F2FD;
  font-size: 20px;
  font-weight: 400;
  background-color: #0D47A1;
  height: 50px;
  border-radius: 5px;
  line-height: 50px;
  text-align: center;
}

.fans {
  margin-top: 20px;
  font-size: 20px;
  font-weight: 400;
}

.intro {
  text-indent: 2em;
  font-size: 16px;
  letter-spacing: 2px;
  line-height: 40px;
}

.song-nav {
  margin-top: 70px;
  width: 100%;
  height: 50px;
  display: flex;
  /* background-color: #fff; */
  justify-content: space-evenly;
}

.nav-item {
  text-decoration: none;
  text-align: center;
  font-size: 20px;
  font-weight: 400;
  line-height: 50px;
  width: 200px;
  height: 100%;
  border-radius: 20px;
  background-color: #E0F7FA;
  color: #0F6E7A;
  transition: all 0.3s ease-in-out;
}

.nav-item:hover {
  background-color: #0F6E7A;
  color: #fff;
  transform: scale(1.1);
}

.nav-item.router-link-active {
  background-color: #0F6E7A;
  color: #fff;
}

.singer-songs {
  width: 100%;
  margin-top: 50px;
}


/* 相似歌手 */
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

.avatar {
  width: 160px;
  height: 160px;

}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.similar-name {
  font-size: 20px;
  font-weight: 400;
}

.similar-fans {
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
  font-size: 18px;
  color: #333;
}

.back-btn:hover {
  color: #0F6E7A;
}

.back-btn:hover span {
  color: #0F6E7A;
}
</style>