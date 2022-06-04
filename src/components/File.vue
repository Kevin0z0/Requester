<template>
    <div class="file" :class="{'file__drag': dragin}"
         @dragenter="dragEnter"
         @drop="drop"
         @dragover="dragOver"
         @dragleave="dragLeave">
        <label v-if="!modelValue.name">
            <input type="file" hidden
                   :onchange="onFileChange"/>
            <img :src="directory" alt="">
            <span class="file__intro">
                {{$t("request.body.dragOrClick")}}
            </span>
        </label>
        <div class="file__obj" v-if="modelValue.name">
            <img :src="fileIcon" alt="">
            <p class="file__intro">
                {{modelValue.name}}
            </p>
            <div class="file__close"  @click="close">
                <span class="iconfont icon-close"></span>
            </div>
        </div>

    </div>
</template>

<script>
import directory from '@/assets/directory.png'
import file from '@/assets/file.png'
import {ref} from 'vue'
import {pauseEvent} from "@/utils/functions";
import requestFile from "@/utils/file";

export default {
    name: "File",
    emits:['update:modelValue', 'onChange'],
    props:{
        modelValue: null
    },
    setup(props){
        const file = ref(null)
        return {
            file,
            props
        }
    },
    data(){
        return {
            directory: directory,
            fileIcon: file,
            dragin: false
        }
    },
    methods:{
        dragEnter(e){
            pauseEvent(e)
            this.dragin = true
        },
        dragLeave(e){
            pauseEvent(e)
            this.dragin = false
        },
        drop(e){
            pauseEvent(e)
            this.onSelected(e.dataTransfer.files[0])
            this.dragin = false
        },
        dragOver(e){
            pauseEvent(e)
        },
        onSelected(value){
            if(!value) return
            this.$emit("update:modelValue", requestFile(value))
            this.$emit("onChange", null)
        },
        onFileChange(e){
            this.onSelected(e.target.files[0])
        },
        close(){
            this.$emit("update:modelValue", requestFile())
            this.$emit("onChange", null)
        }
    },
    mounted(){

    }

}
</script>

<style scoped lang="scss">
    .file{
        display: inline-block;
        user-select: none;
        position: relative;
        &__obj, label{
            width: 30rem;
            height: 15rem;
            padding-top: 4rem;
            display: block;
            cursor: pointer;
            background-color: rgba(var(--primary-color-rgb), .04);
            border-radius: 0.7rem;
            border: .2rem dashed rgba(var(--primary-color-rgb), .20);
        }

        &__drag{
            .file__obj, label{
                background-color: rgba(var(--primary-color-rgb), .1);
            }
        }

        label{
            img{
                transition: .2s;
                width: 4.5rem;
                margin: 0 auto;
                display: block;
                backface-visibility: hidden;
                position: relative;
                z-index: -1;
            }

            &:hover{
                img{
                    transform: scale(1.1);
                }
            }
        }

        &__intro{
            font-size: 1.2rem;
            color: var(--font-secondary-grey);
            text-align: center;
            margin-top: 2rem;
            position: relative;
            z-index: -1;
            display: block;
        }

        &__obj{
            padding-top: 3.5rem;
            img{
                height: 5rem;
                transition: .2s;
                position: relative;
                z-index: -1;
            }
            p{
                margin-top: 1rem;
                padding: 0 6rem;
                @include ellipsis(1)
            }

            &:hover{
                .file__close{
                    opacity: 1;
                    visibility: visible;
                }

                img{
                    transform: scale(1.1);
                }
            }

        }

        &__close{
            width: calc(100% + .1rem);
            height: 100%;
            position: absolute;
            top: 0;
            left: -.1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary-red);
            border-radius: 0.7rem;
            background-color: rgba(var(--primary-white-rgb), .5);
            opacity: 0;
            visibility: hidden;
            transition: .2s;
            .iconfont{
                font-size: 7rem;
            }
        }
    }
</style>