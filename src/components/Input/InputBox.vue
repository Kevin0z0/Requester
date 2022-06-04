<template>
    <div class="input-box">
        <div v-if="modelValue.constructor !== Object && hasText && type !== 'password'" ref="box"
             :class="{'input-box__main-focus': focused, 'input-box__main-hasFile': hasFile}"
             :contenteditable="editable ? 'plaintext-only' : false"
             :placeholder="placeholder"
             class="input-box__main"
             spellcheck="false"
             tabindex="0"
             @blur="onBlur"
             @focus="onFocus"
             @input="onInput"
             @keydown="onEnter"
             @contextmenu="onRightClick"
             @paste="onPaste">
            {{modelValue}}
        </div>
        <div class="input-box__filename f-a-c" v-if="modelValue.constructor === Object && hasFile">
            <span class="input-box__filename-text p-r-1" :title="file.name">{{file.name}}</span>
            <span class="iconfont icon-close" @click="onFileClose"></span>
        </div>
        <label class="input-box__file"
               v-if="hasFile">
            <input hidden
                   type="file"
                   ref="inputFile"
                   :onchange="onFileChange">
            <span class="iconfont icon-file_add"></span>
        </label>
        <input type="password"
               class="input-box__main input-box__password"
               v-if="type === 'password'"
               ref="passwd"
               :value="modelValue"
               @input="onPasswdInput"
               @focus="onPasswdFocus"
               @blur="onBlur"
               @keydown="onEnter"
               :placeholder="placeholder">
    </div>
</template>

<script>
import {pauseEvent} from "@/utils/functions";
import requestFile from '@/utils/file'
import {ref} from 'vue'
import Selection from "@/utils/Selection";
import ContextMenu from "@/utils/contextMenu";
import {getTextMenuFunction, getTextMenuInfo} from "@/utils/plugin";

const delimiters = ["{{", "}}"]

const execMenu = function (){
    return {
        urlEncode: () => {
            this.selection.replace(encodeURIComponent(this.selection.text))
        },
        urlDecode: () => {
            this.selection.replace(decodeURIComponent(this.selection.text))
        },
        plugins: getTextMenuFunction()
    }
}

