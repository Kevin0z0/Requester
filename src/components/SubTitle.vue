<template>
    <div class="subtitle f-a-c">
        <p class="subtitle__text" :class="'subtitle__text__' + type" v-if="title">{{title}}</p>
        <div class="subtitle__left">
            <slot name="left"></slot>
        </div>
        <div class="subtitle__default">
            <slot></slot>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
    title: String,
    type: {
        default: "default",
        type: String
    }
})
const title = ref(props.title)
</script>

<style scoped lang="scss">
    .subtitle{
        white-space: nowrap;
        &__text{
            font-size: 1.2rem;
            color: var(--font-secondary-grey);
            user-select: none;
            margin-right: 1rem;
            padding: .2rem 0;

            &__default{}
            &__bold{
                font-size: 1.3rem;
                font-weight: 900;
                color: var(--font-secondary-black);

            }
        }

        &__default{
            margin-left: auto;
        }
    }
</style>