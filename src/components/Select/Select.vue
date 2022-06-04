<template>
    <div class="select" @click="popup" ref="select">
        <span class="iconfont icon-chevron_down" :class="{selected}"></span>
    </div>
    <teleport to="#app">
        <option-list ref="target"
                     v-if="selected"
                     v-model="selected"
                     :data="data"
                     :value="value"
                     :parent="parent"
                     :allowDelete="allowDelete"
                     :allowUpdate="allowUpdate"
                     @onSelect="onSelect"
                     @onDelete="onDelete"
                     @onUpdate="onUpdate"/>
    </teleport>
</template>

<script>
import {ref} from 'vue'
import {pauseEvent} from "@/utils/functions";
import OptionList from '@/components/OptionList'

const selectBus = {
    id: null
}

export default {
    name: "Select",
    emits: ["onSelect", "onDelete", "onUpdate"],
    components: {
        OptionList
    },
    props: {
        value: String,
        data: Array,
        allowDelete: {
            default: false,
            type: Boolean
        },
        allowUpdate: {
            default: false,
            type: Boolean
        },
    },
    setup(props) {
        const select = ref(null)
        const target = ref(null)
        return {
            select,
            props,
            target
        }
    },
    data() {
        return {
            selected: false,
            id: Symbol(),
            bus: selectBus
        }
    },
    mounted(){
        this.observer = new ResizeObserver(this.setPos)
        window.addEventListener('resize', this.setPos)
        this.parent = this.select.parentElement.parentElement
        this.observer.observe(this.parent)
    },
    unmounted(){
        this.observer.disconnect()
        window.removeEventListener('resize', this.setPos)
    },
    methods: {
        setPos(){
            this.target && this.target.setPos()
        },
        popup(e) {
            pauseEvent(e)
            if (this.target?.onBlur) {
                this.target.onBlur()
            } else {
                this.bus.id = this.id
                this.selected = !this.selected
            }
        },
        onSelect(data) {
            this.$emit('onSelect', data)
        },
        onDelete(data) {
            this.$emit('onDelete', data)
        },
        onUpdate() {
            this.$emit('onUpdate', null)
        }
    },
    watch:{
        "bus.id"(){
            if(this.bus.id !== this.id && this.selected){
                this.target.onBlur()
            }
        }
    }
}
</script>

<style scoped lang="scss">
.select {
    .iconfont {
        display: block;
        transition: .2s;
    }

    &ed {
        transform: rotate(180deg);
    }
}

</style>