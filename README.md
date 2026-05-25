# 网易云音乐 Web App

基于 Vue3 开发的移动端音乐网页，实现登录、播放器、个人中心、歌手详情、评论互动等功能。

## 运行项目

### 1. 启动后端接口（必须）

本项目依赖后端 API 服务，请根据以下仓库的 README 说明启动：

- [NeteaseCloudMusicApiEnhanced/api-enhanced](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced.git)


### 2. 启动前端

```bash
git clone https://github.com/yukuai111/NCmusic.git
cd NCmusic/front
pnpm install
pnpm dev
```

### 3. 主要功能

- **首页**：推荐音乐、推荐歌单、歌手列表、搜索功能
- **歌手详情**：歌手信息、热门歌曲、专辑列表、MV列表、相似歌手
- **登录**：扫码登录
- **个人中心**：头像上传、修改昵称/性别/生日/地址、近期播放、我创建的歌单、我收藏的歌单
- **音乐播放器**：播放/暂停、进度条拖动、歌词滚动同步
- **互动**：发表评论、点赞/取消点赞评论，点赞/取消点赞歌曲
- **粉丝/关注**：查看粉丝/关注列表
- **歌单**：创建/删除/编辑/收藏歌单

### 4.技术栈
- TypeScript
- Vue 3
- Vue Router
- Pinia（仅存储用户信息和关注/粉丝）
- Axios
- Element Plus
- Vite
- pnpm
- 原生 Audio API（播放音乐）