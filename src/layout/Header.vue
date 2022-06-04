<template>
    <header class="header f-a-c">
        <div class="header__left">
            <a @click="openURL('https://github.com/Kevin0z0/Requester')" class="header__left__item">Github</a>
            <a @click="openURL('https://github.com/Kevin0z0/Requester')" class="header__left__item">{{$t("dashboard.document")}}</a>
        </div>
        <div class="header__center">
            <div class="header__center__search f-a-c">
                <span class="iconfont icon-search"></span>
            </div>
        </div>
        <div class="header__right">
            <a class="iconfont icon-reload" @click="reload"></a>
            <a class="iconfont icon-settings" @click="showSettings"></a>
            <a class="iconfont icon-profile_circled" @click="showUser" v-if="!profile"></a>
            <img :src="getServer(profile)" class="header__right_img" @click="showUser" v-if="profile">
        </div>
        <popup v-model="show" :title="$t('settings.settings')">
            <settings />
        </popup>
        <popup v-model="userShow" :title="$t('user.user')">
            <user />
        </popup>
    </header>
</template>

<script>
import {defineAsyncComponent} from 'vue'
import {reload, getServer} from "@/utils/functions";
export default {
    name: "RHeader",
    components:{
        Popup: defineAsyncComponent(()=>import('@/components/Pop/Popup')),
        Settings: defineAsyncComponent(()=>import('@/layout/Settings')),
        User: defineAsyncComponent(()=>import('@/layout/User'))
    },
    setup(){

    },
    data(){
        return {
            show: false,
            userShow: false,
            profile: this.$store.state.user.profile
        }
    },
    created(){
        
    },
    methods:{
        // eslint-disable-next-line no-unused-vars
        openURL(url){
            window.open(url, '_blank', 'noopener')
        },
        showSettings(){
            this.show = true
        },
        showUser(){
            this.userShow = true
        },
        reload(){
            reload()
        },
        getServer
    },
}
</script>

<style lang="scss" scoped>
    .header {
        border-bottom: 1px solid var(--font-primary-grey);
        height: 6rem;
        padding: 0 2rem;

        &__left{
            flex: 1;
            &__item{
                @include h3;
                margin-right: 2rem;
                cursor: pointer;

                &:hover{
                    border-bottom: .3rem solid var(--font-secondary-black);
                }
            }
        }

        &__center{
            flex: 2;
            &__search{
                width: 30rem;
                height: 3.5rem;
                background-color: var(--secondary-white);
                border-radius: .7rem;
                margin: 0 auto;
            }

            .icon-search{
                font-size: 2.6rem;
                margin-left:auto;
                padding: 0 1rem;
                cursor: pointer;
            }
        }

        &__right{
            flex: 1;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            a{
                font-size: 2.4rem;
                margin-left: 1.6rem;
                display: inline-block;
                transition: .2s;
                cursor: pointer;

                &:hover{
                    transform: scale(1.1);
                }

                &:active{
                    transform: scale(1);
                }
            }
            &_img{
                height: 2.4rem;
                width: 2.4rem;
                border-radius: 5rem;
                cursor: pointer;
                transition: .2s;
                margin-left: 1.8rem;
                &:hover{
                    transform: scale(1.1);
                }

                &:active{
                    transform: scale(1);
                }
            }
        }
    }

</style>