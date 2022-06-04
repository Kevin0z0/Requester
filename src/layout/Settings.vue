<template>
    <div class="settings">
        <tabs v-model="activeName">
            <pane :label="$t('settings.general.value')" name="1" class="settings__general">
                <sub-title :title="$t('settings.general.request.value')" />
                <div class="settings__wrap">
                    <div class="settings__wrap-bar">
                        <span class="settings__wrap-bar__name">{{$t('settings.general.request.SSLVerification')}}</span>
                        <check-button v-model="General['Request']['SSLVerification'].value"
                                      @click="updateSQL('General','Request', 'SSLVerification')"/>
                    </div>
                    <div class="settings__wrap-bar">
                        <span class="settings__wrap-bar__name">{{$t('settings.general.request.timeout')}}</span>
                        <input-box v-model="General['Request']['timeout'].value"
                                   @onBlur="updateSQL('General','Request', 'timeout')"
                                   inputType="number"/>
                        <span class="settings__wrap-bar__extra">{{$t("settings.ms")}}</span>
                    </div>
                    <div class="settings__wrap-bar">
                        <span class="settings__wrap-bar__name">{{$t('settings.general.request.noCache')}}</span>
                        <check-button v-model="General['Request']['noCache'].value"
                                      @click="updateSQL('General','Request', 'noCache')"/>
                    </div>
                    <div class="settings__wrap-bar">
                        <span class="settings__wrap-bar__name">{{$t('settings.general.request.acceptEncoding')}}</span>
                        <check-button v-model="General['Request']['acceptEncoding'].value"
                                      @click="updateSQL('General','Request', 'acceptEncoding')"/>
                    </div>
                </div>
                <sub-title :title="$t('settings.general.response.value')" />
                <div class="settings__wrap">
                    <div class="settings__wrap-bar">
                        <span class="settings__wrap-bar__name">{{$t('settings.general.response.redirects')}}</span>
                        <check-button v-model="General['Response']['redirects'].value"
                                      @click="updateSQL('General','Response', 'redirects')"/>
                    </div>
                    <div class="settings__wrap-bar">
                        <span class="settings__wrap-bar__name">{{$t('settings.general.response.redirectTimes')}}</span>
                        <input-box v-model="General['Response']['redirectTimes'].value"
                                   @onBlur="updateSQL('General','Response', 'redirectTimes')"
                                   inputType="number"/>
                    </div>
                    <div class="settings__wrap-bar">
                        <span class="settings__wrap-bar__name">{{$t('settings.general.response.maxResponseSize')}}</span>
                        <input-box v-model="General['Response']['maxResponseSize'].value"
                                   @onBlur="updateSQL('General','Response', 'maxResponseSize')"
                                   inputType="number"/>
                        <span class="settings__wrap-bar__extra">MB</span>
                    </div>
                </div>
                <sub-title :title="$t('settings.general.editor.value')" />
                <div class="settings__wrap">
                    <div class="settings__wrap-bar">
                        <span class="settings__wrap-bar__name">{{$t('settings.general.editor.minimap')}}</span>
                        <check-button v-model="General['Editor']['minimap'].value"
                                      @click="updateSQL('General','Editor', 'minimap')"/>
                    </div>
                    <div class="settings__wrap-bar">
                        <span class="settings__wrap-bar__name">{{$t('settings.general.editor.fontSize')}}</span>
                        <input-box v-model="General['Editor']['fontSize'].value"
                                   @onBlur="updateSQL('General','Editor', 'fontSize')"
                                   inputType="number"/>
                        <span class="settings__wrap-bar__extra">px</span>
                    </div>
                </div>

            </pane>
            <pane :label="$t('settings.proxies.value')" name="2"  class="settings__proxies">
                <div class="settings__wrap-bar m-b-1">
                    <span class="settings__wrap-bar__name">{{$t('settings.proxies.useSystemProxy')}}</span>
                    <check-button v-model="Proxies['Proxy']['system'].value.active"
                                  @click="updateProxy('system')"/>
                </div>
                <div class="settings__wrap-bar m-b-1">
                    <span class="settings__wrap-bar__name">{{$t('settings.proxies.useCustomProxy')}}</span>
                    <check-button v-model="Proxies['Proxy']['custom'].value.active"
                                  @click="updateProxy"/>
                </div>
                <div class="settings__wrap-bar-sub">
                    <i class="m-r-1">HTTP</i>
                    <check-box class="m-r-3"
                               v-model="Proxies['Proxy']['custom'].value.type['HTTP']"
                               @onChange="updateProxy" />
                    <i class="m-r-1">HTTPS</i>
                    <check-box v-model="Proxies['Proxy']['custom'].value.type['HTTPS']"
                               @onChange="updateProxy" />
                </div>
                <div class="settings__wrap-bar-sub">
                    <span class="m-r-1">{{$t('settings.proxies.proxy')}}</span>
                    <input-box placeholder="127.0.0.1"
                               style="width: 18rem"
                               v-model="Proxies['Proxy']['custom']['value']['server']['ip']"
                               @onBlur="updateProxy"/>
                    <i class="m-l-1 m-r-1">:</i>
                    <input-box placeholder="8080"
                               inputType="number"
                               v-model="Proxies['Proxy']['custom']['value']['server']['port']"
                               @onBlur="updateProxy"/>
                </div>
                <div class="settings__wrap-bar-sub">
                    <span class="m-r-1">{{$t('settings.proxies.authentication')}}</span>
                    <check-button v-model="Proxies['Proxy']['custom'].value.auth.value"
                                  @click="updateProxy"/>
                </div>
                <div class="settings__wrap-bar-sub">
                    <span class="m-r-1">{{$t('settings.proxies.username')}}</span>
                    <input-box :placeholder="$t('settings.proxies.username')"
                               style="width: 18rem"
                               v-model="Proxies['Proxy']['custom']['value']['auth']['username']"
                               @onBlur="updateProxy"/>
                </div>
                <div class="settings__wrap-bar-sub">
                    <span class="m-r-1">{{$t('settings.proxies.password')}}</span>
                    <input-box :placeholder="$t('settings.proxies.password')"
                               style="width: 18rem"
                               v-model="Proxies['Proxy']['custom']['value']['auth']['password']"
                               @onBlur="updateProxy"/>
                </div>
                <div class="settings__wrap-bar-sub">
                    <span class="m-r-1">{{$t('settings.proxies.bypass')}}</span>
                    <textarea cols="50"
                              rows="3"
                              class="settings__textarea"
                              :placeholder="$t('settings.proxies.bypassIntro')"
                              v-model="Proxies['Proxy']['custom']['value']['bypass']" @keypress.enter="textareaKeydown"
                              @blur="updateProxy"></textarea>
                </div>
            </pane>
            <pane :label="$t('settings.interface.value')" name="3">
                Interface
            </pane>
            <pane :label="$t('settings.about.value')" name="4">
                About
            </pane>
        </tabs>
    </div>
