<template>
    <li class="t-item"
        :itemid="item.id"
        :folder="item.isFolder">
        <div class="t-item__title"
             :class="{'t-item__title_bg': symbol === shared.symbol}"
             draggable="true"
             @drop="drop"
             @dragend="dragEnd"
             @dragover="dragOver"
             @dragstart="dragStart"
             @dragleave="dragLeave"
             @contextmenu.prevent="contextMenu"
             :itemid="item.id"
             :fatherid="item.father_id"
             :folder="item.isFolder"
             ref="item"
        >
            <div class="t-item__arrow" @click="toggle"
                 :class="{'t-item__prevent': shared.status}">
                <span class="iconfont icon-chevron_forward"
                      :class="{'t-item__expand': item.expand}"
                      v-if="item.isFolder"
                ></span>
            </div>
            <p class="t-item__name" @click="expand"
               :class="{'t-item__prevent': shared.status}">
                <span class="iconfont icon-folder"
                      v-if="item.isFolder && item.father_id"></span>
                <editable-title :modelValue="item.name || item.url || itemPlaceholder"
                                @update:modelValue="setName"
                                :icon="false"
                                size="small"
                                ref="title"
                                @onBlur="saveName"/>
            </p>
        </div>
        <ul v-show="item.expand" v-if="item.isFolder">
            <tree-item v-for="(child, index) in itemChildren"
                       :item="child"
                       :father="item"
                       :index="index"
                       :key="index"
                       :empty="empty"/>
            <li v-if="!itemChildren?.length" class="t-item__hint">
               {{ empty }}
            </li>
        </ul>
    </li>
</template>

<script>
import { pauseEvent } from "@/utils/functions"
import EditableTitle from "@/components/Input/EditableTitle"

const shared = {
    status: false,
    element: null,
    symbol: null
}

export default {
    name: "TreeItem",
    components: {
        EditableTitle
    },
    props: {
        item: {
            type: Object,
            default: () => {
                return {}
            }
        },
        father: {
            type: Object,
            default: () => {
                return {}
            }
        },
        index: {
            type: Number
        },
        empty: {
            type:String
        }
    },
    setup(props) {
        return {
            props
        }
    },
    inject:[
        "onDrop",
        "onClick",
        "onFolderClick",
        "onToggle",
        "onAddItem",
        "itemPlaceholder",
        "onContextMenu",
        'onSaveName',
        "folderOnly"
    ],
    data() {
        return {
            symbol: Symbol('item'),
            shared,
        }
    },
    mounted(){
        // console.log(this.item.new)
        if(this.item.new) {
            this.$refs.title.edit()
            this.props.item.new = false
        }
    },
    computed:{
        itemChildren(){
            if(this.folderOnly){
                return this.item.children?.filter(v=>{
                    return v.isFolder
                }) || []
            }
            return this.item.children
        }
    },
    methods: {
        contextMenu(){
            this.onContextMenu(this)
        },
        expand() {
            this.shared.symbol = this.symbol
            if(!this.item.isFolder){
                return this.onClick(this.item.id)
            }
            this.onFolderClick(this.item, this.$refs.item)
            if(this.item.expand) {
                return this.onToggle(this.item, null)
            }
            this.props.item.expand = true
            this.onToggle(this.item, true)
        },
        toggle() {
            if(!this.item.isFolder || !this.item.expand) return this.expand()
            this.props.item.expand = false
            this.onToggle(this.item, false)
        },
        dragStart(e) {
            this.shared.status = true
            shared.element = e.target
            shared.element.style.opacity = "0.5"
        },
        dragOver(e) {
            pauseEvent(e)
            const target = e.target
            if(this.preventMove(target)) return
            target.style = "border: 2px solid var(--primary-color);"
        },
        dragLeave(e){
            const target = e.target
            if(target === shared.element) return
            target.style = ""
        },
        dragEnd() {
            this.shared.status = false
            shared.element.style.opacity = ""
            this.shared.element = null
        },
        drop(e){
            pauseEvent(e)
            const target = e.target
            target.style = ""
            if(this.preventMove(target) ||
                target.getAttribute('itemid') === shared.element.getAttribute('fatherid')) return
            this.onDrop(target, shared.element)
        },
        preventMove(target){
            return (target === shared.element ||
                target.getAttribute('folder') === 'false' ||
                shared.element.getAttribute('fatherid') === '0')
        },
        rename(){
            this.$refs.title.edit()
        },
        saveName(){
            this.onSaveName(this)

        },
        setName(name){
            this.props.item.name = name
        }
    }
}
</script>

<style scoped lang="scss">
.t-item {
    font-size: 1.2rem;

    &__expand {
        transform: rotate(90deg);
    }

    &__title {
        cursor: pointer;
        display: flex;
        align-items: center;
        height: 3rem;
        transition: .2s;
        user-select: none;
        border: 2px solid transparent;
        border-radius: .5rem;

        &_bg{
            background-color: rgba(var(--primary-color-rgb), .1);
        }

        &:hover {
            color: var(--primary-color);
        }
    }

    &__hint{
        color: var(--primary-grey);
        padding: 1rem;
    }

    &__name {
        width: 100%;
        line-height: 3rem;
        white-space: nowrap;

        .editable-title{
            padding: unset;
            display: inline-flex;
            width: calc(100% - 2rem);
        }
    }

    &__prevent{
        pointer-events: none;
    }

    .icon-folder {
        vertical-align: bottom;
    }

    &__arrow {
        padding: .3rem;
        margin-right: .4rem;
        width: 2rem;
        height: 2.3rem;

        .iconfont {
            display: inline-block;
            transition: .2s;
        }
    }

    ul {
        margin-left: 1.4rem;
        border-left: 1px solid var(--font-primary-grey);
        padding-left: .6rem;
    }
}
</style>