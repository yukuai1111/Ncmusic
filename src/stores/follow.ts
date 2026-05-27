import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getFollowList, getFanList} from '../api/api'
export const useFollowStore = defineStore('follow', () => {
    //关注列表
    const follows = ref<{ id: number, name: string, avatar: string, signature: string, followed: boolean }[]>([])
    //粉丝列表
    const fans = ref<{ id: number, name: string, avatar: string, signature: string, followed: boolean }[]>([])

    //获取关注列表
    const getFollows = async (uid: number) => {
        if (!uid) return
        const res = await getFollowList(uid)
        const { data: { follow } } = res
        // console.log(follow)
        follows.value = follow.map((item:{userId:number,nickname:string,avatarUrl:string,signature:string,followed:boolean}) => {
            return {
                id: item.userId,
                name: item.nickname,
                avatar: item.avatarUrl || 'https://ts2.tc.mm.bing.net/th/id/OIP-C.xA5QX2crc3fR5d0DIH-oDQAAAA?rs=1&pid=ImgDetMain&o=7&rm=3',
                signature: item.signature || '',
                followed: item.followed
            }
        })
        // console.log(follows.value)
    }
    //获取粉丝列表
    const getFans = async (uid: number) => {
        if (!uid) return
        const res = await getFanList(uid)
       const {data:{followeds}}=res
       fans.value=followeds.map((item:{userId:number,nickname:string,avatarUrl:string,signature:string,followed:boolean}) => {
            return {
                id: item.userId,
                name: item.nickname,
                avatar: item.avatarUrl || 'https://ts2.tc.mm.bing.net/th/id/OIP-C.xA5QX2crc3fR5d0DIH-oDQAAAA?rs=1&pid=ImgDetMain&o=7&rm=3',
                signature: item.signature || '',
                followed: item.followed
            }
        })
        // console.log(fans.value)
    }
    return {
        follows,
        fans,
        getFollows,
        getFans
    }
})