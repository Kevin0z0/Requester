<template>
    <div class="env" v-if="currentEnvID">
        <stretch-box width="30px"
                     small="30px"
                     min="250px"
                     max="50%" :target="1">
            <template #left>
                <div class="env__wrap" style="padding: 1rem;" ref="list">
                    <editable-title
                        v-model="name"
                        @onBlur="onBlur" ref="editTitle"/>
                    <input-table :data="currentEnvContent"
                                 :initValue="newValue"
                                 :placeholder="['Variable', 'Initial Value', 'Current Value']"
                                 @onBlur="updateSQL"
                                 @onCheck="updateSQL"
                                 @onDeleteItem="updateSQL"
                    />
                </div>
            </template>
            <template #right>
                <side-bar>
                    <template #static>
                        <div class="side-bar__nav__icon">
                            <span class="iconfont icon-add" @click="addEnvironment"></span>
                        </div>
                    </template>
                    <pane name="information" label="Information" :vif="true" icon="info">
                        1
                    </pane>
                    <pane name="environments" label="Environments" :vif="true" icon="layers">
                        <envs @update="updateInfo"/>
                    </pane>
                </side-bar>
            </template>
        </stretch-box>
    </div>
    <div v-else class="add-env">
        <h1>You have no Environment here</h1>
        <p @click="addEnvironment">click here to add new Environment</p>
    </div>
</template>

<script>
import db from "@/utils/DB"
import {mapState} from 'vuex'
import shortid from 'shortid'
import Pane from '@/components/Pane'
import SideBar from '@/components/SideBar'
import StretchBox from '@/components/StretchBox'
import Envs from '@/layout/Environment/Side/Envs'
import InputTable from '@/components/Input/InputTable'
import EditableTitle from '@/components/Input/EditableTitle'

import {getEnvironment} from "@/utils/DB/get"
import {addEnvironment} from "@/utils/DB/add"

const IS_NEW = 5

export default {
    name: "Environment",
    components: {
        Envs,
        Pane,
        SideBar,
        InputTable,
        StretchBox,
        EditableTitle
    },
    data() {
        return {
            newValue: ["", "", "", true, shortid.generate, 1],
            env: [],
            currentEnvContent: [],
            currentEnvID: null,
            name: undefined
        }
    },
    computed: {
        ...mapState({
            environment: state => state.environment
        })
    },
    created() {
        this.env = this.environment.envList
        if(this.environment.currentEnvID) this.updateInfo()
    },
    methods: {
        async addEnvironment(){
            const id = await addEnvironment()
            const result = await getEnvironment(id)
            this.environment.envList.set(id, result)
            this.environment.envContentList.set(id, [])
            this.environment.currentEnvID = id
            this.updateInfo()
            this.$nextTick(()=>{
                this.$refs.editTitle.edit()
            })
        },
        onBlur(){
            this.environment.envList.get(this.currentEnvID).name = this.name
            db.update("environment", {
                name: this.name
            }, {
                id: this.currentEnvID
            })
            window.getSelection().removeAllRanges()
        },
        updateInfo(id) {
            if(id !== undefined)
                this.environment.currentEnvID = id
            this.currentEnvID = this.environment.currentEnvID
            if(!this.currentEnvID) return
            this.name = this.env.get(this.currentEnvID).name
            this.$store.dispatch("environment/getContent", this.currentEnvID).then(v=>{
                v && (this.currentEnvContent = v)
            })
        },
        updateSQL(_, isChanged){
            if(isChanged !== false){
                const newItem = this.currentEnvContent.at(-1)
                if(newItem && newItem[IS_NEW]){
                    if(newItem[1] && !newItem[2]){
                        newItem[2] = newItem[1]
                        newItem.length--
                    }else if(!newItem[1] && newItem[2]){
                        newItem.length--
                    }
                }
                db.update("environment", {
                    value: window.online ? this.currentEnvContent : JSON.stringify(this.currentEnvContent)
                }, {
                    id: this.currentEnvID
                })
            }
        }
    }
}
</script>

<style scoped lang="scss">
.env {
    height: 100%;
    .input-table{
        margin-top: .7rem;
    }

    &__wrap{
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        margin-right: .6rem;
    }
}

.add-env{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    flex-direction: column;

    p{
        font-size: 1.4rem;
        color: var(--primary-color);
        cursor: pointer;
        margin-top: 1rem;
        border-bottom: 1px solid transparent;
        &:hover{
            border-bottom-color: var(--primary-color);
        }
    }
}
</style>