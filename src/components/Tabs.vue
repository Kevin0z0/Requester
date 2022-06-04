<template>
    <div class="tabs" ref="main">
        <div class="tabs__bar">
            <div v-for="(i, index) in tabList"
                 :key="index"
                 :class="{
                     'tabs__bar-item': true,
                     'tabs__bar-active': index === pos}"
                 @click="changeTabs(index)">
                {{i[0]}}
            </div>
            <div class="tabs__right f-a-c">
                <slot name="extra"></slot>
            </div>
            <div class="tabs__bar-move">
                <p class="tabs__bar-move__bar"
                   ref="moveBar"
                   style="margin-left: calc(1.1rem);">
                </p>
            </div>
        </div>
        <div class="tabs__content">
            <slot></slot>
        </div>
    </div>
</template>

<script>
import {ref, provide, onMounted} from 'vue'
export default {
    name: "Tabs",
    props:{
        modelValue: String
    },
    setup(props, context){
        const slotList = context['slots'].default()
        const active = ref(props.modelValue)
        const pos = ref(0)
        const main = ref(null)
        const moveBar = ref(null)
        const tabList = slotList.map(v=>{
            return [v.props.label, v.props.name]
        })
        const setPos = (target) => {
            moveBar.value.style = `width: calc(${target.clientWidth}px - 2.2rem);
            margin-left: calc(${target.offsetLeft}px + 1.1rem)`
        }

        const changeTabs = index => {
            const name = tabList[index][1]
            pos.value = index
            active.value = name
            context.emit('update:modelValue', name)
            context.emit('onTabChanged', name)
            setPos(event.target)
        }
        provide('activeName', active)

        onMounted(()=>{
            setPos(main.value.getElementsByClassName("tabs__bar-active")[0])
        })

        return {
            slotList,
            props,
            active,
            changeTabs,
            tabList,
            pos,
            moveBar,
            main
        }
    },
}
</script>

<style scoped lang="scss">
    .tabs{
        &__bar{
            display: flex;
            font-size: 1.2rem;
            font-weight: 900;
            color: var(--font-secondary-grey);
            user-select: none;
            position: relative;

            &-item{
                padding: 1.2rem 1.5rem;
                transition: .2s;
                white-space: nowrap;
                cursor: pointer;

                &:hover{
                    color: var(--font-secondary-black);
                }
            }

            &-active{
                color: var(--font-secondary-black);
            }

            &-move{
                width: 100%;
                position: absolute;
                height: .3rem;
                bottom: 0;

                &__bar{
                    height: .3rem;
                    background-color: var(--primary-color);
                    border-radius: 1rem;
                    transition: .75s cubic-bezier(0.6, 0.26, 0.1, 1.04);
                }
            }
        }

        &__right{
            margin-left: auto;
            margin-right: 1rem;
        }

        &__content{
            margin-right: .5rem;
        }
    }
</style>