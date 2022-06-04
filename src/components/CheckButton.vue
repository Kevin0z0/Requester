<template>
    <div class="check-button"
         :class="{
            [`check-button__checked check-button__checked-${type}`]: value,
            [`check-button__ratio`]: screenRatio,
            'check-button__ratio__checked': value && screenRatio
         }"
         @click="change">
        <span class="check-button__block"></span>
    </div>
</template>

<script setup>
// eslint-disable-next-line no-unused-vars
import {ref, computed} from 'vue'
const props = defineProps({
    modelValue: {
        type: [Boolean, String]
    },
    type:{
        default: "green",
        type: String
    }
})
const emits = defineEmits(['update:modelValue'])
const getFlag = ()=>{
    return props.modelValue.constructor === Boolean
}
const value = computed({
    get: ()=>{
        return getFlag() ? props.modelValue : (props.modelValue !== '0')
    },
    set: (data)=>{
        emits('update:modelValue', getFlag() ? data : (data ? "1" : "0"))
    }
})

const change = () => {
    value.value = !value.value
}
const screenRatio = window.devicePixelRatio * 20 % 2
</script>

<style scoped lang="scss">
.check-button{
    width: 4.2rem;
    height: 2.4rem;
    background-color: var(--font-primary-grey);
    display: inline-block;
    border-radius: 5rem;
    padding: .2rem;
    transition: .2s;
    cursor: pointer;
    overflow: hidden;

    &:hover{
        .check-button__block{
            box-shadow: .2rem .1rem .7rem -.3rem rgba(#000, .5);
        }
    }

    &:active{
        .check-button__block{
            width: 2.8rem;
        }
    }

    &__block{
        width: 2rem;
        height: 2rem;
        background-color: #fff;
        display: block;
        border-radius: 3rem;
        transition: 0.2s ease-out;
        backface-visibility: hidden;
    }

    &__checked{
        &-green{
            background-color: var(--primary-green);
        }
        .check-button__block{
            margin-left: 1.8rem;
        }
        &:active{
            .check-button__block{
                width: 2.8rem;
                margin-left: 1rem;
            }
        }
    }

    &__ratio{
        height: 2.5rem;
        padding: .25rem;
        &__checked{
            .check-button__block{
                margin-left: 1.75rem;
            }
        }
    }
}
</style>