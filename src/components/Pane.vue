<template>
    <div class="pane" v-if="vif && name === active">
        <slot></slot>
    </div>
    <div v-else-if="!vif" v-show="name === active" class="pane">
        <slot></slot>
    </div>
</template>

<script>
import { inject } from 'vue'
export default {
    name: "Pane",
    props:{
        name: String,
        label: String,
        icon: String,
        vif: {
            default: false,
            type: Boolean
        }
    },
    setup(){
        const active = inject('activeName')
        return {
            active
        }
    }
}
</script>

<style scoped>

</style>