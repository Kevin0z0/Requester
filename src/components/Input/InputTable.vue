<template>
    <div class="input-table" ref="list">
        <div v-for="(i, index) in data"
             :key="i[4]"
             :class="{
                 'input-table-item-unchecked': !i[uncheckedIndex],
                 'input-table__non-editable': !editable}"
             class="input-table-item input-table-var">
            <input-box v-for="(_, itemIndex) in 3"
                       v-model="i[itemIndex]"
                       :key="_"
                       :type="boxType[itemIndex]"
                       :editable="editable"
                       @onFocus="onFocus(itemIndex)"
                       @onInput="onInput(itemIndex)"
                       @onBlur="onBlur(itemIndex, $event)"
            />
            <div class="input-table-item__box"
                 :class="{'input-table__checkbox': !close}"
                 v-if="checkBox">
                <checkbox v-model="i[3]" @onChange="checkOnChange"/>
            </div>
            <div class="input-table-item__box" v-if="close">
                <close @onClose="checkOnClose(index)" />
            </div>
            <div class="placeholder" v-if="!(checkBox || close)"></div>
        </div>
        <div class="input-table-item" v-if="editable">
            <input-box v-for="(_, index) in 3"
                       v-model="newValue[index]"
                       :key="_"
                       :placeholder="placeholder[index]"
                       :type="boxType[index]"
                       @onInput="extraInput(index)"
            />
            <div class="placeholder"></div>
        </div>
    </div>
</template>

<script>
import shortid from 'shortid'
import InputBox from '@/components/Input/InputBox'
import Checkbox from '@/components/Checkbox'
import Close from '@/components/Close'
import i18n  from "@/i18n";

const $t = i18n.global.t

export default {
    name: "InputTable",
    emits: ['onBlur', 'onDeleteItem', 'onFocus', 'onInput', 'onCheck'],
    components: {
        InputBox,
        Checkbox,
        Close
    },
    props: {
        data: {
            default() {
                return []
            },
            type: Array
        },
        initValue: {
            default() {
                return ["", "", "", true, shortid.generate()]
            },
            type: Array
        },
        placeholder: {
            default(){
                return [$t('request.key'), $t('request.value'), $t('request.description')]
            },
            type: Array
        },
        boxType: {
            default(){
                return ['text', 'text', 'text']
            },
            type: Array
        },
        editable: {
            default: true,
            type: Boolean
        },
        checkBox: {
            default: true,
            type: Boolean
        },
        close: {
            default: true,
            type: Boolean
        },
        uncheckedIndex: {
            default: 3,
            type: Number
        }
    },
    setup(props) {
        return {
            props
        }
    },
    data() {
        return {
            newValue: [...this.props.initValue]
        }
    },
    methods: {
        onBlur() {
            this.props.editable && this.$emit("onBlur", ...arguments)
        },
        onFocus(index){
            this.$emit('onFocus', index)
        },
        onInput(index){
            this.$emit('onInput', index)
        },
        checkOnClose(index) {
            this.props.data.splice(index, 1)
            this.$emit("onDeleteItem")
        },
        checkOnChange(){
            this.$emit('onCheck')
        },
        extraInput(index) {
            this.props.data.push(this.newValue.map(v=>{
                if(typeof(v) === 'function') return v()
                return v
            }))
            this.$nextTick(() => {
                this.newValue = [...this.props.initValue]
                const varBox = this.$refs.list.getElementsByClassName("input-table-var")
                varBox[varBox.length - 1].children[index].children[0].focus()
                this.$emit('onInput', index)
            })
        },
    }
}
</script>

<style lang="scss">
.input-table {
    border: .1rem solid var(--secondary-white);
    background-color: var(--primary-white);

    &__non-editable{
        background-color: var(--tertiary-white) !important;
    }

    &-item {
        display: flex;
        align-items: center;
        font-size: 1.2rem;
        height: 3rem;
        background-color: inherit;
        margin-bottom: .1rem;
        transition: .2s background-color;


        &:hover {
            background-color: var(--tertiary-white);
        }

        &:not(:first-child) {
            border-top: .1rem solid var(--secondary-white);
        }


        &__box {
            padding: 0 1rem;

            &:not(:last-child) {
                border-right: .1rem solid var(--secondary-white);
            }
        }
    }
    &__checkbox{
        width: 7.35rem;
        padding: 0 0 0 2.8rem;
    }

}

</style>