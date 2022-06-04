<template>
    <div class="result">
        <div class="result__loading" v-show="onSend">
            <span class="result__loading__text">{{$t('result.requesting')}}</span>
            <r-button @click="onAbort" type="error">{{$t('result.abort')}}</r-button>
        </div>
        <div v-if="error" class="result__error">
            <div class="result__error-title">
                {{$t("result.error")}}
            </div>
            <p class="result__error-content">
                error: {{error}}
            </p>
        </div>
        <tabs v-else v-model="activeName">
            <pane :label="$t('result.body.value')" name="1">
                <div class="result__body-bar">
                    <select-button :value="bodyType"
                                   @onSelect="bodyOnSelect"
                                   style="margin-left: 1rem"/>
                    <input-select v-show="currentType === 'Content'"
                                  size="small"
                                  :allowUpdate="false"
                                  :data="textType"
                                  :name="currentTextType.name"
                                  @onSelect="textTypeOnInput"/>
                </div>
                <div class="result__body__editor" v-show="currentType === 'Content'">
                    <editor ref="editor"
                            :readonly="true"
                            :code="content"
                            :language="currentTextType.value"/>
                </div>
                <div class="result__body__preview"
                     v-show="currentType === 'Preview'" >
                    <iframe ref="preview" width="100%" style="height: calc(100% - .3rem)" frameborder="0" sandbox="allow-forms allow-scripts"></iframe>
                </div>
            </pane>
            <pane label="Cookie" name="2">
                <div class="result__cookie" v-if="cookies && Object.keys(cookies.cookies).length">
                    <div class="result__cookie-title">
                        <div>{{$t("result.cookie.name")}}</div>
                        <div>{{$t("result.cookie.value")}}</div>
                        <div>{{$t("result.cookie.domain")}}</div>
                        <div>{{$t("result.cookie.path")}}</div>
                        <div>{{$t("result.cookie.expire")}}</div>
                        <div>HttpOnly </div>
                        <div>Secure   </div>
                    </div>
                    <div v-for="(i, index) in cookies.getCookieList()"
                         :key="index"
                        class="input-table-item result__cookie-item">
                        <input-box :modelValue="i.name" :editable="false"/>
                        <input-box :modelValue="i.value" :editable="false"/>
                        <input-box :modelValue="i.domain" :editable="false"/>
                        <input-box :modelValue="i.path" :editable="false"/>
                        <input-box :modelValue="i.expires" :editable="false"/>
                        <input-box :modelValue="i.httponly" :editable="false"/>
                        <input-box :modelValue="i.secure" :editable="false"/>
                    </div>
                </div>
                <div class="result__cookie none" v-else>
                    {{$t("result.cookie.noCookie")}}
                </div>
            </pane>
            <pane :label="$t('result.headers.name')" name="3">
                <div class="result__headers" v-if="headers">
                    <div class="result__cookie-title">
                        <div>{{$t("result.headers.key")}}</div>
                        <div>{{$t("result.headers.value")}}</div>
                    </div>
                    <div v-for="(value, key,  index) in headers"
                         :key="index"
                         class="input-table-item result__headers-item">
                        <input-box :modelValue="key" :editable="false"/>
                        <input-box :modelValue="value" :editable="false"/>
                    </div>
                </div>
                <div class="result__headers none" v-else>
                    {{$t("result.headers.noHeader")}}
                </div>
            </pane>
            <pane :label="$t('result.test.name')" name="4" class="test">
                <div>
                    <select-button :value="testType"
                                    @onSelect="testOnSelect"
                                   v-if="activeName === '4'" ref="sbtn"/>
                </div>
                <div v-for="(i,index) in testResult" :key="index" class="test__list">
                    <span v-if="i.status === 'passed'" class="test__block test__passed">{{$t("result.test.pass")}}</span>
                    <span v-else class="test__block test__failed">{{$t("result.test.fail")}}</span>
                    <span class="test__block__desc">{{i.description}}</span>
                    <span v-if="i.status === 'failed'" class="test__block__msg">{{i.message}}</span>
                </div>
            </pane>
            <template #extra v-if="responseInfo">
                <div class="result__calc">
                    {{$t("result.status")}}:
                    <span :style="`color: var(--primary-${getColor(responseInfo.status.code)})`">{{responseInfo.status.code}} {{responseInfo.status.message}}</span>
                </div>
                <div class="result__calc">
                    {{$t("result.time")}}:
                    <span class="result__response-info__green">{{calcTime(responseInfo.time.total)}}</span>
                </div>
                <div class="result__calc">
                    {{$t("result.size")}}:
                    <span class="result__response-info__green">{{calcSize(responseInfo.size.total)}}</span>
                </div>
            </template>
        </tabs>
    </div>
