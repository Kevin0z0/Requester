<template>
    <div class="radio">
        <label v-for="(i) in value"
               :key="i.name"
               class="radio__wrap f-a-c">
            <input type="radio"
                   class="radio__input"
                   v-model="check"
                   :name="name"
                   :value="i.value || i.name"
                   @change="change(i.value || i.name)"
                   hidden>
            <p class="radio__btn"></p>
            <span class="radio__text">{{i.name}}</span>
        </label>
    </div>
</template>

<script>
import shortid from 'shortid'
import {ref} from 'vue'

export default {
    name: "Radio",
    props:{
        value: Array,
        checked: [String, Number]
    },
    setup(props){
        const name = shortid.generate()
        const check = ref(props.checked)
        return {
            props,
            name,
            check
        }
    },
    methods:{
        change(name){
            this.$emit("onChecked", name)
        }
    },
    watch:{
        checked(){
            this.check = this.checked
        }
    }
}
</script>

<style scoped lang="scss">
    .radio{
        display: flex;

        &__wrap{
            font-size: 1.2rem;
            cursor: pointer;
            user-select: none;
            &:not(:last-child){
                margin-right: 1.4rem;
            }
            &:hover{
                .radio__btn{
                    border: .2rem solid var(--primary-color);
                }
            }
        }

        &__input{
            &:checked{
                ~ .radio__btn{
                     border: .4rem solid var(--primary-color);
                }
                ~ .radio__text{
                    color: var(--font-secondary-black);
                }
            }
        }

        &__btn{
            display: inline-block;
            width: 1.2rem;
            height: 1.2rem;
            border-radius: 3rem;
            border: .2rem solid var(--font-secondary-grey);
            transition: .1s;
            margin-right: .4rem;
        }

        &__text{
            white-space: nowrap;
        }
    }
</style>