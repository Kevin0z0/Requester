<template>
    <div :class="['stretch_box', {stretch_box__column: height}]" ref="main">
        <div class="stretch_box__main" ref="boxMain" :style="{width: target ? leftWidth : rightWidth, height: target ? bottomHeight : topHeight}">
            <slot name="left"></slot>
            <slot name="top"></slot>
            <div :class="{line__horizontal: width, line__vertical: height, line: true}" ref="line"></div>
        </div>
        <div class="stretch_box__right" :style="{width: target ? rightWidth : leftWidth}" v-if="width">
            <slot name="right"></slot>
        </div>
        <div class="stretch_box__bottom" :style="{height: bottomHeight ? topHeight : bottomHeight}" v-if="height">
            <slot name="bottom"></slot>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue'
import { pauseEvent, debounce } from "@/utils/functions";
import {EventEmitter} from 'events'

export default {
    name: "StretchBox",
    emits: ["onHeightResize", "onWidthResize"],
    props:{
        width: String,
        height: String,
        max: String,
        min: String,
        small: String,
        target: {
            type: Number,
            default: 0
        }
    },
    provide(){
        return {
            setSideBarWidth: () => {
                if(document.getElementsByClassName("side-bar")[0].offsetWidth === 30)
                    this.setWidth([250, "px"], false)
            },
            stretchBoxEvent: this.event
        }
    },
    setup(props){
        const line = ref(null)
        const main = ref(null)
        const boxMain = ref(null)
        return {
            props,
            line,
            main,
            boxMain
        }
    },
    data(){
        return {
            width_: this.parseText(this.width),
            height_: this.parseText(this.height),
            max_: this.parseText(this.max) || [100, "%" ],
            min_: this.parseText(this.min),
            small_: this.parseText(this.small),
            rightWidth: null,
            leftWidth: null,
            topHeight: null,
            bottomHeight: null,
            isSmall: false,
            observer: null,
            event: new EventEmitter()
        }
    },
    methods:{
        parseText(text){
            if(!text) return null
            if(text.includes('px'))
                return [parseFloat(text), 'px']
            return [parseFloat(text), '%']
        },
        setWidth(width, isPercent = false){
            if(!width) return
            if(width[1] === '%'){
                this.setWidthPercent(width[0])
            }else if(width[1] === 'px'){
                if(isPercent) width[0] *= this.main.clientWidth / 100
                this.setWidthPX(width[0])
            }
        },
        setWidthPercent(width){
            this.width_ = [width, '%']
            this.rightWidth = width + "%"
            this.leftWidth = 100 - width + "%"
        },
        setWidthPX(width){
            this.width_ = [width, 'px']
            this.rightWidth = width + "px"
            this.leftWidth = `calc(100% - ${width - 5}px)`
        },
        setHeight(height, isPercent = false){
            if(!height) return
            if(height[1] === '%'){
                this.setHeightPercent(height[0])
            }else if(height[1] === 'px'){
                if(isPercent) height[0] *= this.main.clientHeight / 100
                this.setHeightPX(height[0])
            }
        },
        setHeightPercent(height){
            this.height_ = [height, '%']
            this.topHeight = height + "%"
            this.bottomHeight = 100 - height + "%"
        },
        setHeightPX(height){
            this.height_ = [height, 'px']
            this.topHeight = height + "px"
            this.bottomHeight = `calc(100% - ${height}px)`
        },
        getWidthPercent(width){
            if(width[1] === '%'){
                return width[0]
            }
            return width[0] / this.main.clientWidth * 100
        },
        getHeightPercent(height){
            if(height[1] === '%'){
                return height[0]
            }
            return height[0] / this.main.clientHeight * 100 || 100
        },
        preset(event){
            const originPosition = {
                x: event.x,
                y: event.y
            }
            const main = this.main.getBoundingClientRect()
            const symbol = this.target ? -1 : 1;
            if(this.width){
                const pre = this.getWidthPercent(this.width_)
                return (e) => {
                    let temp = pre + symbol * (e.x - originPosition.x) / main.width * 100
                    const min = this.getWidthPercent(this.min_)
                    const max = this.getWidthPercent(this.max_)
                    const width = this.getWidthPercent(this.width_)
                    if(this.isSmall && temp > min / 2){
                        this.setWidth(this.min_)
                        this.isSmall = false
                    } else if(temp > min && temp < max){
                        this.setWidth([temp, this.width_[1]], true)
                    } else if(temp >= max){
                        this.setWidth(this.max_)
                    } else if(temp < width && width - temp > min / 2){
                        this.setWidth(this.small_)
                        this.isSmall = true;
                    }
                }
            }
            const pre = this.getHeightPercent(this.height_)
            return (e)=>{
                let temp= pre + symbol * (e.y - originPosition.y) / (main.height) * 100
                const min = this.getHeightPercent(this.min_)
                const max = this.getHeightPercent(this.max_)
                const height = this.getHeightPercent(this.height_)
                if(this.isSmall && temp > min / 2){
                    this.setHeight(this.min_)
                    this.isSmall = false
                } else if(temp > min && temp < max){
                    this.setHeight([temp, this.height_[1]], true)
                } else if(temp >= max){
                    this.setHeight(this.max_)
                } else if(temp <= height && height - temp >= min / 2){
                    this.setHeight(this.small_)
                    this.isSmall = true;
                }
            }
        },
        calcMousePosition(event){
            pauseEvent(event)
            if(this.height_ && this.getHeightPercent(this.height_) > 100) this.setHeightPercent(100)
            const mouseMove = this.preset(event)
            const mouseUp = ()=>{
                document.removeEventListener("mousemove", mouseMove)
                document.removeEventListener("mouseup", mouseUp)
            }

            document.addEventListener("mousemove",mouseMove)
            document.addEventListener('mouseup', mouseUp)
        }
    },
    mounted(){
        this.setWidth(this.width_)
        this.setHeight(this.height_)
        this.line.addEventListener("mousedown", this.calcMousePosition)
        const debounceHeight = debounce(obj =>{
            if(this.height){
                this.event.emit('heightResize', {
                    height: obj.height,
                    mainHeight: this.main.offsetHeight
                })
                // this.$emit('onHeightResize', obj.height, this.main.offsetHeight)
            }
            else{
                this.event.emit('widthResize', {
                    width: obj.width,
                    mainWidth: this.main.offsetWidth
                })
                // this.$emit('onWidthResize', obj.width, this.main.offsetWidth)
            }
        }, 50)
        this.observer = new ResizeObserver((entries)=>{
            debounceHeight(entries[0].contentRect)
        });
        this.observer.observe(this.boxMain)
    },
    unmounted(){
        this.observer.disconnect()
        const events = this.event._events
        for (let i in events){
            this.event.removeListener(i, events[i])
        }
    }
}
</script>

