<template>
    <div class="edit">
        <div class="edit-inner">
            <el-form :model="ruleForm" label-width="auto" style="max-width: 80%" :rules="rules">
                <el-form-item label="ID" class="edit-item" label-position="left" prop="id">
                    <el-input disabled :value="useUser.user.id" />
                </el-form-item>

                <el-form-item label="昵称" class="edit-item" label-position="left" prop="nickname">
                    <el-input v-model="ruleForm.nickname" />
                    <div class="candidate-nickname" v-if="candidateNicknames.length !== 0">
                        <h3 style="margin:10x 0 0 20px">推荐昵称：</h3>
                        <div v-for="item in candidateNicknames" :key="item" class="nickname-item"
                            @click="handleNickName(item)">{{ item }}</div>
                    </div>
                </el-form-item>

                <el-form-item label="性别" class="edit-item" label-position="left" prop="gender">
                    <el-select v-model="ruleForm.gender" placeholder="请选择性别">
                        <el-option label="保密" value="0" />
                        <el-option label="男" value="1" />
                        <el-option label="女" value="2" />
                    </el-select>
                </el-form-item>

                <el-form-item label="村龄" class="edit-item" label-position="left" prop="age">
                    <el-input disabled :value="ruleForm.age" />
                </el-form-item>

                <el-form-item label="等级" class="edit-item" label-position="left" prop="level">
                    <el-input disabled :value="ruleForm.level" />
                </el-form-item>

                <el-form-item label="出生日期" class="edit-item" label-position="left" prop="birthday">
                    <el-date-picker v-model="ruleForm.birthday" style="width:100%" format="YYYY-MM-DD" />
                </el-form-item>

                <el-form-item label="省份" class="edit-item" label-position="left" prop="province">
                    <el-select v-model="ruleForm.province" placeholder="请选择省份"
                        @change="provinceChange(ruleForm.province)">
                        <el-option v-for="item in provinces" :key="item.value" :value="item.value"
                            :label="item.label" />
                    </el-select>
                </el-form-item>
                
                <el-form-item label="城市" class="edit-item" label-position="left" prop="city">
                    <el-select v-model="ruleForm.city" placeholder="请选择城市" :disabled="!ruleForm.province">
                        <el-option v-for="item in cities" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>

                <el-form-item label="简介" class="edit-item" label-position="left" prop="signature">
                    <el-input v-model="ruleForm.signature" type="textarea" />
                </el-form-item>

                <el-form-item class="edit-item">
                    <el-button type="primary" @click="handleSubmit">修改</el-button>
                    <el-button @click="handleClose">取消</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts" name="editData">
import { onMounted, reactive, ref } from 'vue'
import { getBasicData, updateUserInfo, checkNickname } from '@/api/api'
import { useUserStore } from '@/stores/users.ts'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { provinceAndCityData } from 'element-china-area-data'
const router = useRouter()
const useUser = useUserStore()

// gender: 性别 0:保密 1:男性 2:女性

// birthday: 出生日期,时间戳 unix timestamp

// nickname: 用户昵称

// province: 省份id

// city: 城市id

// signature：用户签名

//表单数据
const ruleForm = reactive({
    id: useUser.user.id,
    nickname: '',
    gender: '',
    birthday: 0,
    province: '',
    city: '',
    signature: '',
    level: 0,
    age: 0,
})
//定义所有省份和城市
const provinces = ref<{ label: string, value: string }[]>([])
const cities = ref<any>([])

//获取基本数据
const getBasic = (id: number) => {
    if (!id) return
    getBasicData(id).then(async res => {
        const data = res.data
        // console.log(data)
        ruleForm.nickname = data.profile.nickname || ''
        ruleForm.gender = data.profile.gender === 0 ? '保密' : (data.profile.gender === 1 ? '男' : '女')
        ruleForm.birthday = data.profile.birthday

        //省份·城市
        ruleForm.province = String(data.profile.province) || ''
        provinceChange(ruleForm.province)
        ruleForm.city = String(data.profile.city) || ''

        //村龄
        const createTime = data.profile.createTime    //时间戳
        ruleForm.age = new Date(Date.now()).getFullYear() - new Date(createTime).getFullYear()

        ruleForm.level = data.level
        ruleForm.signature = data.profile.signature || ''
    }).catch(err => {
        console.log("获取基本数据失败：" + err)
        ElMessage.error("获取基本数据失败")

    })
}

//校验表单
const rules = reactive({
    nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
    ],
    gender: [
        { required: true, message: '请选择性别', trigger: 'change' },
    ],
    birthday: [
        { required: true, message: '请选择生日', trigger: 'change' },
    ],
    province: [
        { required: true, message: '请选择省份', trigger: 'change' },
    ],
    city: [
        { required: true, message: '请选择城市', trigger: 'change' },
    ],

})

