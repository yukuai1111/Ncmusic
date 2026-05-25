<template>
    <div class="song-comments">
        <div class="comments-header">
            <div class="left" @click="router.back()">
                <el-icon size="20">
                    <ArrowLeft />
                </el-icon>
                <span class="title">评论</span>
            </div>
            <div class="sort-buttons">
                <el-radio-group @change="handleSort" v-model="sort">
                    <el-radio-button label="最热" value="1" />
                    <el-radio-button label="最新" value="2" />
                </el-radio-group>
            </div>
        </div>

        <!-- 评论列表 -->
        <div class="comments-list">
            <div v-if="commentList.length === 0" class="tip">暂无评论</div>
            <div class="tip" v-else-if="loading">加载中...</div>
            <div v-for="comment in commentList" :key="comment.commentId" class="comment-item" v-else>
                <img class="avatar" :src="comment.userAvatar" alt="" />
                <div class="comment-content">
                    <div class="nickname">{{ comment.userName }}</div>
                    <div class="text">{{ comment.content }}</div>
                    <div class="meta">
                        <span class="time">{{ dayjs(comment.time).format('YYYY-MM-DD HH:mm:ss') }}</span>
                        <div class="actions">
                            <span class="action-btn">
                                <span style="font-size:20px" @click="handleLike(comment)">{{ comment.liked ? '❤' : '♡'
                                }}</span>
                                <span>{{ comment.like }}</span>
                            </span>
                            <span class="action-btn">
                                <span v-if="comment.userId === userStore.user.id"
                                    @click="handleDelete(comment.commentId)">
                                    <el-icon size="17">
                                        <Delete />
                                    </el-icon></span>
                            </span> 
                        </div>
                    </div>
                </div>
            </div>
            <el-pagination layout="prev, pager, next" :total="total" v-model:current-page="currentPage"
                @change="handlePage" class="page-btn" />
        </div>

        <!-- 底部评论输入区 -->
        <div class="comment-input-wrapper">
            <textarea v-model="newComment" rows="2" placeholder="分享你的感受..." maxlength="200"></textarea>
            <div class="action-buttons">
                <el-button type="primary" :loading="loading" class="send-btn" @click="handleSend"
                    :disabled="newComment.trim().length === 0" @keyup.enter="handleSend">发送评论</el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" name="songComment">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getComment, likeComment, sendComment, deleteComment } from '@/api/api'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/users'
const route = useRoute()
const router = useRouter()
const routeId = computed(() => Number(route.query.id))
const userStore = useUserStore()
//评论加载中
const loading = ref(false)

//总数据
const total = ref(0)
//原有评论数据
const commentList = ref<{
    commentId: number,
    userId: number,
    userAvatar: string,
    userName: string,
    content: string,
    time: string,
    like: number | string,
    liked: boolean,
}[]>([])

//当前页码
const currentPage = ref(1)
//每页显示数量
const pageSize = 10
//获取评论
const getCommentList = (id: number) => {
    if (!id) return
    // console.log(currentPage.value)
    loading.value = true
    getComment(id, 100).then(res => {
        // console.log(res)
        const { data: { hotComments } } = res
        const { data: { comments } } = res
        total.value = hotComments.length + comments.length
        // console.log(hotComments)
        commentList.value = hotComments.map((item: any) => {
            return {
                commentId: item.commentId,
                userId: item.user.userId,
                userAvatar: item.user.avatarUrl,
                userName: item.user.nickname,
                content: item.content,
                time: item.time,
                like: item.likedCount,
                liked: item.liked,
            }
        })
        commentList.value.push(...comments.map((item: any) => {
            return {
                commentId: item.commentId,
                userId: item.user.userId,
                userAvatar: item.user.avatarUrl,
                userName: item.user.nickname,
                content: item.content,
                time: item.time,
                like: item.likedCount,
                liked: item.liked,
            }
        }))
        // console.log(sort.value)
        commentList.value.forEach((item: any) => {
            if (item.like >= 10000) {
                item.like = (item.like / 10000).toFixed(2) + '万'
            }
        })

        if (sort.value === '1') {
            // //按点赞排序
            commentList.value = commentList.value.sort((a: any, b: any) => {
                return Number(b.like) - Number(a.like)
            })

            //截取当前页的条数
            const start = (currentPage.value - 1) * pageSize
            const end = start + pageSize
            commentList.value = commentList.value.slice(start, end)
            loading.value = false
            // console.log(commentList.value, total.value)
        } else {
            // //按时间排序
            commentList.value = commentList.value.sort((a: any, b: any) => {
                return b.time - a.time
            })

            //截取当前页的条数
            const start = (currentPage.value - 1) * pageSize
            const end = start + pageSize
            commentList.value = commentList.value.slice(start, end)
            loading.value = false
            // console.log(commentList.value, total.value)
        }

    })
        .catch(err => {
            ElMessage.error('获取评论失败')
            console.log('获取评论失败' + err)
            commentList.value = []
            loading.value = false
        })
}

