<template>
    <div class="information">
        <editable-title
            :modelValue="value.info.name || value.info.url || 'Untitled Request'"
            @update:modelValue="value.info.name = $event"
            @onBlur="storeName"
        ></editable-title>
        <div class="information__env">
            <b>Environment</b>
            <input-select size="small"
                          :data="getEnv()"
                          :allowUpdate="false"
                          @onSelect="envOnSelect"
                          :name="name"/>
        </div>

        <div class="information__create">
            <b>Create Time</b>
            <span>{{ value.info.createTime }}</span>
        </div>
        <div class="information__desc" ref="desc">
            <b>Description
                <span class="iconfont icon-edit"
                      @click="edit"
                      v-if="!editDesc"></span>
                <span class="iconfont icon-check"
                      @click="confirmEdit"
                      v-if="editDesc"></span>
                <span class="iconfont icon-close"
                      @click="edit"
                      v-if="editDesc"></span>
            </b>
            <editor :noMargin="true"
                    :code="value.info.description"
                    language="markdown"
                    :beautify="false"
                    ref="editor"
                    v-if="editDesc"
            ></editor>
            <div style="padding: 1rem" v-if="!editDesc">
                <markdown
                    :content="value.info.description"
                    placeholder="no description"/>
            </div>
        </div>
    </div>
</template>

<script>
import {defineAsyncComponent} from 'vue'
import {mapState} from 'vuex'
import db from "@/utils/DB";
import EditableTitle from '@/components/Input/EditableTitle'
import InputSelect from '@/components/Input/InputSelect'
import Markdown from "@/components/Markdown";

const initEnv = [{
    name: "No Environment",
    value: 0,
}]

export default {
    name: "Information",
    components: {
        EditableTitle,
        InputSelect,
        Markdown,
        Editor: defineAsyncComponent(() => import('@/components/Editor')),
    },
    data() {
        return {
            // currentEnv: null,
            editDesc: false,
            name: null
        }
    },
    computed: {
        ...mapState({
            value: state => state.requests.value,
            currentRid: state => state.requests.currentRid,
            envList: state => state.environment.envList
        })
    },
    created() {
        this.updateEnv()
    },
    mounted() {

    },
    methods: {
        updateEnv(){
            this.currentEnv = this.value.info.environment || 0
            if (this.currentEnv) {
                const item = this.envList.get(this.currentEnv)
                if (!item) {
                    this.name = "No Environment"
                    this.currentEnv = 0
                    return
                }
                this.name = item.name
                return
            }
            this.name = "No Environment"
        },
        updateDB(data){
            return db.update('request',
                data,
                {
                id: this.currentRid
            })
        },
        confirmEdit() {
            const data = this.$refs.editor.getValue()
            this.value.info.description = data
            this.editDesc = false
            this.updateDB({
                description: data
            })
        },
        edit() {
            this.editDesc = !this.editDesc
        },
        storeName() {
            this.$store.commit('requests/setInfo', {
                path: 'name',
                value: this.value.info.name,
                id: this.currentRid
            })
        },
        envOnSelect(data) {
            this.currentEnv = data.value
            this.name = data.name
            this.value.info.environment = data.value
            this.updateDB({
                environment: data.value
            })
        },
        getEnv() {
            return Array.from(this.envList).reduce((prev, current) => {
                prev.push({
                    name: current[1].name,
                    value: current[0]
                })
                return prev
            }, [...initEnv])
        }
    },
    watch:{
        "value.info.environment"(){
            this.updateEnv()
        }
    }
}
</script>

<style scoped lang="scss">
.information {
    .editable-title {
        margin-left: -1rem;
        font-size: 1rem;
    }

    [class^="information"] {
        font-size: 1.2rem;
        margin: 2rem 0;
        color: var(--font-primary-black);
    }

    &__create{
        display: unset;
    }

    &__env {
        display: flex;
        align-items: center;

        .input-select {
            &__text {
                width: 12rem !important;
            }
        }
    }

    & > div {
        & > *{
            white-space: nowrap;
        }

        b {
            margin-right: 1.5rem;
            display: flex;
            align-items: center;

            span {
                margin-left: 1.5rem;
                cursor: pointer;

                &:hover {
                    color: var(--primary-color);
                }
            }
        }
    }

    .editor {
        margin-top: 1rem;
    }
}
</style>

<style lang="scss">
.information {
    &__env {
        .input-select {
            &__text {
                width: 12rem !important;
            }
        }
    }
}
</style>