//定义候选名字数据
const candidateNicknames = ref<string[]>([])
//完成修改
const handleSubmit = () => {
    if (!ruleForm.nickname) {
        ElMessage.error("请输入昵称")
        return
    } else {
        //判断有没有重复
        console.log(ruleForm.nickname)
        checkNickname(ruleForm.nickname).then(res => {
            console.log(res)
            console.log(res.data.candidateNicknames)   //备用名字
            if (res.data.duplicated) {
                candidateNicknames.value = res.data.candidateNicknames
                ElMessage.error("昵称已存在")
                return
            } else {
                //没有重复，继续校验
                if (!ruleForm.province) {
                    ElMessage.error("请选择省份")
                    return
                }
                if (!ruleForm.city) {
                    ElMessage.error("请选择城市")
                    return
                }
                if (!ruleForm.signature) {
                    ruleForm.signature = ''
                }
                if (!ruleForm.gender) {
                    ElMessage.error("请选择性别")
                    return
                }
                if (!ruleForm.birthday) {
                    ElMessage.error("请选择生日")
                    return
                }
                // console.log(new Date(ruleForm.birthday).getTime())
                if (new Date(ruleForm.birthday).getTime() > Date.now()) {
                    ElMessage.error("请选择正确的出生日期")
                    return
                }
                ruleForm.birthday = new Date(ruleForm.birthday).getTime()
                if (ruleForm.gender === '保密') {
                    ruleForm.gender = "0"
                }
                else if (ruleForm.gender === '男') {
                    ruleForm.gender = "1"
                }
                else if (ruleForm.gender === '女') {
                    ruleForm.gender = "2"
                }
                // console.log(ruleForm.gender)
                console.log(ruleForm)
                updateUserInfo(ruleForm).then(res => {
                    const data = res.data
                    // console.log(data)
                    if (data.code === 200) {
                        console.log('更新')
                        useUser.setUser({
                            id: useUser.user.id || '',
                            name: ruleForm.nickname,
                            avatar: useUser.user.avatar || '',
                        })
                        ElMessage.success("更新成功")
                        router.push('/selfCenter')
                    }
                    else {
                        ElMessage.error("更新失败")
                    }
                })
                    .catch(err => {
                        console.log("更新用户信息失败：" + err)
                        ElMessage.error("更新用户信息失败")
                    })
            }
        })
    }

}

//关闭修改
const handleClose = () => {
    router.push('/selfCenter')
}


//省份变化时，修改城市
const provinceChange = (code: string) => {
    //清空城市
    ruleForm.city = ''
    // console.log(code.slice(0, 2))  //省份的编码
    const filterProvince: any = provinceAndCityData.filter((item: any) => item.value === code.slice(0, 2))[0]
    if (!filterProvince) {
        ElMessage.error("请选择正确的省份")
        return
    }
    // console.log(filterProvince.children) //省份对应的城市
    cities.value = filterProvince.children.map((item: any) => {
        return {
            label: item.label,
            value: item.value + "00"
        }
    })
    // console.log(cities.value)
}

//点击备用名字
const handleNickName = (item: string) => {
    ruleForm.nickname = item
    candidateNicknames.value = []
    console.log(ruleForm)
}
onMounted(() => {
    if (useUser.isLogin && useUser.user.id) {
        getBasic(useUser.user.id)
        // console.log(provinceAndCityData)  //所有省份+城市
        provinces.value = provinceAndCityData.map((item: any) => {
            return {
                label: item.label,   //省的名字
                value: item.value + '0000'    //省的id
            }
        })
    }
    // console.log(provinces.value)  //所有省份+编码
})
</script>

<style scoped>
.edit {
    min-height: calc(100vh - 90px);
    box-sizing: border-box;
}

.edit-inner {
    width: 980px;
    max-width: 1200px;
    margin: 0 auto;
    background-color: #fff;
    border: 1px solid #e5e5e5;

}

.edit-item {
    margin: 50px 100px;
}

/* 名字候选 */
.candidate-nickname {
    top: 100%;
    /* 紧贴输入框下方 */
    left: 0;
    right: 0;
    margin-top: 4px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #ebeef5;
    max-height: 240px;
    overflow-y: auto;
    z-index: 1000;
    animation: fadeIn 0.15s ease-out;
    width: 100%
}

.nickname-item {
    padding: 10px 20px;
    cursor: pointer;
}

.nickname-item:hover {
    background-color: #f5f7fa;
}
</style>