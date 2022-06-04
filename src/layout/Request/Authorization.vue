<template>
    <div class="auth">
        <sub-title title="Authorization Type">
            <template #left>
                <input-select size="small"
                              :allowUpdate="false"
                              :data="authType"
                              :name="currentAuthType.name"
                              @onSelect="authTypeOnSelected"/>
            </template>
            <span class="iconfont icon-help"></span>
        </sub-title>
        <div class="auth__types">
            <div class="auth__types__none none" v-if="currentAuthType.value ==='none'">
                {{$t("request.auth.noAuth")}}
            </div>
            <div class="auth__types__basic auth-grid" v-if="currentAuthType.value === 'basic'">
                <div class="auth__input">
                    <span class="auth__input__title">Username</span>
                    <input-box v-model="content.basic.username"
                               @onBlur="updateSQL"/>
                </div>
                <div class="auth__input">
                    <span class="auth__input__title">Password</span>
                    <input-box v-model="content.basic.password"
                               @onBlur="updateSQL"/>
                </div>
            </div>
            <div class="auth__types__bearer auth-grid" v-if="currentAuthType.value === 'bearer'">
                <div class="auth__input">
                    <span class="auth__input__title">Token</span>
                    <input-box v-model="content.bearer.token"
                               @onBlur="updateSQL"/>
                </div>
            </div>
            <div class="auth__types__api-key auth-grid" v-if="currentAuthType.value === 'api-key'">
                <div class="auth__input">
                    <span class="auth__input__title">Key</span>
                    <input-box v-model="content['api-key'].key"
                               @onBlur="updateSQL"/>
                </div>
                <div class="auth__input">
                    <span class="auth__input__title">Value</span>
                    <input-box v-model="content['api-key'].value"
                               @onBlur="updateSQL"/>
                </div>
                <div class="auth__input">
                    <span class="auth__input__title">Add To</span>
                    <input-select :allow-update="false"
                                  :data="apiKeyAddTo"
                                  :name="content['api-key'].addTo"
                                  class="auth__input__input-select"
                                  size="small"
                                  @onSelect="selectApiHeader"/>
                </div>
            </div>
            <div class="auth__types__digest" v-if="currentAuthType.value === 'digest'">
                <div class="auth-grid">
                    <sub-title title="Basic"></sub-title>
                    <div class="auth__input">
                        <span class="auth__input__title">Username</span>
                        <input-box v-model="content.digest.username"
                                   @onBlur="updateSQL"/>
                    </div>
                    <div class="auth__input">
                        <span class="auth__input__title">Password</span>
                        <input-box v-model="content.digest.password"
                                   @onBlur="updateSQL"/>
                    </div>
                </div>
                <div class="auth-grid">
                    <sub-title title="Optional"></sub-title>
                    <div class="auth__input">
                        <span class="auth__input__title">Realm</span>
                        <input-box v-model="content.digest.realm"
                                   @onBlur="updateSQL"/>
                    </div>
                    <div class="auth__input">
                        <span class="auth__input__title">Nonce</span>
                        <input-box v-model="content.digest.nonce"
                                   @onBlur="updateSQL"/>
                    </div>
                    <div class="auth__input">
                        <span class="auth__input__title">Algorithm</span>
                        <input-select :allow-update="false"
                                      :data="digestAlgorithm"
                                      :name="content.digest.algorithm"
                                      class="auth__input__input-select"
                                      size="small"
                                      @onSelect="selectDigestAlgo"/>
                    </div>
                    <div class="auth__input">
                        <span class="auth__input__title">qop</span>
                        <input-box v-model="content.digest.qop.qop"
                                   @onBlur="updateSQL"/>
                    </div>
                    <div class="auth__input">
                        <span class="auth__input__title">Nonce Count</span>
                        <input-box v-model="content.digest.qop.nc"
                                   @onBlur="updateSQL"/>
                    </div>
                    <div class="auth__input">
                        <span class="auth__input__title">Client Nonce</span>
                        <input-box v-model="content.digest.qop.cnonce"
                                   @onBlur="updateSQL"/>
                    </div>
                    <div class="auth__input">
                        <span class="auth__input__title">Opaque</span>
                        <input-box v-model="content.digest.opaque"
                                   @onBlur="updateSQL"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import InputSelect from '@/components/Input/InputSelect'