<style scoped lang="scss">
    .stretch_box{
        height: 100%;
        display: flex;
        overflow: hidden;
        &__column{
            flex-direction: column;

            & > div{
                width: 100%;
            }
        }

        &__main{
            margin: 0 -.2rem;
            padding-left: .2rem;
            z-index: 10;
        }

        &__main, &__right{
            position: relative;
        }

        .line{
            position: absolute;
            z-index: 9999;
            &__vertical{
                width: 100%;
                height: .5rem;
                margin-left: -.3rem;
                cursor: row-resize;
                bottom: -.2rem;

                &::before{
                    content: "";
                    background-color: var(--font-primary-grey);
                    position: absolute;
                    top: 50%;
                    height: 0.1rem;
                    margin-top: -.1rem;
                    width: 100%;
                }

                &:hover{
                    height: 1.5rem;
                    margin-bottom: -.5rem;

                    &::before{
                        background-color: var(--primary-color);
                    }
                }
            }

            &__horizontal{
                height: 100%;
                width: .5rem;
                top: 0;
                right: 0;
                cursor: col-resize;

                &::before{
                    content: "";
                    background-color: var(--font-primary-grey);
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 50%;
                    width: 0.1rem;
                    margin-left: -.1rem;
                }

                &:hover{
                    width: 1.5rem;
                    margin-right: -.5rem;

                    &::before{
                        background-color: var(--primary-color);
                    }
                }
            }


        }
    }
</style>