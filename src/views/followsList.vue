<template>
    <!-- 关注列表 -->
    <div class="follows-page">
        <div class="follows-inner">
            <div class="back-btn" @click="router.back()">
                <el-icon>
                    <ArrowLeft />
                </el-icon>
                <span>返回</span>
            </div>
            <h1 class="title">关注列表</h1>
            <div class="tip" v-if="follows.length === 0">
                <el-icon size="200">
                    <Box />
                </el-icon>
                <p>暂无关注</p>
                <span>关注你喜欢的用户和歌手到这里</span>
            </div>
            <ul class="follows-list" v-else>
                <li v-for="item in follows" :key="item.id" class="follows-item">
                    <div class="avatar">
                        <img :src="item.avatar" :title="item.name">
                    </div>
                    <div class="info">
                        <p class="name">{{ item.name }}</p>
                        <p class="signature">{{ item.signature }}</p>
                    </div>
                    <div class="follow-btn"  @click="handleFollow(item)">
                        {{ item.followed ? '取消关注' : '关注' }}
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts" name="followsList">
import {computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { followArtist } from '@/api/api'
import { useFollowStore } from '@/stores/follow'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.query.id)
const followStore = useFollowStore()
const { follows } = storeToRefs(followStore)   //数据需要用storeTorefs包裹，保持响应式
const { getFollows } = followStore   //方法不用


//关注/取消关注
const handleFollow = (item: any) => {
    if (item.followed) {
        //一开始就关注了，问是否取消关注
        ElMessageBox.confirm(
            `确定取消关注${item.name}吗？`,
            '提示',
            {
                confirmButtonText: '继续关注',
                cancelButtonText: '仍然取消',
                type: 'warning',
                closeOnClickModal:false,
                closeOnPressEscape:false,
                showClose:false
            }
        )
            .then(() => {
                //继续关注，不需要调用接口
                item.followed = true
                ElMessage({
                    type: 'success',
                    message: '继续关注成功',
                })
            })
            .catch(() => {
                followArtist(item.id, 0).then(res => {
                    //刷新页面，更新关注列表
                    getFollows(Number(id.value))
                    ElMessage.success("取消关注成功")
                })
                    .catch(err => {
                        ElMessage.error("取消关注失败")
                        console.log("取消关注失败了", err)
                        item.followed = true
                    })
            })
    }
}
onMounted(async () => {
    await getFollows(Number(id.value))
    console.log(follows.value)   //得到了关注列表

})
</script>

<style scoped>
.follows-page {
    background: #f5f5f7;

    min-height: 100vh;
    display: flex;
    justify-content: center;
    padding: 24px 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
}

.follows-inner {
    max-width: 1200px;
    width: 100%;
    background-color: #ffffff;
    border-radius: 24px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.02), 0 2px 6px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

/* 标题区 */
.title {
    font-size: 20px;
    font-weight: 600;
    color: #1f2e3d;
    letter-spacing: -0.3px;
    padding: 20px 20px 12px 20px;
    margin: 0;
    border-bottom: 0.5px solid #efeff4;
    display: flex;
    align-items: center;
    gap: 8px;
}

/* 粉丝列表 */
.follows-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

/* 单个粉丝条目 */
.follows-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 20px;
    border-bottom: 0.5px solid #f0f0f2;
    transition: background-color 0.2s ease;
}

.follows-list .follows-item:nth-child(odd) {
    background-color: #f0f2f8;
}

.follows-list .follows-item:hover {
    background-color: #f9f9fb;
}

.follows-item:last-child {
    border-bottom: none;
}

.avatar {
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #e8e8ed;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: transform 0.2s ease;
}

.avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}


.follows-item:hover .avatar {
    transform: scale(1.1);
}

/* 右侧信息区 */
.info {
    flex: 1;
    min-width: 0;
    /* 防止文字溢出 */
}

/* 粉丝昵称 */
.name {
    font-size: 16px;
    font-weight: 600;
    color: #1c1e24;
    line-height: 1.35;
    margin: 0 0 6px 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
}

.signature {
    font-size: 12.5px;
    color: #8a8a8f;
    line-height: 1.4;
    margin: 0;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
}


.follows-item .follow-btn {
    background: transparent;
    border: 0.8px solid #d9d9dc;
    border-radius: 40px;
    padding: 6px 16px;
    font-size: 13px;
    font-weight: 500;
    color: #3e3e44;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: #ffffff;

}

.follows-item .follow-btn:hover {
    background-color: #ff7b72;
    border-color: #ff7b72;
    color: white;
    transform: scale(0.96);
    box-shadow: 0 2px 6px rgba(255, 76, 48, 0.2);
}

/* 返回按钮样式 — 网易云风格 */
.back-btn {
    background: transparent;
    border: none;
    font-size: 16px;
    font-weight: 500;
    color: #3e3e44;
    padding: 8px 12px 8px 8px;
    margin: 10px 20px;
    cursor: pointer;
    border-radius: 40px;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: inherit;
    letter-spacing: 0.3px;
}

/* 返回按钮 hover 效果 */
.back-btn:hover {
    background-color: #f2f2f6;
    color: #ff5e4a;
    transform: translateX(-2px);
}

/* 暂无关注提示 */
.tip {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 0;
    color: #8a8a8f;
    font-size: 14px;
    gap: 10px;
}

.tip p {
    font-size: 24px;
    font-weight: 600;
    color: #1c1e24;
}
</style>