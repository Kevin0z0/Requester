<template>
    <div class="dialog pop f-c" ref="main" style="opacity: 0;">
        <div class="pop__bg"></div>
        <div class="dialog__wrap"
             ref="content"
             style="transform: translateY(-10px)">
            <div class="dialog__wrap__title" v-if="titleValue">
                <p class="dialog__wrap__title-name">{{titleValue}}</p>
                <span class="iconfont icon-close" @click="onAction('close', 'close')"></span>
            </div>
            <div class="dialog__wrap__content" v-if="hasMessage">
                <slot>
                    <p>{{ message }}</p>
                </slot>
            </div>
            <div class="dialog__wrap__buttons">
                <div class="dialog__wrap__buttons-left">
                    <r-button v-if="extra" :type="extra.type || 'default'" @click="onAction('extra', extra.text)">
                        {{extra.text}}</r-button>
                </div>
                <div class="dialog__wrap__buttons-right">
                    <r-button v-if="cancel"
                              @click="onAction('cancel',cancel)"
                    >{{getText(cancel)}}</r-button>
                    <r-button v-if="confirm"
                              type="primary"
                              @click="onAction('confirm',confirm)"
                    >{{getText(confirm)}}</r-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {reactive, onMounted, computed, toRefs} from 'vue'
import RButton from "@/components/Button"
import {close, open} from "@/components/Pop/_mixin";

export default {
    name: 'Dialog',
    emits: ["vanish", "action"],
    components:{
        RButton
    },
    props: {
        title:{
            default: "",
            type: String
        },
        confirm: {
            default: null,
            type: [String, Object]
        },
        cancel: {
            default: null,
            type: [String, Object]
        },
        extra: {
            default: null,
            type: Object
        },
        message: {
            default: null
        }
    },
    setup(props, {emit}){
        const state = reactive({
            main: null,
            content: null,
            message: null,
            titleValue: props.title
        })

        const hasMessage = computed(()=>{
            return !!state.message
        })

        const onClose = () => {
            close(state.main, state.content, ()=>{
                emit('vanish')
            })
        }

        onMounted(()=>{
            open(state.main, state.content)
        })

        const getText = obj => {
            if(obj.constructor === String){
                return obj
            }
            if(obj.constructor === Object){
                return obj.text
            }
        }

        const onAction = (status, text) => {
            emit("action", {
                status,
                text: getText(text)
            })
            onClose()
        }

        return {
            ...toRefs(state),
            onAction,
            onClose,
            getText,
            hasMessage,
            props
        }
    }
}

</script>

<style scoped lang="scss">
.dialog{
    &__wrap{
        width: 46rem;
        min-height: 20rem;
        max-height: 50%;
        background-color: var(--primary-white);
        border-radius: .8rem;
        box-shadow: 0 .2rem 3rem -1.2rem rgba(var(--font-secondary-black-rgb), .4);
        display: flex;
        flex-direction: column;

        &__title{
            padding: 1rem;
            color: var(--font-primary-black);
            user-select: none;
            display: flex;
            align-items: center;

            &-name{
                font-size: 1.4rem;
                display: inline-block;
            }

            .iconfont{
                font-size: 2.2rem;
                cursor: pointer;
                transition: .2s;
                margin-left: auto;
                &:hover{
                    color: var(--primary-red);
                }
            }
        }

        &__content{
            flex: 1 1 0;
            padding: 1.5rem;
            font-size: 1.3rem;
        }

        &__buttons{
            display: flex;
            margin: 1.5rem;

            &-right{
                margin-left: auto;

                & > div:not(:last-child){
                    margin-right: 2rem;
                }
            }
        }
    }

}
</style>