<template>
    <div class="c_pop">
        <tree :item="items"
              :folderOnly="true"
              empty="No Folders"
              itemPlaceholder="Untitled Request"
              @onFolderClick="onClick"/>
        <div class="c_pop__btn">
            <r-button @click="cancel">Cancel</r-button>
            <r-button type="primary" @click="confirm">Confirm</r-button>
        </div>
    </div>
</template>

<script>
import Tree from '@/components/Tree'
import {mapState} from 'vuex'
import RButton from '@/components/Button'
export default {
    name: "CollectionsPopup",
    emits: ["cancel", "confirm"],
    components:{
        Tree,
        RButton
    },
    setup(props){
        return {
            props
        }
    },
    computed:{
        ...mapState({
            items: state=>state.collections.items
        })
    },
    data(){
        return {
            currentItem: null,
            stack: null
        }
    },
    methods:{
        cancel(){
            this.$emit('cancel')
        },
        confirm(){
            this.$emit('confirm', this.currentItem, this.stack)
        },
        onClick(item, father){
            this.currentItem = item
            this.stack = father
        }
    }
}
</script>

<style scoped lang="scss">
.c_pop{
    height: calc(100% - 6rem);
    .tree{
        padding: 1rem 2rem;
        overflow: auto;
    }
    &__btn{
        display: inline-block;
        float: right;
        margin: .4rem 2rem 0 0;
        div:first-child{
            margin-right: 2rem;
        }
    }
}
</style>