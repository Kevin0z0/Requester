<template>
    <div class="select-button" ref="main">
        <div v-for="item in value"
             :key="item.name"
             class="select-button__item"
             :class="{'select-button__item-selected': selected === item.value || item.name}"
             @click="onSelect(item.value || item.name)">
            {{ item.name }}
        </div>
        <p class="select-button__block" ref="moveBar"></p>
    </div>
</template>

<script>
// import {ref} from 'vue'
export default {
    name: "SelectButton",
    props:{
        value: {
            default(){return []},
            type: Array
        }
    },
    // setup(props){
    //     const moveBar = ref(null)
    //     const main = ref(null)
    //     const selected = ref(props.value[0].name)
    //     return {
    //         props,
    //         moveBar,
    //         main,
    //         selected
    //     }
    // },
    data(){
        return {
            selected: this.value[0].value || this.value[0].name
        }
    },
    methods:{
        onSelect(name, e){
            if(!e) e = event.target
            this.$refs.moveBar.style = `width: calc(${e.clientWidth}px - 1rem);
            margin-left: calc(${e.offsetLeft}px + 0.5rem)`
            this.selected = name
            this.$emit("onSelect", name)
        },
        init(){
            setTimeout(()=>{
                this.onSelect(this.selected, this.$refs.main.getElementsByClassName('select-button__item')[0])
            }, 0)
        }
    },
    mounted(){
        this.init()
    }
}
</script>

<style scoped lang="scss">
.select-button{
    height: 3.5rem;
    display: inline-flex;
    align-items: center;
    background-color: var(--secondary-white);
    border-radius: .7rem;
    position: relative;
    margin: 1rem 0;
    user-select: none;
    &__item{
        padding: 0 2rem;
        font-size: 1.2rem;
        line-height: 3.5rem;
        cursor: pointer;
        color: var(--font-primary-black);
        position: relative;
        z-index: 1;
        transition: .2s;
        &:hover, &-selected{
            color: var(--font-secondary-black);
        }
    }

    &__block{
        width: 4rem;
        height: 2.5rem;
        background-color: var(--primary-white);
        position: absolute;
        z-index: 0;
        border-radius: .5rem;
        transition: .5s cubic-bezier(0.6, 0.26, 0.1, 1.04);
        box-shadow: rgba(0, 0, 0, .1) 0 0.1rem 0.4rem 0;
    }
}
</style>