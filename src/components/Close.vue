<template>
    <div class="close">
        <span class="iconfont icon-close_circled" @click="close"></span>
    </div>
</template>

<script setup>
const emit = defineEmits(['onClose'])
const close = () => {emit('onClose', null)}
</script>

<style scoped lang="scss">
    .close{
        height: 1.6rem;
        display: block;
        color: var(--primary-red);
        transition: .2s;
        cursor: pointer;
    }
</style>