<template>
    <div class="tree">
        <ul class="tree__list">
            <tree-item v-for="(i, index) in item"
                       :key="i.cid"
                       :father="item"
                       :index="index"
                       :item="i"
                       :empty="empty"/>
        </ul>
    </div>
</template>

<script>
import TreeItem from './TreeItem'
import {insertItem} from "./_shared";

export default {
    name: "Tree",
    components:{
        TreeItem
    },
    emits: ['onDrop', 'onToggle', 'onAddItem', 'onItemClick', "onContextMenu", "onNameChange", "onFolderClick"],
    props:{
        item:{
            type: Array,
            default: ()=>[]
        },
        itemPlaceholder:{
            type: String,
            default: ""
        },
        empty: {
            type: String,
            default: "empty"
        },
        folderOnly:{
            type: Boolean,
            default: false
        }
    },
    setup(props){
        return {
            props
        }
    },
    provide(){
       return {
           onDrop: this.onDrop,
           onToggle: this.onToggle,
           onAddItem: this.addItem,
           itemPlaceholder: this.itemPlaceholder,
           onClick: this.onItemClick,
           onContextMenu: this.onContextMenu,
           onSaveName: this.onNameChange,
           folderOnly: this.folderOnly,
           onFolderClick: this.onFolderClick
       }
    },
    data(){
        return{

        }
    },
    methods:{
        onItemClick(id){
            this.$emit('onItemClick', id)
        },
        onFolderClick(item, element){
            this.$emit('onFolderClick', item, this.search(this.getStack(element)))
        },
        onToggle(target, isExpand){
            this.$emit("onToggle", target, isExpand)
        },
        getStack(target){
            const stack = []
            while(target.className !== 'tree'){
                target = target.parentElement
                const id = target.getAttribute('itemid')
                id && stack.push({
                    id: parseInt(id),
                    isFolder: target.getAttribute('folder') === 'true'
                })
            }
            return stack
        },
        onDrop(target, element){
            const eleStack = this.getStack(element)
            const targetStack = this.getStack(target)
            const father = this.search(targetStack)
            const son = this.search(eleStack, true)
            if(!father.isFolder) return
            // console.log(father, son)
            insertItem(father, son.item)
            son.item.father_id = father.id
            son.father.children.splice(son.index, 1)
            this.$emit("onDrop", father, son.item)
        },
        search(arr, getIndex){
            let obj = this.item
            let index = null
            let father = null
            while(arr.length){
                const item = arr.pop()
                const target = obj.children || obj
                for(let j in target){
                    const i = target[j]
                    if(i.id === item.id && !!i.isFolder === !!item.isFolder){
                        obj = i
                        if(getIndex) {
                            index = parseInt(j)
                            arr.length === 1 && (father = obj)
                        }
                        break
                    }
                }
            }
            if(getIndex) return {
                index,
                father,
                item: obj
            }
            return obj
        },
        addItem(item){
            this.$emit('onAddItem', item)
        },
        onContextMenu(self){
            this.$emit('onContextMenu', self)
        },
        onNameChange(self){
            this.$emit('onNameChange', self)
        }
    }
}
</script>

<style scoped lang="scss">
.tree{
    padding: 1rem 0;
    overflow: auto;
    height: 100%;
    &__list{
        display: inline-block;
        min-width: 100%;
        padding-right: 1rem;
        margin-bottom: 1rem;
    }
}

</style>