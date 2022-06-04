<template>
    <div class="side-envs">
        <div v-for="item in getList" class="side-envs__item"
             :key="item[0]"
             @click="changeID(item[0])">
            <span class="side-envs__block" :class="{'side-envs__block-show': item[0] === currentID}"></span>
            <span class="side-envs__name">{{ item[1].name }}</span>
            <span class="iconfont icon-trash" @click="deleteItem(item[0])"></span>

        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex'
import {h} from 'vue'

const {pauseEvent} = require("@/utils/functions");
const {deleteEnv} = require("@/utils/DB/delete");
const {limitLength} = require("@/layout/_shared");
import dialog from "@/components/Pop/Dialog";
export default {
    name: "Envs",
    emits:['update'],
    computed:{
        ...mapState({
            envList: state=>state.environment.envList,
            currentID: state=>state.environment.currentEnvID
        }),
        getList(){
            return Array.from(this.envList).reverse()
        }
    },
    created(){

    },
    methods:{
        changeID(id){
            this.$emit("update", id)
        },
        deleteItem(id){
            pauseEvent(event)
            dialog({
                title: "Do you want to save?",
                message: h('p', null, [
                    h('span', null, 'This environment '),
                    h('b', {style: "color: var(--font-secondary-black); word-break: break-all;"}, limitLength(this.envList.get(id).name)),
                    h('span', null, ' will be deleted. Are you sure?')
                ]),
                cancel: {
                    text: "Cancel"
                },
                extra:{
                    text: "Delete",
                    type: "error"
                }
            }).then(v=>{
                if(v === 'Delete'){
                    deleteEnv(id).then((eid)=>{
                        this.$emit("update", eid)
                    })
                }
            }).catch(v=>v)
        }
    }
}
</script>

<style scoped lang="scss">
.side-envs{
    margin-left: -1rem;

    .icon-trash{
        transition: .2s;
        display: none;
        &:hover{
            color: var(--primary-red);
        }
    }
    &__block{
        display: inline-block;
        height: 2rem;
        width: .3rem;
        border-left: .3rem solid var(--primary-color);
        visibility: hidden;
        margin-right: .8rem;

        &-show{
            visibility: visible;
        }
    }

    &__name{
        width: 100%;
        @include ellipsis(1);
    }

    &__item{
        display: flex;
        align-items: center;
        font-size: 1.2rem;
        cursor: pointer;
        transition: .2s;
        height: 3rem;
        user-select: none;
        &:hover{
            color: var(--primary-color);

            .side-envs__name{
                width: calc(100% - 1.4rem);
            }

            .icon-trash{
                display: block;
            }
        }
    }
}
</style>