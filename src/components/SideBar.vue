<template>
    <div class="side-bar" ref="main">
        <nav class="side-bar__nav">
            <slot name="static"></slot>
            <div class="side-bar__line"></div>
            <div class="side-bar__nav__icon"
                 v-for="(i, index) in slotsList"
                 :key="index"
                 @click="onTabSelected(i)">
                <span :class="{['iconfont icon-' + i.icon]:true, 'side-bar__nav-selected': currentTab === i.name && !small}"></span>
            </div>
        </nav>
        <div class="side-bar__content">
            <h3 class="side-bar__title">{{currentName}}</h3>
            <slot></slot>
        </div>
    </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { provide, ref, inject, onMounted, onUnmounted } from 'vue'
export default {
    name: "SideBar",
    props:{
        initTabs: {
            default: true,
            type: Boolean
        }
    },
    setup(props, {slots}){
        const showLine = !!slots.static
        const slotsList = slots.default().map(({props})=>{
            return {
                label: props.label,
                icon: props.icon,
                name: props.name
            }
        })
        const small = ref(true)
        const setSideBarWidth = inject('setSideBarWidth')
        const event = inject('stretchBoxEvent')
        let currentTab = ref(null)
        let currentName = ref(null)
        if(props.initTabs){
            currentTab = ref(slotsList[0].name)
            currentName = ref(slotsList[0].label)
        }
        const main = ref(null)

        const onWidthResize = ()=>{
            small.value = main.value.offsetWidth === 30
        }
        onMounted(()=>{
            event.on("widthResize", onWidthResize)
        })
        provide('activeName', currentTab)
        const onTabSelected = (item) => {
            small.value = false
            currentTab.value = item.name
            currentName.value = item.label
            setSideBarWidth()
        }
        return {
            main,
            props,
            small,
            showLine,
            slotsList,
            currentTab,
            currentName,
            onTabSelected
        }
    }
}
</script>

<style lang="scss">
.side-bar{
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

        .pane{
            height: calc(100% - 2.6rem);
        }
    }

    &__title{
        margin-bottom: 1rem;
        color: var(--primary-grey);
    }

}
</style>