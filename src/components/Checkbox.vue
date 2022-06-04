<template>
    <div class="checkbox">
        <input type="checkbox"
               class="checkbox__hidden"
               :id="id" v-model="checkValue">
        <label :for="id" class="checkbox__label" @click="check">
            <span class="checkbox__checked iconfont icon-check_circled"></span>
            <span class="checkbox__unchecked"></span>
        </label>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import {pauseEvent} from "@/utils/functions";
import shortid from 'shortid'
const props = defineProps({
    modelValue:{
        type: Boolean,
        default: true
    }
})
const emit = defineEmits(['onChange', 'update:modelValue'])
const checkValue = computed({
    get(){
        return props.modelValue
    },
    set(value){
        emit('update:modelValue', value)
        emit('onChange', value)
    }
})
const id = shortid.generate()
const check = (e) => {
    pauseEvent(e)
    checkValue.value = !checkValue.value
}
</script>

<style scoped lang="scss">
    .checkbox{
        width: 1.68rem;
        height: 1.68rem;
        user-select: none;
        &__hidden{
            display: none;

            &:checked ~ .checkbox__label {
                .checkbox__checked{
                    display: block;
                }
                .checkbox__unchecked{
                    display: none;
                }
            }
        }
        &__label{
            cursor: pointer;

            &:hover{
                .checkbox__unchecked{
                    border:.1rem solid var(--primary-green);
                }
            }
        }

        &__checked{
            display: none;
            color: var(--primary-green);
        }

        &__unchecked{
            display: block;
            width: 1.35rem;
            height: 1.35rem;
            border-radius: 2rem;
            border: 0.15rem solid var(--font-secondary-grey);
            margin: .2rem .1rem 0;
        }
    }
</style>