import server from '@/request/request.ts'

//获取推荐歌单
export const getRecommend = (limit:number) => {
    return server.get("/personalized",{params:{limit}})
}

//获取新音乐
export const getNewSongs = (limit:number) => {
    return server.get("/personalized/newsong",{params:{limit}})
}

//获取歌手榜单
export const getSingers = (limit:number) => {
    return server.get("/top/artists",{params:{limit}})
}

//获取歌单详情
export const getMusicDetail = (id:number) => {
    return server.get("/playlist/detail?timestamp=" + Date.now(),{params:{id}})
}

//获取歌曲详情
export const getSongDetail = (ids:number) => {
    return server.get("/song/detail",{params:{ids}})
}

//获取歌词
export const getLyric = (id:number) => {
    return server.get("/lyric",{params:{id}})
}

//获取播放地址
export const getPlayUrl = (id:number) => {
    return server.get("/song/url",{params:{id}})
}

//二维码key获取
export const getQrcodeKey = () => {
    return server.get("/login/qr/key")
}

//二维码图片获取
export const getQrcodeImg = (key:string,timestamp:number,qrimg:boolean,ua:string) => {
    return server.get("/login/qr/create",{params:{key,timestamp,qrimg,ua}})
}

//二维码状态
export const getQrcodeStatus = (key:string,timestamp:number) => {
    return server.get("/login/qr/check",{params:{key,timestamp}})
}

//获取登录状态
export const getLoginStatus = () => {
    return server.get("/login/status")
}

//获取我的音乐里的歌单(创建的和收藏的)
export const getMyMusic=(uid:number)=>{
    return server.get("/user/playlist?timestamp=" + Date.now(),{params:{uid}})
}

//搜索
export const getSearch=(keywords:string,limit:number)=>{
    return server.get("/cloudsearch",{params:{keywords,limit}})
}

//获取基本数据
export const getBasicData=(uid:number)=>{
    return server.get("/user/detail?" + Date.now(),{params:{uid}})
}

//获取最近播放的歌曲
export const getRecentPlayList=()=>{
    return server.get("/record/recent/song")
}

//判断名称是否重复
export const checkNickname=(nickname:string)=>{
    return server.get("/nickname/check",{params:{nickname}})
}
//更新用户信息
export const updateUserInfo=(data:any)=>{
    return server.post("/user/update" ,data)
}

//获取歌手基本信息
export const getSingerDetail=(id:number)=>{
    return server.get("/artist/detail",{params:{id}})
}

//获取歌手粉丝量
export const getSingerFanCount=(id:number)=>{
    return server.get("/artist/follow/count",{params:{id}})
}

//获取歌手热门50首歌曲
export const getSingerHotSongs=(id:number)=>{
    return server.get("/artist/top/song",{params:{id}})
}

//获取歌手的专辑
export const getSingerAlbum=(id:number,limit:number)=>{
    return server.get("/artist/album",{params:{id,limit}})
}

//获取专辑内容
export const getAlbumDetail=(id:number)=>{
    return server.get("/album",{params:{id}})
}

//获取MV列表
export const getMvList=(id:number)=>{
    return server.get("/artist/mv",{params:{id}})
}

//获取MV详情
export const getMvUrl=(id:number)=>{
    return server.get("/mv/url",{params:{id}})
}

//获取歌手描述
export const getSingerDesc=(id:number)=>{
    return server.get("/artist/desc",{params:{id}})
}

//获取相似歌手
export const getSimilarSingers=(id:number)=>{
    return server.get("/simi/artist",{params:{id}})
}

//获取相似歌曲
export const getSimilarSongs=(id:number)=>{
    return server.get("/simi/song",{params:{id}})
}

//获取相似歌单
export const getSimilarPlaylists=(id:number)=>{
    return server.get("/simi/playlist",{params:{id}})
}

//获取粉丝列表
export const getFanList=(uid:number)=>{
    return server.get("/user/followeds?" + Date.now(),{params:{uid}})
}

//获取关注列表
export const getFollowList=(uid:number)=>{
    return server.get("/user/follows?" + Date.now(),{params:{uid}})
}


//关注/取消关注
export const followArtist=(id:number,t:number)=>{
    return server.post("/follow?" + Date.now(),{id,t})
}

//创建歌单
export const createPlaylist=(data:any)=>{
    return server.post("/playlist/create?timestamp=" + Date.now() ,data)
}

//删除歌单
export const deletePlaylist=(id:number)=>{
    return server.post("/playlist/delete?timestamp=" + Date.now() ,{id})
}

//上传歌单封面
export const uploadPlaylistCover=(file:File,id:number)=>{
    const data=new FormData()
    data.append("imgFile",file)
    return server.post("/playlist/cover/update?timestamp=" + Date.now() ,data,{params:{id}})
}

//更新歌单名
export const updatePlaylistName=(data:any)=>{
    return server.post("/playlist/name/update?timestamp=" + Date.now() ,data)
}

//更新歌单描述
export const updatePlaylistDesc=(data:any)=>{
    return server.post("/playlist/desc/update?timestamp=" + Date.now() ,data)
}

//更新用户头像
export const updateAvatar=(file:File)=>{
    const data=new FormData()
    data.append("imgFile",file)
    return server.post("/avatar/upload?timestamp=" + Date.now() ,data)
}

//获取喜欢的歌曲列表
export const getLikeList=(uid:number)=>{
    return server.get("/likelist?timestamp=" + Date.now(),{params:{uid}})
}

//喜欢/取消喜欢
export const likeSong=(id:number,like:boolean)=>{
    return server.post("/like?timestamp=" + Date.now(),{id,like})
}

//获取评论
export const getComment=(id:number,limit:number)=>{
    return server.get("/comment/music?timestamp=" + Date.now(),{params:{id,limit}})
}

//点赞/取消点赞评论
export const likeComment=(id:number,cid:number,t:string,type:number)=>{
    return server.post("/comment/like?timestamp=" + Date.now(),{id,cid,t,type})
}

//发送评论
export const sendComment=(id:number,content:string)=>{
    return server.post("/comment?timestamp=" + Date.now() ,{t:1,type:0,id,content})
}

//删除评论
export const deleteComment=(id:number,commentId:number)=>{
    return server.post("/comment?timestamp=" + Date.now() ,{t:0,type:0,id,commentId})
}

//收藏/取消收藏
export const subscribePlaylist=(id:number,t:number)=>{
    return server.post("/playlist/subscribe?timestamp=" + Date.now(),{id,t})
}