</template>

<script>
import Tabs from '@/components/Tabs'
import Pane from '@/components/Pane'
import SelectButton from '@/components/Select/SelectButton'
import InputSelect from '@/components/Input/InputSelect'
import RButton from '@/components/Button'
import InputBox from '@/components/Input/InputBox'
import {ref, defineAsyncComponent} from 'vue'
import {testResult} from "@/utils/vm/RequesterHandler";
const addition = `
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; style-src http: https: 'unsafe-inline'; img-src http: https: data:; font-src http: https:; connect-src http: https:; media-src http: https:; object-src 'none'; child-src 'none'; frame-src 'none'">
<style>
::-webkit-scrollbar {
    background-color: #fff;
    width: .4rem;
    height: .4rem;
}

::-webkit-scrollbar-button {
    background-color: #fff;
    height: .3rem;
}

::-webkit-scrollbar-thumb {
    background-color: #EDEDED;
    border-radius: .5rem;
}</style>`

export default {
    name: "Result",
    emits:["onAbort", "update:onSend"],
    components:{
        Tabs,
        Pane,
        RButton,
        InputBox,
        InputSelect,
        SelectButton,
        Editor: defineAsyncComponent(()=>import('@/components/Editor')),
    },
    props:{
        onSend:{
            default: false,
            type: Boolean
        }
    },
    setup(props){
        const editor = ref(null)
        const preview = ref(null)
        return {
            editor,
            preview,
            props
        }
    },
    data(){
        return {
            activeName: '1',
            bodyType: [
                {name: this.$t("result.body.content"), value:"Content"},
                {name: this.$t("result.body.preview"), value: "Preview"}
            ],
            testType: [
                {name: this.$t("result.test.all"), value:"All"},
                {name: this.$t("result.test.passed"), value:"Passed"},
                {name: this.$t("result.test.failed"), value:"Failed"},
            ],
            currentType: "Content",
            textType: [
                {name: "Auto", value: 'auto'},
                {name: "Text", value: 'plaintext'},
                {name: "HTML", value: 'text/html'},
                {name: "JavaScript", value: 'javascript'},
                {name: "JSON", value: 'json'},
                {name: "XML", value: 'xml'},
            ],
            currentTextType: {name: "Auto", value: 'auto'},
            content: ``,
            setHeaders: [],
            responseInfo: null,
            cookies: null,
            headers: null,
            showEditor: false,
            error: null,
            testResult: []
        }
    },
    methods:{
        bodyOnSelect(value){
            this.currentType = value
            if(value === 'Preview'){
                this.setPreview()
            }
        },
        textTypeOnInput(value){
            this.currentTextType = value
            this.editor.setLanguage(value.value)
        },
        setHeight(height){
            this.editor && this.editor.setHeight(Math.max(0, height - 95))
        },
        setPreview(){
            this.preview.setAttribute("srcdoc", addition + this.content)
        },
        setTest(data){
            this.testResult = data
        },
        testOnSelect(name){
            if(name === "All"){
                return this.setTest(testResult.test)
            }
            if(name === 'Passed'){
                return this.setTest(testResult.test.filter(v=>v.status === 'passed'))
            }
            if(name === 'Failed'){
                return this.setTest(testResult.test.filter(v=>v.status === 'failed'))
            }
        },
        setContent(content){
            this.error = null
            this.showEditor = true
            const v = content.data?.toString()
            this.cookies = content.cookies
            if(content.headers && 'set-cookie' in content.headers){
                delete content.headers["set-cookie"]
            }
            this.headers = content.headers
            // console.log(this.headers)
            // console.log(content.headers['set-cookie'])
            this.content = v
            if(this.currentType === 'Preview'){
                this.setPreview()
            }

            if(this.activeName === '4'){
                this.$refs.sbtn.selected = this.testType[0].value
                this.$refs.sbtn.init()
            }
            this.setTest(testResult.test)
            this.$nextTick(()=>{
                this.editor.updateContent(v)
                this.editor.setLanguage(this.currentTextType.value)
            })
        },
        clearContent(){
            this.editor && this.editor.updateContent("")
            this.cookies = null
            this.responseInfo = null
        },
        onAbort(){
            this.$emit("onAbort", null)
            this.$emit("update:onSend", false)
        },
        calcTime(time){
            if(time < 1000) return time.toFixed(2) + "ms"
            return (time / 1000).toFixed(2) + "s"
        },
        calcSize(length){
            if(length < 1024) return length + "B"
            if(length < 1048576) return (length / 1024).toFixed(2) + "KB"
            if(length < 1073741824) return (length / 1048576).toFixed(2) + "MB"
        },
        getColor(code){
            if(code < 200) return "orange"
            if(code < 300) return "green"
            if(code < 400) return "yellow"
            if(code < 500) return "red"
            if(code < 600) return "blue"
            return "grey"
        },
        setError(step, content){
            this.error = `There was an error in evaluating the ${step}: ${content}`
        },
    }
}
</script>
<style scoped lang="scss">
.input-table{
    border: .1rem solid var(--secondary-white);
    background-color: var(--primary-white);
    &-item {
        display: flex;
        align-items: center;
        font-size: 1.2rem;
        height: 3rem;
        background-color: inherit;
        margin-bottom: .1rem;
        transition: .2s background-color;

        &:hover{
            background-color: var(--tertiary-white);
        }

        &:not(:first-child){
            border-top: .1rem solid var(--secondary-white);
        }
        &-unchecked{
            .input-box{
                &__main, &__filename{
                    color: var(--font-secondary-grey);
                }
            }
        }
        &__box{
            padding: 0 1rem;
            &:not(:last-child) {
                border-right: .1rem solid var(--secondary-white);
            }
        }
    }
}



