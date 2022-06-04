<template>
    <div class="body input_main">
        <sub-title title="Content Type" class="body__subtitle">
            <template #left>
                <radio :value="value"
                       :checked="currentType"
                       @onChecked="onChecked"/>
            </template>
            <div class="body__choice">
                <input-select v-if="currentType === 'raw'"
                              size="small"
                              :allowUpdate="false"
                              :data="textType"
                              :name="raw.type"
                              @onSelect="textTypeOnInput"/>
            </div>
        </sub-title>
        <div class="body__main">
            <div v-if="currentType === 'none'" class="body__main__none none">
                {{$t("request.body.noBody")}}
            </div>
            <div v-if="currentType === 'x-www-form-urlencoded'" class="body__main__urlencoded">
                <input-table :data="urlencodedParams"
                             :initValue="newUrlencodedValue"
                             @onBlur="onBlur"
                             @onDeleteItem="updateDB"
                             @onCheck="onBlur"
                />
            </div>
            <div v-if="currentType === 'form-data'" class="body__main__form-data">
                <input-table :data="formDataParams"
                             :initValue="newFormDataValue"
                             @onBlur="onBlur"
                             @onDeleteItem="updateDB"
                             @onCheck="onBlur"
                             :boxType="['text', ['text', 'file'], 'text']"/>
            </div>
            <div v-show = "currentType === 'raw'" class="body__main__raw">
                <editor ref="editor"
                        @onBlur="onEditorBlur"
                        :language="formatName[raw.type]"
                        :code="raw.value"/>
            </div>
            <div v-if = "currentType === 'binary'" class="body__main__binary">
                <file v-model="file.file" @onChange="onFileChange"></file>
            </div>
        </div>
    </div>
</template>

<script>
import SubTitle from '@/components/SubTitle'
import Radio from '@/components/Radio'
import InputSelect from '@/components/Input/InputSelect'
import Editor from '@/components/Editor'
import File from '@/components/File'
import {flexObject} from "@/utils/functions";
import db from '@/utils/DB'
import InputTable from '@/components/Input/InputTable'
import {ref} from 'vue'
import {mapState} from 'vuex'
import shortid from 'shortid'
import {setEditorHeight} from "@/layout/_shared";
import {replace} from "@/utils/envReplace";

const FORMAT_NAME = {
    "JSON": "json",
    "Text": "plaintext",
    "HTML": "text/html",
    "XML": "xml",
    "JavaScript": "javascript"
}

export default {
    name: "Body",
    props: {
        height: {
            type: Number,
            default: null
        }
    },
    components:{
        File,
        Radio,
        Editor,
        SubTitle,
        InputSelect,
        InputTable
    },
    setup(props){
        const urlencodedList = ref(null)
        const formDataList = ref(null)
        const editor = ref(null)
        return {
            urlencodedList,
            formDataList,
            editor,
            props
        }
    },
    data(){
        return {
            formatName: FORMAT_NAME,
            value: [
                {name: this.$t('request.body.none'), value: 'none'},
                {name:'x-www-form-urlencoded'},
                {name: 'form-data'},
                {name: this.$t('request.body.raw'), value: 'raw'},
                {name: this.$t('request.body.binary'), value: 'binary'}
            ],
            currentType: 'none',
            textType:[
                {name: "Text", value: 'plaintext'},
                {name: "JSON", value: 'json'},
                {name: "HTML", value: 'text/html'},
                {name: "XML", value: 'xml'},
                {name: "JavaScript", value: 'javascript'},
            ],
            urlencodedParams: [],
            newUrlencodedValue: ['', '', '', true, shortid.generate()],
            formDataParams: [],
            newFormDataValue: ['', '', '', true, shortid.generate()],
            file: null,
            raw: null
        }
    },
    computed: {
        ...mapState({
            requests: state=>state.requests
        })
    },
    created(){
        this.updateInfo()
    },
    methods:{
        updateInfo(){
            this.currentType = this.requests.value.info.bodyType
            this.urlencodedParams = this.requests.value.body['x-www-form-urlencoded'].value
            this.formDataParams = this.requests.value.body['form-data'].value
            this.file = this.requests.value.body['binary'].value
            this.raw = this.requests.value.body['raw'].value
            this.$nextTick(()=>{
                this.editor.updateContent(this.raw.value)
            })
        },
        onChecked(name){
            this.currentType = name
            this.$store.commit('requests/setInfo',{
                path: "bodyType",
                value: name
            })
        },
        onEditorBlur(){
            this.raw.value = this.editor.getValue()
            this.updateDB()
        },
        textTypeOnInput(value){
            this.raw.type = value.name
            this.editor.setLanguage(value.value)
            this.updateDB()
        },
        updateDB(){
            const target = this.requests.value.body[this.currentType]
            db.update('request_body', {
                value: window.online ? target.value : JSON.stringify(target.value)
            },{bid: target.bid})
        },
        onCheckBoxChange(){
            this.updateDB()
        },
        onBlur(index, isChanged){
            isChanged !== false && this.updateDB()
        },
        onFileChange(){
            this.updateDB()
            // console.log(JSON.stringify(this.file))
        },
        onInput(){},
        checkOnClose(index, target){
            this[target].splice(index, 1)
            this.updateDB()
        },
        extraInput(index, target, list, value) {
            this[list].push(this[value])
            this.$nextTick(() => {
                this[value] = ['', '', '', true, shortid.generate()]
                const varBox = target.getElementsByClassName("input-table-var")
                varBox[varBox.length - 1].children[index].children[0].focus()
            })
        },
        async get(){
            const value = {
                value: null,
                type: this.currentType,
                dataType: null
            }
            if(this.currentType === 'x-www-form-urlencoded'){
                value['value'] = (await replace(this.urlencodedParams, [String,String])).reduce((prev, current)=>{
                    if(current[3])
                        prev.append(current[0], current[1])
                    return prev
                }, flexObject({})).value
            }else if(this.currentType === 'form-data'){
                value['value'] =  (await replace(this.formDataParams, [String, String])).reduce((prev, current)=>{
                    if(current[3])
                        prev.append(current[0], current[1])
                    return prev
                }, flexObject({})).value
            }else if(this.currentType === 'raw'){
                value['value'] = this.editor.getValue()
                value['dataType'] = this.raw.type.toLowerCase()
            }else if(this.currentType === 'binary'){
                value['value'] =  this.file.file
            }
            return value
        }
    },
    watch:{
        height: setEditorHeight.call(this, 142)
    }

}
</script>
<style lang="scss">
.body{
    .subtitle__default{
        margin-right: auto;
        margin-left: 2rem !important;
    }
}

</style>

<style scoped lang="scss">
.body{
    padding: .5rem 1.5rem 1.5rem 1.5rem;
    @include layout;
    &__subtitle{
        height: 2.6rem;
        color: var(--font-secondary-grey);
    }

    &__main{

        &__raw{
            margin: 1.5rem -1.5rem -1.5rem;
        }

        &__binary{
            text-align: center;
            padding-top: 2rem;
        }
    }
    .input-table{
        margin-top: .7rem;
    }
}
</style>