export default {
    name: "InputBox",
    emits:['update:modelValue', 'onEnter', 'onFocus', 'onBlur', 'onInput'],
    props:{
        modelValue: {
            default: ""
        },
        placeholder: {
            default: "",
            type: String
        },
        type: {
            default: "text",
            type: [String, Array]
        },
        editable: {
            default: true,
            type: Boolean
        },
        inputType: {
            default: null,
            type: String
        },
        env: {
            default: null,
            type: Object
        }
    },
    setup(props){
        const inputFile = ref(null)
        return {
            props,
            inputFile
        }
    },
    data(){
        return {
            focused: false,
            hasFile: this.type.includes('file'),
            hasText: this.type.includes('text'),
            file: null,
            temp: undefined
        }
    },
    created(){
        if(this.modelValue.file){
            this.file = requestFile(this.modelValue.file)
            this.$emit('update:modelValue', {file: this.file})
        }
    },
    methods:{
        onRightClick(){
            const callableObject = {
                selection: new Selection()
            }
            const func = execMenu.call(callableObject)
            ContextMenu.watch("Input", [
                {role: 'undo'},
                {role: 'redo'},
                {role: 'cut', accelerator: 'Ctrl+X'},
                {role: 'copy', accelerator: 'Ctrl+C'},
                {role: 'paste', accelerator: 'Ctrl+V'},
                {type: 'separator'},
                {label:"URL", submenu:[
                        {label: "URL Encode", name: "urlEncode"},
                        {label: "URL Decode", name: "urlDecode"}
                    ]
                },
                ...getTextMenuInfo()
            ], func, callableObject)
        },
        onPasswdFocus(){
            this.temp = this.modelValue
            this.$emit('onFocus', null)
        },
        onPasswdInput(){
            const self = this.$refs.passwd
            this.$emit('update:modelValue', self.value)
            this.$emit('onInput', null)
        },
        saveSelection() {
            let start
            if (window.getSelection && document.createRange) {
                const selection = window.getSelection()
                if (!selection || selection.rangeCount === 0) return
                const range = selection.getRangeAt(0)
                const preSelectionRange = range.cloneRange()
                preSelectionRange.selectNodeContents(this.$refs.box)
                preSelectionRange.setEnd(range.startContainer, range.startOffset)
                start = `${preSelectionRange}`.length
                return {
                    start,
                    end: start + `${range}`.length,
                }
            } else if (document.selection) {
                const selectedTextRange = document.selection.createRange()
                const preSelectionTextRange = document.body.createTextRange()
                preSelectionTextRange.moveToElementText(this.$refs.box)
                preSelectionTextRange.setEndPoint("EndToStart", selectedTextRange)
                start = preSelectionTextRange.text.length
                return {
                    start,
                    end: start + selectedTextRange.text.length,
                }
            }
        },
        restoreSelection(containerEl, savedSel) {
            if (!savedSel) return
            if (window.getSelection && document.createRange) {
                let charIndex = 0
                const range = document.createRange()
                range.setStart(containerEl, 0)
                range.collapse(true)
                const nodeStack = [containerEl]
                let node
                let foundStart = false
                let stop = false
                while (!stop && (node = nodeStack.pop())) {
                    if (node.nodeType === 3) {
                        const nextCharIndex = charIndex + node.length
                        if (
                            !foundStart &&
                            savedSel.start >= charIndex &&
                            savedSel.start <= nextCharIndex
                        ) {
                            range.setStart(node, savedSel.start - charIndex)
                            foundStart = true
                        }
                        if (
                            foundStart &&
                            savedSel.end >= charIndex &&
                            savedSel.end <= nextCharIndex
                        ) {
                            range.setEnd(node, savedSel.end - charIndex)
                            stop = true
                        }
                        charIndex = nextCharIndex
                    } else {
                        let i = node.childNodes.length
                        while (i--) {
                            nodeStack.push(node.childNodes[i])
                        }
                    }
                }
                const sel = window.getSelection()
                sel.removeAllRanges()
                sel.addRange(range)
            } else if (document.selection) {
                const textRange = document.body.createTextRange()
                textRange.moveToElementText(containerEl)
                textRange.collapse(true)
                textRange.moveEnd("character", savedSel.end)
                textRange.moveStart("character", savedSel.start)
                textRange.select()
            }
        },
        setEnv(){
            const input = this.$refs.box
            const reg = new RegExp(`(${delimiters[0]}.*?${delimiters[1]})`, "g")
            console.log(input.innerText.match(reg))
        },
        onPaste(){
            // pauseEvent(e)
            // // const self = e.target
            // let paste = e.clipboardData.getData('text');
            // console.log(paste)
            // const selection = window.getSelection();
            // if (!selection.rangeCount) return false;
            // const text = document.createTextNode(paste)
            // const range = selection.getRangeAt(0)
            // range.insertNode(text);

            // this.setEnv()
        },
        onFocus(e){
            this.temp = this.modelValue
            const range = document.createRange();
            const sel = window.getSelection();
            const target = e.target
            const tailIndex = target.childNodes.length;
            if(tailIndex){
                const tailNode = target.childNodes[tailIndex - 1];
                range.setStart(tailNode, tailNode.length);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
            this.$emit('onFocus', e)
            this.focused = true
        },
        forceUpdate(){
            const selection = new Selection()
            const start = selection.selection.anchorOffset
            const end = start + selection.selection.focusOffset
            this.$emit('update:modelValue', this.$refs.box.innerText)
            this.$nextTick(()=>{
                selection.setRange(this.$refs.box.firstChild, {
                    start: start,
                    end: end
                })
            })
        },
        onBlur(){
            this.$emit('onBlur', this.temp !== this.modelValue)
            this.focused = false
        },
        onInput(e){
            if(!this.editable) return false
            const self = e.target
            const selection = document.getSelection()
            const range = selection.getRangeAt(0)
            let pos = range.startOffset
            const str = self.innerText
            if(this.inputType === "number"){
                self.innerText = self.innerText.replace(/[\D]/g, '')
            }
            const target = self.childNodes[0]
            if(target){
                if(str.length > self.innerText.length) pos--
                range.setStart(target,pos)
                range.setEnd(target, pos)
                selection.removeAllRanges()
                selection.addRange(range)
                // console.log(range)
            }
            this.$emit('update:modelValue', self.innerText)
            this.$emit('onInput', null)
        },
        onEnter(e){
            if (e.keyCode === 13) {
                this.$emit('onEnter', this.temp !== this.modelValue)
                pauseEvent(e)
            }
        },
        onFileChange(){
            const files = this.inputFile.files
            if(files.length) {
                this.file = requestFile(files[0])
                this.$emit('update:modelValue', {file:this.file})
                this.$emit('onInput', null)
            }
            this.onBlur()
        },
        onFileClose(){
            this.file = null
            this.$emit('update:modelValue', "")
            this.inputFile.value = ""
            this.onBlur()
        }
    }
}
</script>

<style lang="scss">
$width: calc(100% - 3.5rem);

.input-table-item-unchecked {
    .input-box {
        &__main, &__filename {
            color: var(--font-secondary-grey);
        }
    }
}

.input-box{
    width: inherit;
    height: inherit;
    flex: 2;
    position: relative;
    background-color: inherit;

    &__password{
        border: none;
        font-size: 1.3rem;
        margin: .2rem 0;
        &:focus{
            outline: none;
        }
        &::-webkit-input-placeholder{
            color: var(--font-secondary-grey);
            font-size: 1.2rem;
        }
    }

    &__main{
        color: var(--font-secondary-black);
        padding: 1rem;
        z-index: 9999;
        background-color: inherit;
        position: absolute;
        width: 100%;
        left: 0;
        top: 0;
        border-radius: .8rem;
        word-break: break-all;
        @include ellipsis(1);

        &:focus{
            outline: none;
        }

        &-focus{
            height: unset;
            min-height: 100%;
            white-space: unset;
            text-overflow: unset;
            z-index: 10000;
        }

        &-hasFile{
            width: $width !important;

        }
    }

    &__file{
        position: absolute;
        right: .6rem;
        top: 50%;
        margin-top: -1rem;
        cursor: pointer;
        .icon-file_add{
            font-size: 2rem;
            color: var(--font-secondary-grey);
            &:hover{
                color: var(--font-secondary-black);
            }
        }
    }

    &__filename{
        max-width: $width;
        position: absolute;
        padding: 0 1rem;
        height: calc(100% - .8rem);
        margin: .4rem 0 .4rem .4rem;
        background: var(--secondary-white);
        border-radius: .6rem;
        user-select: none;

        .icon-close{
            margin-left: auto;
            cursor: pointer;
            transition: .2s;
            &:hover{
                color: var(--primary-red);
            }
        }

        &-text{
            @include ellipsis(1);
        }
    }

    &-placeholder{
        color: var(--font-secondary-grey);
        font-size: 1.2rem;
    }

    [contentEditable]:empty:before{
        content:attr(placeholder);
        color: var(--font-secondary-grey);
        font-size: 1.2rem;
        position: relative;
        cursor: text;
    }
}

.input-table-item{
    .input-box{
        height: 100%;
        &:not(:last-child) {
            border-right: .1rem solid var(--secondary-white);
        }
        &__main{
            padding: .7rem;

            &-focus{
                padding: 0.4rem;
                margin: .2rem;
                border: .1rem solid var(--font-primary-grey);
                width: calc(100% - .4rem);
                border-radius: .4rem;
                min-height: unset;
            }
        }
    }
}
</style>