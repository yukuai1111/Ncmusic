<template>
  <div class="app">
    <el-container class="container">
      <el-header class="nav">
        <div class="nav-inner">
          <div class="logo">
            <a href="#">网易云音乐</a>
          </div>
          <div class="nav-links">
            <router-link to="/" class="nav-link active">音乐馆</router-link>
            <router-link to="/myMusic" class="nav-link">我的音乐</router-link>
          </div>
          <div class="nav-action">
            <!-- 搜索 -->
            <div class="search-box">
              <el-icon ><Search /></el-icon>
              <input type="text" placeholder="搜索歌曲/歌手/专辑" class="search-input" v-model="searchKeyWord"
                @keyup.enter="handleSearch">
            </div>
            <!-- 登录 -->
            <router-link to="/login" class="login-btn" v-if="!useUser.isLogin">登录</router-link>
            <div class="user-menu" v-else>
              <el-dropdown @command="handleCommand">
                <div class="user-avatar">
                  <img :src="useUser.user.avatar?useUser.user.avatar:'https://ts2.tc.mm.bing.net/th/id/OIP-C.xA5QX2crc3fR5d0DIH-oDQAAAA?rs=1&pid=ImgDetMain&o=7&rm=3'" alt="用户头像"></img>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="selfCenter">{{ useUser.user.name }}</el-dropdown-item>
                    <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </el-header>
      <el-main class="main-view">
        <RouterView />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts" name="App">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './stores/users'
import { ElMessageBox, ElMessage } from 'element-plus'
const useUser = useUserStore()

const router = useRouter()
const searchKeyWord = ref('')
const handleSearch = () => {
  const keyWord = searchKeyWord.value.trim()
  if (!keyWord) {
    return
  }
  // console.log(keyWord)
  router.push({
    path: '/search',
    query: {
      keyword: keyWord
    }
  })
  searchKeyWord.value = ''
}

//下拉菜单的事件
const handleCommand = (command: string) => {
  // console.log(command)
  if (command === 'logout') {
    // console.log('退出登录')
    ElMessageBox.confirm(
      '确定退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
      .then(() => {
        ElMessage({
          type: 'success',
          message: '退出登录成功',
        })
        //清除用户信息
        useUser.clearUser()
        router.push('/')
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: '退出登录取消',
        })
      })
  }
  if (command === 'selfCenter') {
    // console.log('个人中心')
    router.push('/selfCenter')
  }
}

onMounted(() => {
  useUser.initUser()
  // console.log(useUser.isLogin)
  // console.log(useUser.user)
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f7fb;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.nav {
  width: 100%;
  height: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #242424;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.nav-inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 32px
}

.logo {
  background: url('./assets/imgs/topbar.png') no-repeat 0 0;
  width: 176px;
  height: 69px;
  background-position: 0 0;
}

.logo a {
  text-indent: -9999px;
  display: block;
  width: 157px;
  height: 100%;
  padding-right: 20px;
}

.nav-links {
  display: flex;
  gap: 24px;
  margin-left: 24px;
}

.nav-link {
  color: #e5e5e5;
  text-decoration: none;
  border-radius: 18px;
  font-size: 16px;
  padding: 8px 16px;
  transition: all 0.2s ease-in-out;
}

.nav-link:hover {
  background-color: #c20c0c;
  color: #fff;
}

.nav-link.router-link-active {
  background-color: #c20c0c;
  color: #fff;
}

.nav-action {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.search-box {
  margin-right: 16px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
}

.search-input {
  width: 180px;
  height: 32px;
  padding: 0 12px;
  border-radius: 16px;
  border: none;
  outline: none;
  background: #fff;
  font-size: 13px;
}

.search-input::placeholder {
  color: #999;
}

.login-btn {
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid #c20c0c;
  color: #c20c0c;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s;
}

.login-btn:hover {
  background: #c20c0c;
  color: #ffffff;
}


.user-menu {
  display: flex;
  align-items: center;
  gap: 12px
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 50%;
}

.user-name {
  font-size: 12px;
  color: #f5f5f5;
}

.main-view {
  flex: 1;
}
</style>
