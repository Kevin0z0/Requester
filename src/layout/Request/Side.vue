<template>
    <side-bar :initTabs="false">
        <template #static>
            <div class="side__nav__icon">
                <span class="iconfont icon-add" @click="add(null)"></span>
            </div>
            <div class="side__nav__icon">
                <span class="iconfont icon-save" @click="save"></span>
            </div>
        </template>
        <pane name="info" label="Information" icon="info" :vif="true">
            <information/>
        </pane>
        <pane name="requests" label="Requests" icon="layers">
            <requests ref="requests"/>
        </pane>
        <pane name="collections" label="Collections" icon="box">
            <collections @addRequest="add"/>
        </pane>
        <pane name="history" label="History" icon="history">
        </pane>
    </side-bar>
</template>

<script>
import {mapState} from 'vuex'
import {defineAsyncComponent} from 'vue'
import {addRequest} from "@/utils/DB/add";
import SideBar from "@/components/SideBar"
import Pane from "@/components/Pane"
import Message from "@/components/Message";

export default {
    name: "Side",
    inject:['setSideBarWidth', 'updateInfo'],
    components:{
        Pane,
        SideBar,
        Requests: defineAsyncComponent(()=>import('./Side/Requests')),
        Information: defineAsyncComponent(()=>import('./Side/Information')),
        Collections: defineAsyncComponent(()=>import('./Side/Collections'))
    },
    data(){
        return {
            small: true,
            currentTab: 0,
            tabs:[
                ["Info", "info"],
                ["Requests", "layers"],
                ['Collections', "collections"],
                ["History", "history"],
            ]
        }
    },
    computed:{
        ...mapState({
            requests: state=>state.requests
        })
    },
    created(){
        // this.sideBar = true
    },
    methods:{
        onTabSelected(value){
            this.small = false
            this.setSideBarWidth()
            this.currentTab = value
        },
        async add(cid, callback){
            const added = await addRequest(cid)
            console.log(added)
            if(!added){
                return Message({
                    message: "Add request failed",
                    type: 'error'
                })
            }
            this.$store.commit('requests/addNewRequest', {
                id: added.rid,
                data: added.result
            })
            this.updateInfo()
            callback && callback(added.result)
        },
        save(){
            if(!this.requests.value.info.father_id){
                this.$refs.requests.onSave(this.requests.value.info, undefined)
            }
        }
    }
}
</script>

<style scoped lang="scss">
.side{
    height: 100%;
    display: flex;
    &__nav{
        width: 3.2rem;
        flex-shrink: 0;
        overflow-y: auto;
        overflow-x: hidden;

        &-selected{
            color: var(--primary-color) !important;
        }

        &__icon{
            padding: .5rem;
            cursor: pointer;
            &:hover{
                & > span{
                    color: var(--primary-color);
                }
            }
            & > span{
                font-size: 1.9rem;
                color: var(--font-secondary-grey);
                transition: .2s;
            }
        }
    }
    &__line{
        margin: .2rem .5rem;
        background-color: var(--secondary-white);
        width: 2.1rem;
        height: .2rem;

    }

    &__content{
        width: calc(100% - 3.2rem);
        height: 100%;
        padding: 1rem;
        overflow-y: auto;
    }

    &__title{
        margin-bottom: 1rem;
    }

}
</style>