</template>

<script>
import Tabs from '@/components/Tabs'
import Pane from '@/components/Pane'
import CheckButton from '@/components/CheckButton'
import SubTitle from '@/components/SubTitle'
import InputBox from '@/components/Input/InputBox'
import CheckBox from '@/components/Checkbox'
import {mapState} from 'vuex';
import db from '@/utils/DB'

export default {
    name: "Settings",
    components: {
        Tabs,
        Pane,
        CheckButton,
        SubTitle,
        InputBox,
        CheckBox
    },
    data() {
        return {
            activeName: '1',
            open: false
        }
    },
    computed: {
        ...mapState({
            General: state=>state.settings.General,
            Proxies: state=>state.settings.Proxies
        })
    },
    methods: {
        updateSQL(groupName, className, name, type){
            const value = this[groupName][className][name]

            let data
            if(type === "json" && !window.online) data = JSON.stringify(value.value)
            else data = value.value

            if(!value.value) {
                db.get("SELECT * FROM settings WHERE groupName= ? and className = ? and name = ?",
                    [groupName, className, name]).then(v=>{
                    value.value = v.value
                })
                return
            }
            db.update('settings', {
                value: data
            },{
                groupName,
                className,
                name
            })
        },
        updateProxy(pos){
            this.updateSQL(
                'Proxies',
                'Proxy',
                pos?.constructor === String ? pos : 'custom',
                'json'
            )
        },
        textareaKeydown(e) {
            e.returnValue = false
            return false
        },
    },
    created() {
        // console.log(this.Proxies['Proxy']['custom']['value']['server']['ip'])
        // console.log(this.$store.state.settings)
        // console.log(JSON.stringify(this.settings))
        // 0: {groupName: "General", className: "Request", name: "Timeout(ms)", description: null, value: "0"}

    }
}
</script>
<style lang="scss">
.settings {
    .tabs__content {
        height: 100%;
        overflow-y: auto;
        margin-right: .3rem;
    }
    .subtitle{
        font-weight: 900;
        &__text{
            color: var(--font-primary-black);
        }
    }
    .input-box{
        height: 3.2rem;
        width: 6rem;
        flex: none;
        font-size: 1.2rem;

        &__main{
            background-color: var(--secondary-white);
            text-align: right;
            padding: .8rem;
        }
    }
    &__wrap-bar-sub{
        .input-box{
            &__main{
                text-align: left;
            }
        }
    }
}
</style>

<style scoped lang="scss">
.settings {
    height: 100%;
    overflow: hidden;

    .tabs {
        display: flex;
        flex-direction: column;
        height: inherit;
    }

    .pane {
        height: auto;
        padding: 1rem 1.5rem;
    }

    &__general {
        height: inherit;
    }

    &__proxies{
        font-size: 1.3rem;
    }

    &__wrap{
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(27rem, 1fr));
        grid-gap: 1rem 2rem;
        margin: 1rem 0 2rem;
        &-bar{
            display: flex;
            align-items: center;
            &-sub{
                margin: 1.5rem 2rem;
                display: flex;
                align-items: center;

                & > span{
                    width: 10rem;
                }

            }

            &__name{
                font-size: 1.3rem;
                margin-right: auto;
            }
            &__extra{
                font-size: 1.2rem;
                margin-left: 1rem;
            }
        }
    }

    &__textarea{
        resize: vertical;
        border-radius: 0.7rem;
        background: var(--secondary-white);
        border: none;
        padding: 1rem;
        font-family: "Microsoft YaHei";
        color: var(--font-secondary-black);
        font-size: 1.2rem;
        min-height: 8rem;
    }
}
</style>