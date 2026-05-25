<template>
    <div class="back-btn" @click="router.back()">
        <el-icon>
            <ArrowLeftBold />
        </el-icon>
        <span class="back-text">返回</span>
    </div>
    <div class="tip" v-if="loading">MV加载中...</div>
    <div class="player-page">
        <video ref="videoRef" :src="mvUrl" autoplay controls muted style="width: 100%;"></video>
    </div>
</template>

<script setup name="MvDetails" lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMvUrl} from '@/api/api'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const id = computed(() => Number(route.query.id))


const loading = ref(false)

const mvUrl = ref('')
const getMv = (id: number) => {
    if (!id) return
    loading.value = true
    getMvUrl(id).then(res => {
        const { data: { data } } = res
        console.log(data.url)
        mvUrl.value = data.url
        loading.value = false
    })
        .catch(err => {
            ElMessage.error("播放MV失败")
            console.log("播放MV失败", err)
            loading.value = false
        })
}

onMounted(() => {
    getMv(id.value)
})
</script>

<style scoped>
.player-page {
    min-height: calc(100vh - 90px);
    /* background: radial-gradient(circle at top left, #2b2b2b, #000); */
    color: #f5f5f5;
    display: flex;
    justify-content: center;
    padding: 25px 0;
    box-sizing: border-box;
}

/* 返回按钮 */
.back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.back-text {
    font-weight: bold;
    font-size: 20px;
}

/* 提示加载中 */
.tip {
    margin-top: 16px;
    font-size: 14px;
    color: #777;
}
</style>