//分页
const handlePage = () => {
    getCommentList(routeId.value)
}

//排序方式
const sort = ref('1')
//切换排序
const handleSort = (id: number) => {
    if (!id) return
    // console.log(routeId.value)
    if (sort.value === '2') {
        currentPage.value = 1
        getCommentList(routeId.value)
    } else {
        currentPage.value = 1
        getCommentList(routeId.value)
    }
}

//点赞/取消点赞评论
const handleLike = (comment: { commentId: number, liked: boolean, like: number | string }) => {
    // console.log('点赞评论:', comment.commentId, comment.liked)
    if (comment.liked === false) {
        //点赞
        likeComment(routeId.value, comment.commentId, '1', 0).then(res => {
            // console.log(res)
            if (res.data.code === 200) {
                comment.liked = !comment.liked
                if (typeof comment.like === 'number') {
                    //数字直接+1
                    comment.like = comment.like + 1
                } else {
                    //字符串要转换成数字，再+1
                    comment.like = (((Number(comment.like.slice(0, -1)) * 10000) + 1) / 10000).toFixed(2) + '万'   //用slice把“万”去掉，然后乘上10000，在+1，最后再化成xxx"万"
                }
            }
        })
    }
    else {
        // console.log(comment.like)
        //取消点赞
        likeComment(routeId.value, comment.commentId, '0', 0).then(res => {
            // console.log(res)
            if (res.data.code === 200) {
                comment.liked = !comment.liked
                if (typeof comment.like === 'number') {
                    //数字直接-1
                    comment.like = comment.like - 1
                } else {
                    //字符串要转换成数字，再-1
                    comment.like = (((Number(comment.like.slice(0, -1)) * 10000) - 1) / 10000).toFixed(2) + '万'   //用slice把“万”去掉，然后乘上10000，在-1，最后再化成xxx"万"
                }
            }
        })
    }
}

//输入的新评论
const newComment = ref('')
//发送评论
const handleSend = () => {
    if (newComment.value.trim().length === 0) return
    console.log(newComment.value.trim())
    sendComment(routeId.value, newComment.value.trim()).then(res => {
        // console.log(res)
        if (res.data.code === 200) {
            ElMessage.success('评论成功')
            newComment.value = ''
            sort.value = '2'
            currentPage.value = 1
            getCommentList(routeId.value)
        }
    })
}
//删除评论
const handleDelete = (commentId: number) => {
    console.log(commentId)
    deleteComment(routeId.value, commentId).then(res => {
        console.log(res)
        if (res.data.code === 200) {
            ElMessage.success('删除成功')
            sort.value = '2'
            getCommentList(routeId.value)
        }
    })
}
onMounted(() => {
    // console.log(id.value)
    getCommentList(routeId.value)
})
</script>

<style scoped>
/* 样式与 Element Plus 解耦，原生实现 */
.song-comments {
    background: #fff;
    border-radius: 16px;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    max-width: 1200px;
    margin: 0 auto;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.comments-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f2f5;
    margin-bottom: 16px;
}

.left {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    cursor: pointer;
}

.title {
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
}


/* 评论列表 */
.comments-list {
    flex: 1;
    padding-right: 4px;
    margin-bottom: 20px;
}

.comment-item {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    background: #eef2ff;
}

.comment-content {
    flex: 1;
}

.nickname {
    font-size: 14px;
    font-weight: 500;
    color: #475569;
    margin-bottom: 4px;
}

.text {
    font-size: 14px;
    line-height: 1.5;
    color: #1e293b;
    word-break: break-word;
}

.meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
}

.time {
    font-size: 12px;
    color: #94a3b8;
}

.page-btn {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}

.actions {
    display: flex;
    gap: 16px;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
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


/* 底部输入区 */
.comment-input-wrapper {
    margin-top: 12px;
    padding-top: 16px;
    border-top: 1px solid #f0f2f5;
}

.comment-input-wrapper textarea {
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 10px 12px;
    font-size: 14px;
    font-family: inherit;
    transition: border 0.2s;
}

.comment-input-wrapper textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.action-buttons {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
}

.send-btn {
    border: none;
    padding: 8px 20px;
    border-radius: 40px;
    font-size: 14px;
    font-weight: 500;
    cursor: default;
}

.tip {
    margin-top: 16px;
    font-size: 14px;
    color: #777;
}
</style>