.result{
    height: 100%;
    position: relative;

    &__loading{
        position: absolute;
        top: 0;
        right: .5rem;
        left: 0;
        bottom: 0;
        background-color: rgba(var(--primary-white-rgb), .4);
        backdrop-filter: blur(.3rem);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        min-height: 15rem;

        &__text{
            margin-bottom: 1rem;
            color: var(--font-secondary-black);
            font-size: 1.6rem;
        }
    }

    &__error{
        &-title{
            padding: 1rem;
            font-size: 1.4rem;
            font-weight: 900;
            color: var(--primary-red);
        }

        &-content{
            font-size: 1.5rem;
            text-align: center;
            background: rgb(255,235,231);
            color: var(--primary-red);
            padding: 2rem;
            margin: 1rem 1.3rem 1rem 1rem;
            border-radius: .7rem;
        }
    }

    &__abort{
        padding: .5rem 1.5rem;
        background-color: var(--font-primary-grey);
        cursor: pointer;
        border-radius: .7rem;
    }

    .tabs{
        height: 100%;
        margin-right: .5rem;
        padding-bottom: .5rem;

        &__content{
            height: calc(100% - 4rem);

            .pane{
                display: flex;
                flex-direction: column;
            }
        }
    }

    &__calc{
        margin-right: 1rem;
        font-weight: 300;
    }

    &__response-info__green{
        color: var(--primary-green);
    }

    &__body{
        &-bar{
            display: flex;
            align-items: center;
            & > .input-select__small{
                height: 3rem;
                margin-left: 2rem;
            }
        }

        &__preview{
            overflow: auto;
            height: 100%;
            margin-right: -.5rem;
        }
    }

    &__headers, &__cookie{
        width: calc(100% + .4rem);
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        border-top: .1rem solid var(--secondary-white);
        padding-bottom: 2rem;

        &-title{
            display: flex;
            width: 100%;
            font-size: 1.2rem;
            font-weight: 900;
            color: var(--font-secondary-black);
            height: 3rem;
            padding-left: .8rem;
            & > div{
                width: 100%;
                line-height: 3rem;
                padding-left: .7rem;
                border-right: .1rem solid var(--secondary-white);
            }

            & > div:last-child{
                border-right: none;
            }
        }

        &-item{
            background-color: var(--primary-white);
            padding-left: .8rem;
            &:last-child{
                height: 3.2rem;
                border-bottom: .1rem solid  var(--secondary-white);

            }

        }
    }
}

.test{
    font-size: 1.2rem;
    padding: 0 2rem 1rem;
    color: var(--font-primary-black);
    overflow-y: auto;
    &__list{
        display: flex;
        align-items: baseline;

        & > span{
            word-break: break-word;
        }
    }

    &__block{
        padding: .8rem 1.2rem;
        color: #fff;
        border-radius: .7rem;
        margin-right: 1rem;
        min-width: 5.6rem;
        text-align: center;
        display: inline-block;
        margin-bottom: 1rem;
        &__desc{
            flex-shrink: 0;
        }

        &__msg{
            border-left: .1rem solid #ccc;
            margin-left: .8rem;
            padding-left: .8rem;
        }
    }

    &__passed{
        background-color: var(--primary-green);
    }

    &__failed{
        background-color: var(--primary-red);
    }
}
</style>