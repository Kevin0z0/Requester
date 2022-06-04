<template>
    <div class="single__settings">
        <div class="single__settings-item">
            <div class="single__settings-item__info">
                <h4 class="single__settings-item__title">
                    {{$t("requestSettings.SSLVerification")}}
                </h4>
                <p class="single__settings-item__desc">
                    {{$t("requestSettings.SSLVerificationIntro")}}
                </p>
            </div>
            <div class="single__settings-item__config">
                <check-button :modelValue="config.sslCert.followGlobal ? General.Request.SSLVerification.value : config.sslCert.value"
                              @update:modelValue="setValue('sslCert', $event)"
                              @click="updateDB('sslCert')"/>
                <p v-if="!config.sslCert.followGlobal" @click="restoreGlobal('sslCert')">
                    {{$t("requestSettings.restore")}}
                </p>
            </div>
        </div>
        <div class="single__settings-item">
            <div  class="single__settings-item__info">
                <h4 class="single__settings-item__title">
                    {{$t("requestSettings.FollowRedirects")}}
                </h4>
                <p class="single__settings-item__desc">
                    {{$t("requestSettings.FollowRedirectsIntro")}}
                </p>
            </div>
            <div class="single__settings-item__config">
                <check-button :modelValue="config.followRedirects.followGlobal ? General.Response.redirects.value : config.followRedirects.value"
                              @update:modelValue="setValue('followRedirects', $event)"
                              @click="updateDB('followRedirects')"/>
                <p v-if="!config.followRedirects.followGlobal" @click="restoreGlobal('followRedirects')">
                    {{$t("requestSettings.restore")}}
                </p>
            </div>

        </div>
        <div class="single__settings-item">
            <div  class="single__settings-item__info">
                <h4 class="single__settings-item__title">
                    {{$t("requestSettings.InheritContents")}}
                </h4>
                <p class="single__settings-item__desc">
                    {{$t("requestSettings.InheritContentsIntro")}}
                </p>
            </div>
            <check-button v-model="config.inherit"
                          @click="updateDB('inherit')"/>

        </div>
        <div class="single__settings-item">
            <div  class="single__settings-item__info">
                <h4 class="single__settings-item__title">
                    {{$t("requestSettings.followOriginal")}}
                </h4>
                <p class="single__settings-item__desc">
                    {{$t("requestSettings.followOriginalIntro")}}
                </p>
            </div>
            <check-button v-model="config.followMethod"
                          @click="updateDB('followMethod')"/>
        </div>
        <div class="single__settings-item">
            <div  class="single__settings-item__info">
                <h4 class="single__settings-item__title">
                    {{$t("requestSettings.removeReferer")}}
                </h4>
                <p class="single__settings-item__desc">
                    {{$t("requestSettings.removeRefererIntro")}}
                </p>
            </div>
            <check-button v-model="config.removeReferer"
                          @click="updateDB('removeReferer')"/>
        </div>
        <div class="single__settings-item">
            <div  class="single__settings-item__info">
                <h4 class="single__settings-item__title">
                    {{$t("requestSettings.encodeURL")}}
                </h4>
                <p class="single__settings-item__desc">
                    {{$t("requestSettings.encodeURLIntro")}}
                </p>
            </div>
            <check-button v-model="config.encodeURL"
                          @click="updateDB('encodeURL')"/>
        </div>
        <div class="single__settings-item">
            <div  class="single__settings-item__info">
                <h4 class="single__settings-item__title">
                    {{$t("requestSettings.disableCookie")}}
                </h4>
                <p class="single__settings-item__desc">
                    {{$t("requestSettings.disableCookieIntro")}}
                </p>
            </div>
            <check-button v-model="config.disableCookie"
                          @click="updateDB('disableCookie')"/>
        </div>
        <div class="single__settings-item">
            <div  class="single__settings-item__info">
                <h4 class="single__settings-item__title">
                    {{$t("requestSettings.maximumNumber")}}
                </h4>
                <p class="single__settings-item__desc">
                    {{$t("requestSettings.maximumNumberIntro")}}
                </p>
            </div>
            <div class="single__settings-item__config">
                <input-box inputType="number"
                           :modelValue="config.MaxRedirects.followGlobal ? General.Response.redirectTimes.value : config.MaxRedirects.value"
                           @update:modelValue="config.MaxRedirects.value = $event"
                           @onBlur="updateDB('MaxRedirects')"
                />
                <p v-if="!config.MaxRedirects.followGlobal" @click="restoreGlobal('MaxRedirects', General.Response.redirectTimes.value)">
                    {{$t("requestSettings.restore")}}
                </p>
            </div>

        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex'
import CheckButton from '@/components/CheckButton'
import InputBox from '@/components/Input/InputBox'
import db from "@/utils/DB";
import {deepClone, isObject} from "@/utils/functions";

const options = {
    sslCert: {
        value: false,
        followGlobal: true
    },
    followRedirects: {
        value: true,
        followGlobal: true
    },
    inherit: true,
    followMethod: false,
    removeReferer: true,
    encodeURL: false,
    disableCookie: false,
    MaxRedirects: {
        value: 10,
        followGlobal: true
    }
}

export default {
    name: "Single_Settings",
    components: {
        CheckButton,
        InputBox
    },
    data() {
        return {
            config: {},
        }
    },
    computed: {
        ...mapState({
            settings: state => state.requests.value.settings,
            General: state=>state.settings.General
        }),
    },
    created() {
        this.updateInfo()
    },
    methods: {
        setValue(key, value){
            const data = this.config[key]
            if(data.followGlobal){
                data.value = value === '1'
                return
            }
            data.value = value
        },
        restoreGlobal(key, target){
            const data = this.settings.value[key]
            data.followGlobal = true
            if(target !== undefined){
                data.value = target
            }
            this.updateDB()
        },
        updateInfo() {
            // console.log(JSON.stringify(this.settings.value))
            this.config = Object.assign(deepClone(options), this.settings.value)
            this.settings.value = this.config
        },
        updateDB(key) {
            const data = this.settings.value[key]
            if(isObject(data)){
                data.followGlobal = false
            }
            db.update("request_settings", {
                value: window.online ? this.settings.value : JSON.stringify(this.settings.value)
            }, {sid: this.settings.sid})
        },
        get(){
            const temp = this.settings.value
            temp.MaxRedirects.value = 1 * temp.MaxRedirects.value
            return temp
        }
    },
}
</script>


<style lang="scss">
.single__settings {
    height: 100%;
    overflow-y: auto;
    padding: 0 1.5rem 1.5rem;
    font-size: 1.2rem;

    &-item {
        display: flex;
        padding: 1rem;
        color: var(--font-primary-black);
        margin: 1rem 0;
        border-radius: .7rem;
        transition: .2s;

        &:hover{

            background-color: var(--tertiary-white);
        }

        &__info{
            margin-right: auto;
        }

        &__config{
            text-align: right;
            font-size: 1rem;

            & > p{
                margin-top: .2rem;
                cursor: pointer;
                color: var(--primary-grey);
                &:hover{
                    color: var(--primary-color);
                }
            }
        }

        &__desc {
            margin-top: 1.1rem;
        }

        & > div:last-child{
            flex-shrink: 0;
            flex-grow: 0;
            margin-left: 2rem;
        }
        .input-box{
            width: 6rem;
            height: 3.2rem;
            font-size: 1.4rem;
            background-color: var(--secondary-white);
            border-radius: .7rem;
            text-align: right;
            display: inline-block;
            & > .input-box__main{
                padding: .7rem !important;
            }
        }

    }
}
</style>