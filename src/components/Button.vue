<template>
    <div :class="['button', `button__type-${type}`, `button__size-${size}`]">
        <div class="button__main">
            <slot></slot>
            <div class="button__loading" v-if="loading">
                <loading />
            </div>
        </div>
        <div class="button__right"
             v-if="slotList.includes('right')"
             @click="clickChildren">
            <p class="button__line"></p>
            <slot name="right"></slot>
        </div>
    </div>
</template>

<script>
import {pauseEvent} from "@/utils/functions";
import {defineAsyncComponent} from 'vue'
export default {
    name: "Button",
    components: {
        Loading: defineAsyncComponent(()=>import('@/components/Loading/Small'))
    },
    props:{
        type:{
            default: "default",
            type: String
        },
        size:{
            default: "default",
            type: String
        },
        loading: {
            default: false,
            type: Boolean
        }
    },
    setup(props, context){
        const slotList = []
        for(let i in context['slots']){
            slotList.push(i)
        }
        return {
            props,
            slotList
        }
    },
    methods:{
        clickChildren(e){
            pauseEvent(e)
            const target = e.target.children
            const len = target.length - 1
            target && target[len] && target[len].click()
        }
    }
}
</script>

<style scoped lang="scss">
    .button{
        cursor: pointer;
        display: inline-flex;
        border-radius: .8rem;
        transition: .2s;
        user-select: none;
        overflow: hidden;
        position: relative;

        &__loading{
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(var(--font-primary-grey-rgb), .8);
        }

        & > div{
            display: inline-block;
        }

        &__line{
            width: .1rem;
            height: calc(100% - 2rem);
            background: rgba(var(--font-primary-grey-rgb), .5);
            position: absolute;
            top: 1rem;
            left: 0;
            transition: .2s;
            backface-visibility: hidden;
        }


        &:hover{
            .button__line{
                height: 100%;
                top: 0;
            }
        }

        &__right{
            position: relative;
            padding: 1rem;
            transition: .2s;
        }


        &__main{
            transition: .2s;
            width: 100%;
        }

        &__type{

            &-default{
                background-color: var(--secondary-white);
                color: var(--font-primary-black);

                &:hover{
                    background-color: var(--font-primary-grey);
                }
            }

            &-primary{
                background-color: var(--primary-color);
                color: var(--primary-white);

                &:hover{
                    transform: translateY(-.15rem);
                    box-shadow: 0 .3rem 1.5rem 0 rgba(var(--dark-primary-color-rgb), .2);
                }

                &:active{
                    transform: translateY(0);
                    box-shadow: none;
                }

                .button__main:hover, .button__right:hover{
                    background-color: var(--dark-primary-color);
                }
            }

            &-info{
                border: .2rem solid var(--font-primary-grey);
                color: var(--font-secondary-grey);
            }


            &-error{
                background-color: var(--primary-red);
                color: var(--primary-white);

                &:hover{
                    background-color: var(--dark-primary-red);
                }
            }

            &-forbid{
                background-color: var(--secondary-white);
                color: var(--font-primary-black);
                .button__main{
                    cursor: not-allowed;
                }
            }
        }


        &__size{
            &-default{
                font-size: 1.4rem;
                font-weight: 900;

                .button__main{
                    padding: 1rem 2rem;
                }
            }
        }
    }
</style>