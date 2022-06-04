<template>
    <div class="params" ref="main">
        <sub-title title="Query Params">
            <div class="params__tools">
                <span class="iconfont icon-edit"></span>
                <span class="iconfont icon-help"></span>
            </div>
        </sub-title>
        <input-table :data="params"
                     :initValue="newValue"
                     @onBlur="onBlur"
                     @onFocus="onFocus"
                     @onInput="onInput"
                     @onDeleteItem="flush"
                     @onCheck="flush"
        />
    </div>
</template>

<script>
import {ref} from 'vue'
import SubTitle from '@/components/SubTitle'
import InputTable from '@/components/Input/InputTable'
import {debounce, flexObject} from "@/utils/functions";
import {escape} from "@/utils/functions";
import db from '@/utils/DB'
import {mapState} from 'vuex'
import {replace} from "@/utils/envReplace";

const KEY = 0;
const VALUE = 1;
// const DESCRIPTION = 2;
const CHECK = 3;

export default {
    name: "Params",
    components: {
        SubTitle,
        InputTable
    },
    props: {
        modelValue: String
    },
    emits:['onUpdate', 'update:modelValue'],
    setup(props) {
        const main = ref(null)
        const list = ref(null)
        return {
            props,
            main,
            list
        }
    },
    data() {
        return {
            newValue: ['', '', '',true],
            params: [],
            url: this.modelValue,
            lock: false,
            debounceSQL: debounce((updateURL)=>{
                updateURL && this.$emit('onUpdate', true)
                db.update("request_params", {
                    value:  window.online ? this.params : JSON.stringify(this.params)
                }, {pid: this.$store.state.requests.value.params.pid})
            },500)
        }
    },
    created(){
        // console.log(this.params)
    },
    mounted(){
        // this.flush()
    },
    computed:{
        ...mapState({
            paramsValue: state=>state.requests.value.params
        })
    },
    methods: {
        updateInfo(){
            this.params = this.paramsValue.value
        },
        updateSQL(){
            this.debounceSQL(...arguments)
        },
        onFocus() {
            this.lock = true
        },
        onBlur(index, isChanged) {
            this.lock = false
            isChanged !== false && this.updateSQL(index !== 2)
        },
        onInput() {
            if (!this.lock) return
            let url = this.url
            const len = this.params.length
            if (!len) return this.$emit("update:modelValue", url)
            const arr = []
            for (let i = 0; i < len; i++) {
                if (this.params[i][CHECK]) {
                    if (this.params[i][VALUE]) {
                        arr.push(escape(this.params[i][KEY]) + "=" + this.params[i][VALUE])
                    } else{
                        arr.push(escape(this.params[i][KEY]))
                    }
                }
            }
            if(!arr.length) return this.$emit("update:modelValue", url)
            this.$emit("update:modelValue", url + "?" + arr.join("&"))
        },
        extraInput(index) {
            this.params.push(this.newValue)
            console.log(JSON.stringify(this.paramsValue.value))
            this.$nextTick(() => {
                this.newValue = ['', '', '', true]
                const varBox = this.list.getElementsByClassName("input-table-var")
                varBox[varBox.length - 1].children[index].children[0].focus()
                this.flush()
                this.onFocus()
            })
        },
        checkOnChange() {
            this.flush()
        },
        checkOnClose(index) {
            this.params.splice(index, 1)
            this.flush()
        },
        flush(){
            this.onFocus()
            this.onInput()
            this.onBlur()
        },
        async get(){
            return (await replace(this.params, [String, String]))
                .reduce((prev, current)=>{
                if(current[CHECK])
                    try{
                        prev.append(decodeURIComponent(current[0]), current[1])
                    }catch(e){
                        prev.append(current[0], current[1])
                    }
                return prev
            }, flexObject({})).value
        }
    },
    watch: {
        modelValue: {
            immediate: true,
            handler() {
                const index = this.modelValue.indexOf("?")
                if (index < 0) {
                    this.url = this.modelValue
                    this.params = this.params.filter(v=> !v[CHECK])
                    return
                }
                if (this.lock) return
                const temp = []
                const path = this.modelValue.slice(index + 1)
                this.url = this.modelValue.slice(0, index)
                let ptr = -1
                if (path) {
                    const arr = path.split("&")
                    for(let i = 0; i < arr.length; i++){
                        const item = arr[i]
                        const equal = item.indexOf("=")
                        const val = equal < 0 ?
                            [item, "", "",true] :
                            [item.slice(0, equal), item.slice(equal + 1), "",true]
                        let flag = false
                        // Copy hidden params
                        while(++ptr < this.params.length){
                            const target = this.params[ptr]
                            if(!target[CHECK]){
                                temp.push(target)
                            }else{
                                temp.push(val)
                                flag = true
                                break
                            }
                        }
                        if(!flag) temp.push(val)
                    }
                }
                while(++ptr < this.params.length)
                    if(!this.params[ptr][CHECK])
                        temp.push(this.params[ptr])

                // Copy descriptions
                const tempArr = this.params.reduce((prev, current)=>{
                    current[3] && prev.push([...current])
                    return prev
                }, [])

                for(let i = 0; i < temp.length; i++){
                    const item = temp[i]
                    // if(tempArr[i] && item[3] && tempArr[i][3] && item[0] === tempArr[i][0]){
                    //     item[2] = tempArr[i][2]
                    //     tempArr[i][3] = false
                    //     continue
                    // }
                    for(let j = 0; j < tempArr.length; j++){
                        const t = tempArr[j]
                        if(item[3] && t[3] && item[0] === t[0]){
                            item[2] = t[2]
                            t[3] = false
                            break
                        }
                    }
                }
                this.params.length = 0
                for(let i = 0; i < temp.length; i++){
                    this.params.push(temp[i])
                }
            }
        }
    }
}
</script>

<style lang="scss">
.request {
    .tabs__content {
        height: calc(100% - 3.6rem);
        .pane {
            height: 100%;
        }
    }
}

</style>
<style scoped lang="scss">
.params {
    padding: .5rem 1rem 2rem 1rem;
    @include layout;
    @include tools;
    .input-table{
        margin-top: .7rem;
    }
}
</style>