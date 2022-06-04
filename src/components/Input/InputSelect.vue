<template>
    <div class="input-select" :class="'input-select__' + size">
        <input type="text"
               class="input-select__text"
               @focus="focus"
               @input="onInput"
               @blur="onBlur"
               @click="clickChildren(false)"
               :readonly="allowUpdate ? false : 'readonly'"
               :value="name" >
        <div class="input-select__select" @click="clickChildren(true)">
            <r-select :data="data"
                      :value="name"
                      :allowDelete="allowDelete"
                      :allowUpdate="allowUpdate"
                      ref="select"
                      @onSelect="onSelect"
                      @onDelete="onDelete"
                      @onUpdate="onUpdate"/>
        </div>
    </div>
</template>

<script>
import RSelect from '@/components/Select/Select'
import {pauseEvent} from "@/utils/functions";
export default {
    name: "InputSelect",
    emits:["onSelect", "onInput", "onDelete", "onUpdate", "onBlur"],
    components:{
        RSelect,
    },
    props:{
        data: {
            type: Array
        },
        name: {
            default: "",
            type: String
        },
        allowDelete: {
            default: false,
            type: Boolean
        },
        allowUpdate:{
            default: true,
            type: Boolean
        },
        size:{
            default: 'default',
            type: String
        },
        uppercase: {
            default: false,
            type: Boolean
        }
    },
    data(){
        return {

        }
    },
    setup(props){
        return {
            props
        }
    },
    methods:{
        clickChildren(back){
            pauseEvent(event)
            const select = this.$refs.select
            if(!select.selected || back){
                select.popup(event)
            }
            // this.$refs.select.click()
        },
        onInput(e){
            const target = e.target
            if(this.uppercase){
                const pos = target.selectionStart
                target.value = target.value.toUpperCase()
                target.selectionStart = target.selectionEnd = pos
            }
            this.$emit("onInput", target.value)
        },
        onSelect(data){
            this.$emit('onSelect', data)
        },
        onDelete(data){
            this.$emit('onDelete', data)
        },
        onUpdate(){
            this.$emit('onUpdate', null)
        },
        focus(event){
            this.allowUpdate && event.target.select()
        },
        onBlur(){
            this.$emit("onBlur", null)
        }
    }
}
</script>

<style lang="scss">
    .input-select{
        display: flex;
        background: var(--secondary-white);
        border-radius: .8rem;
        overflow: hidden;

        &__small{
            border-radius: .4rem;

            .input-select{
                &__text{
                    font-size: 1.2rem;
                    text-align: center;
                    width: 8rem;
                    @include ellipsis(1);
                    padding: 0 .5rem;
                    &[readonly]{
                        cursor: pointer;
                    }
                }

                &__select{
                    padding: .5rem;
                }
            }
        }

        &__text{
            border: none;
            font-size: 1.4rem;
            text-align: center;
            width: 10rem;
            background: var(--secondary-white);
            transition: .2s;

            &:focus{
                outline: none;
            }

            &:hover, &:focus{
                background-color: var(--font-primary-grey);
            }
        }

        &__select{
            padding: 1rem 1rem;
            cursor: pointer;
            &:hover{
                background-color: var(--font-primary-grey);
            }
        }
    }
    .auth{

    }
</style>