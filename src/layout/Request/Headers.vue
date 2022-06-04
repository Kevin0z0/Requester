<template>
    <div class="headers input_main">
        <sub-title title="Headers">
            <div class="headers__tools">
                <span class="iconfont icon-edit"></span>
                <span class="iconfont icon-trash"></span>
                <span class="iconfont icon-help"></span>
            </div>
            <template #left>
                <span class="iconfont" :class="{'icon-hide': hide, 'icon-show': !hide}" @click="hideHeaders"></span>
            </template>
        </sub-title>
        <div class="headers__table" ref="list">
            <div v-if="hide">
                <input-table :data="staticHeaders"
                             :editable="false"
                             :checkBox="false"
                             :close="false"/>
                <input-table :data="defaultHeaders"
                             :editable="false"
                             :close="false"
                             @onCheck="onDefaultHeaderChange"/>
            </div>
            <input-table :data="headers"
                         :initValue="newValue"
                         @onBlur="updateSQL"
                         @onDeleteItem="updateSQL"
                         @onCheck="updateSQL"
            />
        </div>
    </div>
</template>

<script>
import SubTitle from '@/components/SubTitle'
import {flexObject} from "@/utils/functions";
import shortid from 'shortid'
import {ref} from 'vue'
import {mapState} from 'vuex'
import db from '@/utils/DB'
import InputTable from '@/components/Input/InputTable'
import {replace} from "@/utils/envReplace";

export default {
    name: "Headers",
    components: {
        SubTitle,
        InputTable
    },
    setup() {
        const list = ref(null)
        return {
            list
        }
    },
    data: function () {
        return {
            newValue: ["", "", "", true, shortid.generate()],
            staticHeaders: [
                ["Cache-Control", "no-cache", "", true],
                ["Accept-Encoding", "gzip, deflate, br", "", true]
            ],
            defaultHeaders: [
                ["Requester-Token", "<auto calculate>", "", true],
                ["Host", "<auto calculate>", "", true],
                ["User-Agent", "Requester/0.1 beta", "", true],
                ["Accept", "*/*", "", true],
                ["Connection", "keep-alive", "", true],
            ],
            headers: [],
            hide: true
        }
    },
    created() {
        this.updateInfo()
    },
    computed: {
        ...mapState({
            request: state => state.settings.General.Request,
            headerState: state => state.requests.value.headers
        })
    },
    methods: {
        judgeStaticHeader(data) {
            return data !== '0'
        },
        updateInfo() {
            this.headers = this.headerState.value
            this.initDefaultHeaders()
        },
        updateSQL(index, isChanged) {
            isChanged !== false &&
            db.update("request_headers", {
                value: window.online ? this.headers : JSON.stringify(this.headers)
            }, {hid: this.headerState.hid})
        },
        extraInput(index) {
            this.headers.push(this.newValue)
            this.$nextTick(() => {
                this.newValue = ['', '', '', true, shortid.generate()]
                const varBox = this.list.getElementsByClassName("input-table-var")
                varBox[varBox.length - 1].children[index].children[0].focus()
            })
        },
        hideHeaders() {
            this.hide = !this.hide
        },
        addItems(items, obj) {
            for (let i of items) {
                const temp = i[3]
                if ((temp.constructor === Boolean && temp) || temp.value)
                    obj.append(i[0], i[1])
            }
        },
        onDefaultHeaderChange() {
            let num = 0
            for (let i in this.defaultHeaders) {
                num += (this.defaultHeaders[i][3] + 0) << i
            }
            this.headerState.defaultValue = num
            db.update("request_headers", {
                defaultValue: num
            }, {hid: this.headerState.hid})
        },
        initDefaultHeaders() {
            const num = this.headerState.defaultValue
            for (let i = this.defaultHeaders.length - 1; i >= 0; i--) {
                this.defaultHeaders[i][3] = !!((num >> i) & 1)
            }
        },
        async get() {
            const obj = flexObject({})
            this.addItems(this.staticHeaders, obj)
            this.addItems(this.defaultHeaders, obj)
            obj.value['Host'] = !!obj.value['Host']
            obj.value['Requester-Token'] = !!obj.value['Requester-Token']
            return (await replace(this.headers, [String, String])).reduce((prev, current) => {
                if (current[3])
                    prev.append(current[0], current[1])
                return prev
            }, obj).value
        }
    },
    watch: {
        "request.noCache.value": {
            immediate: true,
            handler() {
                this.staticHeaders[0][3] = this.judgeStaticHeader(this.request.noCache.value)
            }
        },
        "request.acceptEncoding.value": {
            immediate: true,
            handler() {
                this.staticHeaders[1][3] = this.judgeStaticHeader(this.request.acceptEncoding.value)
            }
        }
    }
}
</script>

<style scoped lang="scss">
.headers {
    padding: .5rem 1rem 2rem 1rem;
    @include layout;
    @include tools;
    &__table{
        margin-top: .7rem;
    }

    &__default {
        background-color: var(--tertiary-white);
    }

    &__hide-headers {
        font-size: 1.2rem;
    }
}
</style>