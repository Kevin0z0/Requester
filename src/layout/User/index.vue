<template>
    <div class="user">
        <login v-if="!online"></login>
        <info v-if="online"></info>
    </div>
</template>

<script>
import {defineAsyncComponent} from 'vue'

export default {
    name: "User",
    components: {
        Login: defineAsyncComponent(()=>import('./Login')),
        Info: defineAsyncComponent(()=>import('./Info'))
    },
    data(){
        return {
            online: window.online
            // user: this.$store.state.user
        }
    },
}
</script>

<style scoped lang="scss">

</style>