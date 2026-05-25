<template>
    <div class="desc-list">
        <div class="desc-item">
            <h2 class="title">代表作品</h2>
            <div class="tip" v-if="!singerDesc.works?.length">暂无代表作品</div>
            <div class="tip" v-else-if="workLoading"></div>
            <ul class="works-list" v-else>
                <li v-for="item in singerDesc.works" :key="item">{{ item }}</li>
            </ul>
        </div>

        <div class="desc-item">
            <h2 class="title">主要成就</h2>
            <div class="tip" v-if="!singerDesc.honor?.length">暂无主要成就</div>
            <div class="tip" v-else-if="honorLoading"></div>
            <ul class="achievements-list" v-else>
                <li v-for="item in singerDesc.honor" :key="item">{{ item }}</li>
            </ul>
        </div>

        <div class="desc-item">
            <h2 class="title">演艺经历</h2>
            <div class="tip" v-if="!singerDesc.exprience?.length">暂无演艺经历</div>
            <div class="tip" v-else-if="exprienceLoading"></div>
            <ul class="experience-list" v-else>
                <li v-for="item in singerDesc.exprience" :key="item">{{ item }}</li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts" name="singerDetail">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getSingerDesc } from '@/api/api'

const route = useRoute()
const id = computed(() => route.query.id)
const workLoading = ref(false)
const honorLoading = ref(false)
const exprienceLoading = ref(false)

//歌手描述
const singerDesc = ref<any>({})
const getSingerDescData = (id: number) => {
    if (!id) return
    workLoading.value = true
    honorLoading.value = true
    exprienceLoading.value = true
    getSingerDesc(id).then(res => {
        const data = res.data
        console.log(data)
        singerDesc.value = {
            works: data.introduction.filter((item: any) => item.ti === '代表作品')?.map((item: any) => item.txt)[0]?.
                replace(/●/g, '').   //去掉●
                replace(/。/g, '').   //去掉。
                replace(/\n/g, '、'). //换行符换成、
                split('、')    //分割成数组
                || [],
            honor: data.introduction.filter((item: any) => item.ti === '主要成就')?.map((item: any) => item.txt)[0]?.split('\n') || [],
            exprience: data.introduction.filter((item: any) => item.ti === '演艺经历')?.map((item: any) => item.txt)[0]?.split('\n') || []
        }
        console.log(singerDesc.value)
        workLoading.value = false
        honorLoading.value = false
        exprienceLoading.value = false
    })
}

onMounted(() => {
    getSingerDescData(Number(id.value))
})


</script>

<style scoped>
.desc-list {
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding: 10px 50px;

}

.desc-item {
    display: flex;
    flex-direction: column;
}

.title {
    font-size: 1.8rem;
    font-weight: bolder;
    color: #1f3b4c;
    margin-bottom: 20px;
    border-bottom: 3px solid #e8b86b;
    text-align: center;
}

/* 代表作品列表容器 */
.works-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    list-style: none;
    padding: 0;
    margin: 20px 0 0 0;
}

/* 每个作品项 */
.works-list li {
    background: #f0f3f9;
    color: #1f4c6e;
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
    font-size: 0.95rem;
    font-weight: 500;
    padding: 8px 20px;
    border-radius: 40px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
    cursor: default;
}

.works-list li:hover {
    background: #e8b86b;
    color: #1e2a32;
    transform: translateY(-2px);
    border-color: #d9a34a;
}

/* 主要成就列表容器 */
.achievements-list {
    list-style: none;
    /* 去掉默认圆点 */
    padding: 0;
    margin: 20px 0 0 0;
}

/* 每个成就项 */
.achievements-list li {
    background: transparent;
    color: #2c3f4f;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 1rem;
    font-weight: 450;
    padding: 12px 0 12px 28px;
    border-bottom: 1px dashed #dce5ef;
    position: relative;
}

.achievements-list li::before {
    content: "◆";
    color: #e8b86b;
    font-size: 0.8rem;
    position: absolute;
    left: 4px;
    top: 12px;
}

.achievements-list li:last-child {
    border-bottom: none;
}


/* 演艺经历 */
.experience-list{
  list-style: none;
  padding: 0;
}
.experience-list li {
  background: #faf9ff;
  margin-bottom: 1rem;
  padding: 1rem 1.2rem;
  border-radius: 24px;
  transition: all 0.2s;
  border: 1px solid #edeef2;
}
.experience-list li:hover {
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
  transform: translateX(4px);
}


/* 无数据提示 */
.tip {
    margin-top: 16px;
    font-size: 14px;
    color: #777;
}
</style>