<template>
    <div class="editor" ref="textarea" style="width: 100%; height: 200px"> </div>
</template>

<script>
import {ref, markRaw} from 'vue'
import {mapState} from 'vuex'
import {debounce} from "@/utils/functions";
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';
// import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
// const beautify = require('js-beautify')
import beautify from 'js-beautify'

// eslint-disable-next-line no-unused-vars
const noMargin = {
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 0,
    glyphMargin: false,
    folding: false,
    lineNumbers: false,
}

function isJSON(content){
    return /^\W*[[|{].*[\]|}]\W*$/.test(content)
}

function isJS(content){
    return /function.*?(.*?).*?{|(const|let|var).*?=.*?|console.log/.test(content)
}

function isHTML(content){
    return /^\W*(<!DOCTYPE html>|<\W*(template|html|div).*>.*<\W*\/\W*(template|html|div).*>)/i.test(content)
}

function isXML(content){
    return /^\W*<.*?>.*<\/.*?>\W*$/.test(content)
}

export default {
    name: "editor",
    emits:['onBlur'],
    props:{
        code: {
            type: String,
            default: ""
        },
        language: {
            type: String,
            default: 'plaintext'
        },
        readonly: {
            type: Boolean,
            default: false
        },
        beautify: {
            type: Boolean,
            default: true
        },
        noMargin:{
            type: Boolean,
            default: false
        },
        height: {
            type: [Number, String],
            default: null
        }
    },
    setup(props){
        const textarea = ref(null)
        return {
            textarea,
            props
        }
    },
    data(){
        return {
            editor: null,
            debounceSetOptions: debounce(()=>{
                this.editor.updateOptions({
                    minimap:{
                        enabled: this.config.minimap.value === '1'
                    },
                    fontSize: this.config.fontSize.value + "px",
                })
            }, 1000),
            tempValue: null
        }
    },
    computed:{
        ...mapState({
            config: state=>state.settings.General.Editor
        })
    },
    mounted(){
        let lang = this.language
        if(lang === 'auto') lang = this.auto(this.code)
        this.editor = markRaw(monaco.editor.create(this.textarea,{
            value: this.beautify ? this.codeBeautify(this.code, lang) : this.code,
            // language: lang,
            automaticLayout: true,
            readOnly: this.readonly,
            scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
            },
            minimap:{
                enabled: this.config.minimap.value === '1'
            },
            fontSize: this.config.fontSize.value + "px",
            ...(this.noMargin ? noMargin : {})
        }))
        setTimeout(()=>{
            this.setLanguage(lang)
        }, 0)
        this.editor.onDidBlurEditorWidget(()=>{
            if(this.tempValue !== this.getValue())
                this.$emit('onBlur', null)
        })

        this.editor.onDidFocusEditorWidget(()=>{
            !this.readonly && (this.tempValue = this.getValue())
        })

        if(this.height){
            this.setHeight(this.height)
        }
    },
    methods:{
        setLanguage(lang, content){
            if(lang === 'auto'){
                lang = this.auto(content)
            }
            monaco.editor.setModelLanguage(this.editor.getModel(), lang)
        },
        setHeight(height){
            this.textarea.style.height = height + 'px'
        },
        auto(data){
            const content = (data || this.getValue() || "").replace(/\n|\r\n/g, '')
            if(isJSON(content)) return 'json'
            if(isHTML(content)) return 'text/html'
            if(isXML(content)) return 'xml'
            if(isJS(content)) return 'javascript'
            return 'plaintext'
        },
        codeBeautify(content, lang){
            if(content === undefined) content = this.getValue()
            try{
                if(!lang) lang = this.auto(content)
                if(lang === 'plaintext') return content
                if(lang === 'text/html' || lang === 'xml') return beautify.html(content)
                if(lang === 'json') return beautify(JSON.stringify(JSON.parse(content)))
                return beautify(content)
            }catch (e){
                return ""
            }
        },
        getValue(){
            return (this.editor && this.editor.getValue() || "");
        },
        updateContent(content, scroll = true){
            this.editor.getModel().setValue(this.codeBeautify(content))
            scroll && this.editor.setScrollPosition({scrollTop: 0});
        }
    },
    watch:{
        config:{
            deep: true,
            handler() {
                this.debounceSetOptions()
            }
        }
    }
}
</script>

<style lang="scss">
.editor{
    border-top: .1rem solid rgba(var(--font-primary-grey-rgb), .5);
    overflow: hidden;
    .margin{
        width: 0;
    }
}
</style>