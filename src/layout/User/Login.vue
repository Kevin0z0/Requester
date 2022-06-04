<template>
    <div class="user-login">
        <img :src="logo" alt="" class="logo">
        <div class="user-login__wrap">
            <h1>{{register ? 'Register' : 'Login'}}</h1>
            <input-box v-model="server"
                       placeholder="Remote Server Address (http://, https://)"/>
            <input-box v-model="username"
                       placeholder="Username"/>
            <input-box v-model="email" v-if="register"
                       placeholder="Email"/>

            <input-box v-model="password"
                       type="password"
                       placeholder="Password"/>
            <input-box v-model="confirm" v-if="register"
                       type="password"
                       placeholder="Confirm Password"/>
            <a href="#"></a>
            <div class="button_wrap">
                <r-button :type="register ? 'primary' : 'info'" @click="signUp">Sign Up</r-button>
                <r-button :type="register ? 'info' : 'primary'" @click="login" :loading="loginLoading">Login</r-button>
            </div>
        </div>
    </div>
</template>

<script>
import logo from '@/assets/logo.png';
import InputBox from '@/components/Input/InputBox'
import RButton from '@/components/Button'
import {isStr, reload, getServer} from "@/utils/functions";
import http from '@/utils/server/http'
const {require} = window
const crypto = require('crypto')
import CookieJar from "@/utils/cookieJar";
import Message from "@/components/Message";
const md5 = (text) => {
    return crypto.createHash('md5').update(text).digest('hex')
}

const USERNAME = /^[\u4E00-\u9FA5A-Za-z0-9._]+$/
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/

const setCookie = (cookie, domain) => {
    localStorage.setItem('session', new CookieJar(cookie, domain)
        .getCookies(domain, '/'))
}

export default {
    name: "Login",
    components: {
        InputBox,
        RButton
    },
    data(){
        return {
            logo,
            username: "",
            password: "",
            email: "",
            confirm: "",
            register: false,
            server: getServer(),
            loginLoading: false
        }
    },
    methods:{
        checkUsername(){
            if(USERNAME.test(this.username)) return true
            return "Username can only consist of upper and lower case letters and numbers"
        },
        checkPassword(){
            const pwd = this.password
            if (pwd.length < 8) return "Password should be at least 8 character";
            if (!/\d/.test(pwd)) return "Password require numbers"
            if (!/[a-z]/.test(pwd)) return "Password require lower case character"
            if (!/[A-Z]/.test(pwd)) return "Require upper case character"
            if (!/[!@#$%^&*._-]/.test(pwd)) return "Require special character"
            return false
        },
        checkEmail(){
            if(!EMAIL.test(this.email)){
                return "Email format error"
            }
            return true
        },
        saveRemoteServer(){
            const server = (/^http[s]?:\/\//.test(this.server) ? "" : "http://") + this.server
            localStorage.setItem('server', server)
        },
        login(){
            this.saveRemoteServer()
            if(this.register){
                this.register = false
                return
            }
            const checkName = this.checkUsername()
            if(isStr(checkName)){
                return Message({
                    message: checkName,
                    type: 'error'
                })
            }
            this.loginLoading = true
            http('/api/v1/user/login', "POST", {
                data: {
                    username: this.username,
                    password: md5(this.password)
                },
                timeout: 20000
            }).then(v=>{
                setCookie(v.headers['set-cookie'], this.server)
                this.loginLoading = false
                reload()
            }).catch(v=>{
                Message({
                    message: v,
                    type: 'error'
                })
                this.loginLoading = false
            })
        },
        signUp(){
            this.saveRemoteServer()
            if(!this.register){
                this.register = true
                return
            }
            const checkName = this.checkUsername()
            if(isStr(checkName)){
                return Message({
                    message: checkName,
                    type: 'error'
                })
            }
            const checkEmail = this.checkEmail()
            if(isStr(checkEmail)){
                return Message({
                    message: checkEmail,
                    type: 'error'
                })
            }
            const passHint = this.checkPassword()
            if(passHint){
                return Message({
                    message: passHint,
                    type: 'error'
                })
            }
            if(this.password !== this.confirm){
                return Message({
                    message: "Password verification failed",
                    type: 'error'
                })
            }
            http("/api/v1/user/register", "POST", {
                data: {
                    username: this.username,
                    password: md5(this.password),
                    email: this.email,
                    confirm: md5(this.confirm)
                },
                timeout: 20000
            }).then((v)=>{
                setCookie(v.headers['set-cookie'], this.server)
                reload()
            }).catch(v=>{
                Message({
                    message: v,
                    type: 'error'
                })
            })
        }
    }

}
</script>

<style lang="scss">
.user-login{
    -webkit-user-drag: none;
    .logo{
        width: 6rem;
        margin: 2rem auto 1rem;
        display: block;
        user-select: none;
        -webkit-user-drag: none;
    }

    &__wrap{
        max-width: 35rem;
        margin: 0 auto;
        h1{
            color: var(--font-primary-black)
        }
        .input-box{
            font-size: 1.4rem;
            margin: 2rem 0;
        }
        .input-box__main{
            position: unset;
            background-color: var(--secondary-white);

        }
    }
    .button_wrap{
        display: flex;
        align-items: center;
        justify-content: space-between;
        & > *{
            width: 15rem;
            text-align: center;
            height: 4rem;
        }

        margin-bottom: 4rem;
    }
}
</style>