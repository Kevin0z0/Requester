<template>
    <div class="editable-title">
        <h2 class="editable-title__content"
            :class="`editable-title__content__${size}`"
            @blur="onBlur"
            @keydown.enter="onBlur"
            @dblclick="edit"
            ref="name"
            :contenteditable="editable ? 'plaintext-only' : false">
            {{modelValue}}
        </h2>
        <span class="iconfont icon-edit"
              v-show="icon && !editable"
              @click="edit"></span>
    </div>
</template>

<script>
export default {
    name: "EditableTitle",
    data(){
        return {
            editable: false
        }
    },
    emits:['update:modelValue', 'onBlur'],
    props:{
        modelValue: {
            default: "",
            type: String
        },
        icon: {
            default: true,
            type: Boolean
        },
        size: {
            default: 'large',
            type: String
        }
    },
    methods:{
        onBlur(){
            const target = this.$refs.name
            this.editable = false
            const name = target.innerText
            if(name.length && name !== this.modelValue){
                this.$emit("update:modelValue", name)
                this.$emit("onBlur", null)
            }else{
                target.innerText = this.modelValue
            }
            window.getSelection().removeAllRanges()
        },
        edit(){
            this.editable = true
            this.$nextTick(()=>{
                this.$refs.name.focus()
                const range = document.createRange()
                range.selectNodeContents(this.$refs.name)
                window.getSelection().removeAllRanges()
                window.getSelection().addRange(range)
            })
        },
    }
}
</script>

<style lang="scss">
.editable-title {
    padding: 1rem 0;
    display: flex;
    align-items: center;
    &__content {
        display: inline-block;
        margin-right: 1rem;
        padding: 0 1rem;
        max-width: calc(100% - 3rem);
        @include ellipsis(1);

        &:focus {
            outline: none;
        }

        &__small{
            font-size: 1.2rem;
            font-weight: 500;
            overflow: unset;
            text-overflow: unset;
    }
}

span {
    visibility: hidden;
    opacity: 0;
    transition: .2s;
    cursor: pointer;

    &:hover {
        color: var(--primary-color);
    }
}

&:hover {
    span {
        visibility: visible;
        opacity: 1;
    }
}
}
</style>