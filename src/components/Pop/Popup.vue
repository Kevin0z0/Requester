<template>
    <teleport to="#app" v-if="props.modelValue">
        <div class="popup pop f-c" ref="main" style="opacity: 0">
            <div class="pop__bg" @click="onClose"></div>
            <div class="popup__wrap"
                 ref="content"
                 style="transform: translateY(-10px)">
                <div class="popup__wrap__title" v-if="title">
                    <p class="popup__wrap__title-name">{{title}}</p>
                    <span class="iconfont icon-close" @click="onClose"></span>
                </div>
                <div class="popup__wrap__content">
                    <slot></slot>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script setup>
import {ref, watch, nextTick } from 'vue'
import {open, close} from './_mixin'

const emits = defineEmits(["update:modelValue"])
const props = defineProps({
    modelValue: {
        default: false,
        type: Boolean
    },
    title: {
        type: String
    }
})
const title = ref(props.title)
const main = ref(null)
const content = ref(null)
const onClose = () => {
    close(main.value, content.value, ()=>{
        emits('update:modelValue', false)
    })
}

watch(()=>props.modelValue, value=>{
    nextTick(()=>{
        if(value) {
            open(main.value, content.value)
        }
    })
})

defineExpose({
    onClose
})

</script>
<style scoped lang="scss">
.popup{
    &__wrap{
        width: 40%;
        min-width: 60rem;
        height: 70%;
        background-color: var(--primary-white);
        border-radius: .8rem;
        overflow: hidden;
        box-shadow: 0 .2rem 3rem -1.2rem rgba(var(--font-secondary-black-rgb), .4);

        &__title{
            padding: 1rem;
            color: var(--font-primary-black);
            user-select: none;
            //border-bottom: .1rem solid var(--secondary-white);
            &-name{
                font-size: 1.6rem;
                font-weight: 900;
                margin-left: 50%;
                transform: translateX(-50%);
                display: inline-block;
            }

            .iconfont{
                float: right;
                font-size: 2.2rem;
                cursor: pointer;
                transition: .2s;
                &:hover{
                    color: var(--primary-red);
                }
            }
        }

        &__content{
            height: calc(100% - 4.2rem);
            overflow-x: hidden;
            overflow-y: auto;
        }
    }
}

</style>