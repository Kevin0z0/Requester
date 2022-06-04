<template>
    <div class="option" ref="main" @click="pauseEvent"
         style="transform: translateY(0); opacity: 0">
        <ul class="option__list" ref="list">
            <li class="option__list-item option__list-update"
                v-if="allowUpdate && hasValue" @click="update">
                <span class="option__list-item__text">
                    Save method '{{value}}'
                </span>
            </li>
            <li class="option__list-item"
                v-for="(i, index) in data"
                :key="index"
                @click="run(i, index)">
                <span v-if="i.icon" :class="`iconfont icon-${i.icon}`"></span>
                <span class="option__list-item__text">{{i.name}}</span>
                <span v-if="allowDelete"
                      class="iconfont icon-close"
                      @click="onDelete(i, index)">
                </span>
            </li>
        </ul>
    </div>
</template>

<script>
import {ref} from 'vue'
import {pauseEvent} from "@/utils/functions";
import anime from 'animejs/lib/anime.es.js';

export default {
    name: "OptionList",
    emits:["update:modelValue", "onSelect", "onDelete", "onUpdate", "onBlur"],
    props:{
        parent: HTMLElement,
        modelValue: Boolean,
        data: Array,
        allowDelete: {
            default: false,
            type: Boolean
        },
        allowUpdate:{
            default: false,
            type: Boolean
        },
        value: {
            default: null,
            type: String
        }
    },
    setup(props, context){
        // console.log(props.position)
        const main = ref(null)
        const list = ref(null)
        const selected = ref(props.modelValue)
        const listener = (data, action) => {
            data?.constructor !== MouseEvent && context.emit(action, data)
        }
        const finish = () => {
            context.emit('onBlur', null)
            context.emit('update:modelValue', !selected.value)
        }
        return  {
            props,
            main,
            list,
            finish,
            listener
        }
    },
    computed:{
        hasValue(){
            if(!this.value) return false
            if(!this.data.length) return true
            for(let i = 0; i < this.data.length; i++)
                if(this.data[i].name === this.value) return false
            return true
        }
    },
    methods:{
        setPos(){
            const position = this.parent.getBoundingClientRect()
            const width = Math.max(this.main.offsetWidth - position.width, 0)
            const top = position.y + position.height + 5
            this.main.style.top = `${top}px`
            this.main.style.minWidth = `${position.width}px`
            this.main.style.left = `${position.left - width}px`
            this.list.style = `max-height: calc(100vh - ${top + 20}px)`
        },
        pauseEvent,
        onBlur(){
            anime({
                targets: this.main,
                translateY: 0,
                opacity: 0,
                easing: 'easeInOutQuad',
                duration: 250,
                complete: this.finish
            })
        },
        show(){
            this.setPos()
            anime({
                targets: this.main,
                translateY: 5,
                opacity: 1,
                easing: 'easeInOutQuad',
                duration: 250
            })
        },
        run(data, index){
            data.action && data.action(data, index)
            this.listener(data, 'onSelect')
            this.onBlur(data)
        },
        onDelete(data, index){
            pauseEvent(event)
            this.listener([data, index], "onDelete")
        },
        update(){
            pauseEvent(event)
            this.listener(null, "onUpdate")
            this.onBlur(null)
        },
    },
    mounted(){
        this.show()
        document.addEventListener('click',this.onBlur)
    },
    unmounted(){
        document.removeEventListener('click',this.onBlur)
    }
}
</script>

<style scoped lang="scss">
    .option{
        position: fixed;
        z-index: 10001;
        top: 0;
        left: 0;
        opacity: 0;
        overflow: hidden;
        border-radius: .8rem;
        background-color: var(--primary-white);
        box-shadow: rgba(0,0,0,.2) 0 .1rem .5rem 0;

        &__list{
            font-size: 1.3rem;
            user-select: none;
            overflow-x: hidden;
            overflow-y: auto;

            &-item{
                cursor: pointer;
                color: var(--font-primary-black);
                display: flex;
                align-items: center;

                &__text{
                    flex: 2;
                    padding: 1rem;
                    max-width: 20rem;
                    @include ellipsis(1);
                }

                .iconfont{
                    font-size: 1.8rem;
                    padding-left: 1rem;
                }

                .icon-close{
                    margin-right: 0;
                    visibility: hidden;
                    color: var(--font-secondary-black);
                    padding: 1rem;

                    &:hover{
                        color: var(--primary-red);
                    }
                }

                &:hover{
                    background-color: var(--secondary-white);
                    color: var(--font-secondary-black);
                    .icon-close{
                        visibility: visible;
                    }
                }

            }
        }
    }
</style>