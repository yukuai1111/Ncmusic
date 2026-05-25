import { createRouter, createWebHistory } from 'vue-router'
import musicHub from '@/views/musicHub.vue'
import myMusic from '@/views/myMusic.vue'
import login from '@/views/login.vue'
import player from '@/views/player.vue'
import search from '@/views/search.vue'
import musicList from '@/views/musicList.vue'
import selfCenter from '@/views/selfCenter.vue'
import myMusicList from '@/views/myMusicList.vue'
import editData from '@/views/editData.vue'
import singerData from '@/views/singerData.vue'
import hotSongs from '@/views/hotSongs.vue'
import songAlbum from '@/views/songAlbum.vue'
import songMv from '@/views/songMv.vue'
import albumList from '@/views/albumList.vue'
import mvDetails from '@/views/mvDetails.vue'
import singerDesc from '@/views/singerDesc.vue'
import followsList from '@/views/followsList.vue'
import followedList from '@/views/followedList.vue'
import songComment from '@/views/songComment.vue'
import noFound from '@/views/noFound.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  //路由配置
  routes: [
    {
      path: '/',
      name: 'musicHub',
      component: musicHub
    },
    {
      path: '/myMusic',
      name: 'myMusic',
      component: myMusic
    },
    {
      path: '/login',
      name: 'login',
      component: login
    },
    {
      path: '/player',
      name: 'player',
      component: player
    },
    {
      path: '/search',
      name: 'search',
      component: search
    },
    {
      path: '/musicList',
      name: 'musicList',
      component: musicList
    },
    {
      path: '/selfCenter',
      name: 'selfCenter',
      component: selfCenter
    },
    {
      // 我的歌单的音乐列表
      path: '/myMusicList',
      name: 'myMusicList',
      component: myMusicList
    },
    {
      path: '/editData',
      name: 'editData',
      component: editData
    },
    {
      redirect: '/singerData/hotSongs',
      path: '/singerData',
      name: 'singerData',
      component: singerData,
      children: [
        {
          path: 'hotSongs',
          name: 'hotSongs',
          component: hotSongs
        },
        {
          path: 'songAlbum',
          name: 'songAlbum',
          component: songAlbum
        },
        {
          path: 'songMv',
          name: 'songMv',
          component: songMv
        },
        {
          path: 'singerDesc',
          name: 'singerDesc',
          component: singerDesc
        }
      ]
    },
    {
      path: '/albumList',
      name: 'albumList',
      component: albumList
    },
    {
      path: '/mvDetails',
      name: 'mvDetails',
      component: mvDetails
    },
    {
      path: '/followsList',
      name: 'followsList',
      component: followsList
    },
    {
      path: '/followedList',
      name: 'followedList',
      component: followedList
    },
    {
      path: '/songComment',
      name: 'songComment',
      component: songComment
    },
    {
      path: '/noFound',
      name: 'noFound',
      component: noFound
    }
  ],
})

export default router

//路由守卫
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/users'
router.beforeEach((to, from) => {
  const useUser = useUserStore()   //要再路由准备好后才获取到pinia里的状态管理
  if (useUser.isLogin) {
    //登录
    if (to.path.startsWith('/login')) {
      ElMessage.warning('您已登录，无需重复登录')
      return '/'
    }
   if(to.matched.length===0){
    //跳转的页面再路由中不存在
    ElMessage.warning('不存在该页面')
    return '/noFound'
   }
   return true
  }
  //未登录
  else{
    if(to.path.startsWith('/selfCenter')||to.path.startsWith('/songComment')){
      ElMessage.warning('您未登录，无法访问该页面')
      return '/'
    }
    if(to.matched.length===0){
      ElMessage.warning('不存在该页面')
      return '/noFound'
    }
    return true
  }
})