import SubTitle from '@/components/SubTitle'
import InputBox from '@/components/Input/InputBox'
import {mapState} from 'vuex'
import {deepClone} from "@/utils/functions";
import db from '@/utils/DB'
import {replace} from "@/utils/envReplace";

const INIT_VALUE = {
    'api-key': {
        key: "",
        value: "",
        addTo: "Header"
    },
    bearer: {
        token: ""
    },
    basic:{
        username: "",
        password: "",
    },
    digest: {
        username: "",
        password: "",
        realm: "",
        nonce: "",
        qop: {
            qop: "",
            nc: "",
            cnonce: "",
        },
        opaque: "",
        algorithm: "MD5"
    }
}

export default {
    name: "Authorization",
    components:{
        InputSelect,
        SubTitle,
        InputBox
    },
    data(){
        return {
            authType: [
                {name: "None", value: "none"},
                {name: "Basic Auth", value: "basic"},
                {name: "Bearer Token", value: "bearer"},
                {name: "API Key", value: "api-key"},
                {name: "Digest Auth", value: "digest"},
                {name: "Hawk Authorization", value: "hawk"}
            ],
            currentAuthType: {name: "None", value: "none"},
            apiKeyAddTo:[
                {name: 'Header'},
                {name: 'Params'}
            ],
            digestAlgorithm: [
                {name: 'MD5'},
                {name: 'MD5-sess'},
                {name: 'SHA-256'},
                {name: 'SHA-256-sess'},
                {name: 'SHA-512-256'},
                {name: 'SHA-512-256-sess'}
            ],
            content: deepClone(INIT_VALUE)
        }
    },
    computed:{
        ...mapState({
            info: state=>state.requests.value.info,
            authValue: state=>state.requests.value.auth
        })
    },
    created(){
        // console.log(this.info.authentication, )
        this.updateInfo()
    },
    methods:{
        updateInfo(){
            this.currentAuthType = this.searchType(this.info.authentication)
            for(let i of Object.keys(this.content)){
                if(Object.keys(this.authValue[i].value).length){
                    this.content[i] = this.authValue[i].value
                }else{
                    this.content[i] = deepClone(INIT_VALUE[i])
                }
            }
        },
        updateSQL(){
            const val = this.currentAuthType.value
            db.update("request_auth", {
                value: window.online ? this.content[val] : JSON.stringify(this.content[val])
            }, {
                aid: this.authValue[val].aid
            })
        },
        searchType(type){
            for(let i of this.authType){
                if(type === i.value){
                    return i
                }
            }
        },
        authTypeOnSelected(value){
            this.currentAuthType = value
            this.info.authentication = value.value
            db.update("request", {
                authentication: value.value
            }, {
               id: this.$store.state.requests.currentRid
            })
        },
        selectDigestAlgo(value){
            this.content.digest.algorithm = value.name
            this.updateSQL()
        },
        selectApiHeader(value){
            this.content["api-key"].addTo = value.name
            this.updateSQL()
        },
        async get(){
            const value = this.currentAuthType.value
            if(value === 'none') return null
            return {
                type: value,
                ...(await replace(this.content[value]))
            }
        }
    }
}
</script>
<style scoped lang="scss">
.auth{
    padding: .5rem 1.5rem 1.5rem 1.5rem;
    @include layout;

    &__types{
        margin-top: 2rem;

        &__digest{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(30rem, 1fr));
            align-items: start;
            grid-gap: 4rem;
            padding-right: 2rem;

            & > div{
                padding-right: 2rem;
            }
        }
    }

    &__input{
        font-size: 1.2rem;
        min-width: 30rem;
        max-width: 40rem;
        &__title{
            display: block;
            margin-bottom: 1rem;
            color: var(--font-primary-black);
        }
    }

    &-grid{
        display: grid;
        grid-template-columns: repeat(1, minmax(30rem, 1fr));
        grid-gap: 2rem 3rem;
        margin-bottom: 2rem;
        min-width: 34rem;
        flex-grow: 1;
    }

    &__types{
        .subtitle{
            &__text{
                color: var(--font-primary-black);
                font-weight: 700;
            }
        }
    }
}
</style>