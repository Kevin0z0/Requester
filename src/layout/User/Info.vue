<template>
    <div class="user_info">
        <section class="user_info__data">
            <img :src="server + user.profile" alt="">
            <div class="user_info__name">
                <h1>{{user.username}}</h1>
                <p>{{user.email}}</p>
            </div>
            <div class="user_info__btn">
                <r-button @click="logout">Log out</r-button>
            </div>
        </section>
        <section class="user_info__desc">
            <h3>Description</h3>
            <markdown :content="user.description" v-if="user.description"></markdown>
            <div class="no_desc" v-if="!user.description">No Description</div>
        </section>
        <section class="user_info__settings">
            <h3>Settings</h3>
            <p>Password</p>
            <div class="user_info__settings__passwd">
                <input-box v-model="currentPasswd" type="password" placeholder="Current Password"></input-box>
                <input-box v-model="passwd" type="password" placeholder="New Password"></input-box>
                <input-box v-model="confirm" type="password" placeholder="Confirm Password"></input-box>
                <r-button>Update Password</r-button>
            </div>
            <p>Delete This Account</p>
            <r-button type="error">DELETE ANYWAY</r-button>
        </section>
    </div>
</template>

<script>
import {mapState} from 'vuex';
import {defineAsyncComponent} from 'vue'
import {getServer, reload} from "@/utils/functions";
import RButton from '@/components/Button'
import InputBox from '@/components/Input/InputBox'
import http from "@/utils/server/http";
import Message from "@/components/Message";
export default {
    name: "Info",
    components:{
        RButton,
        Markdown: defineAsyncComponent(()=>import("@/components/Markdown")),
        InputBox
    },
    data(){
        return {
            server: getServer(),
            currentPasswd: '',
            passwd: '',
            confirm: '',
        }
    },
    computed:{
        ...mapState({
            user: state=>state.user
        })
    },
    methods:{
        logout(){
            http( "/api/v1/user/logout", 'POST', {
                headers:{
                    Cookie: localStorage.getItem('session')
                }
            }).then(()=>{
                localStorage.removeItem('session')
                reload()
            }).catch(err=>{
                Message({
                    message: err,
                    type: 'error'
                })
            })
        }
    }

}
</script>

<style scoped lang="scss">
.user_info{
    padding: 0 3rem 1.8rem;
    &__data{
        display: flex;
        align-items: center;
        img{
            width: 7rem;
            border-radius: 10rem;
            margin-right: 2rem;
        }
    }
    &__name{
        p{
            font-size: 1.2rem;
            margin-top: 1rem;
            color: var(--primary-grey);
        }
    }
    &__btn{
        margin-left: auto;
    }

    &__desc, &__settings{
        margin-top: 2rem;
        font-size: 1.2rem;

        .no_desc{
            color: var(--primary-grey);
            margin-top: 1rem;
        }
    }

    &__settings{
        & > p{
            margin: 1rem 0;
        }
        &__passwd{
            text-align: right;

            .button{
                display: inline-block;
            }
        }
    }

    .input-box{
        height: 3rem;
        border-radius: .7rem;
        font-size: 1.4rem;
        margin: 2.4rem 0;
        background-color: var(--secondary-white);
    }


}
</style>