<template>
    <r-header/>
    <stretch-box height="25px"
                 small="25px"
                 min="100px"
                 max="90%"
                 :target="1">
        <template #top>
            <stretch-box width="250px"
                         min="220px"
                         max="300px"
                         small="60px">
                <template #left>
                    <r-nav v-model="isSmall"></r-nav>
                </template>
                <template #right>
                    <router-view v-slot="{ Component }">
                        <transition name='slide'>
                            <keep-alive include="Request">
                                <component :is="Component"/>
                            </keep-alive>
                        </transition>
                    </router-view>
                </template>
            </stretch-box>
        </template>
        <template #bottom>
            <div class="test"></div>
        </template>
    </stretch-box>

</template>

<script>
import {ref} from 'vue'
import RHeader from '@/layout/Header'
import StretchBox from '@/components/StretchBox'
import RNav from '@/layout/Nav'
export default {
    name: "App",
    components: {
        RHeader,
        StretchBox,
        RNav
    },
    data() {
        return {
            isSmall: false
        }
    },
    setup() {
        const request = ref(null)
        return {
            request
        }
    },
    created() {
        this.$router.push('/')
    },
    mounted() {
        document.getElementById("loading").remove()
        document.getElementById('loading_style').remove()
        // this.request.parentElement.remove(this.request)
    },
}
</script>

<style lang="scss">
:root {
    --primary-color: #055FFC;
    --primary-color-rgb: 5, 95, 252;
    --dark-primary-color: #0649c4;
    --dark-primary-color-rgb: 6, 73, 196;
    --primary-red: #FA4F57;
    --dark-primary-red: #d24249;
    --primary-green: #35C75A;
    --primary-yellow: #f5d917;
    --primary-orange: #F0932B;
    --primary-blue: #055FFC;
    --primary-grey: #9FA2AB;
    --font-primary-black: #6E6E6E;
    --font-secondary-black: #27272E;
    --font-secondary-black-rgb: 39, 39, 46;
    --font-primary-grey: #ededed;
    --font-primary-grey-rgb: 237, 237, 237;
    --font-secondary-grey: #9FA2AB;
    --primary-white: #FFFFFF;
    --primary-white-rgb: 255, 255, 255;
    --secondary-white: #f5f5f7;
    --tertiary-white: #fafafa;
}

*,
*::after,
*::before {
    margin: 0;
    padding: 0;
    box-sizing: inherit;
}

html {
    font-size: 62.5%;
    box-sizing: border-box;
    height: 100%;
    overflow-x: auto;
    color: var(--font-secondary-black);
}

body {
    width: 100%;
    height: 100%;
}

a {
    text-decoration: none;
    color: #000;
}

ul {
    list-style: none;
}

i{
    font-style: normal;
}

textarea{
    &::-webkit-input-placeholder {
        color: var(--font-secondary-grey);
    }
    &:focus{
        outline: none;
    }
}

#message-box{
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999999;
    text-align: center;
    max-width: 60%;
}

.pop{
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: 10009;
    background-color: rgba(var(--font-secondary-black-rgb), .4);

    &__bg{
        position: fixed;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
        z-index: -1;
    }
}

#app {
    min-width: 80rem;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.iconfont {
    outline: none;
}

::-webkit-scrollbar {
    background-color: var(--primary-white);
    width: .6rem;
    height: .6rem;
}

::-webkit-scrollbar-button {
    background-color: var(--primary-white);
    height: .4rem;
}

::-webkit-scrollbar-thumb {
    background-color: var(--font-primary-grey);
    border-radius: .5rem;
}

.slide-enter-from,
.slide-leave-to,
.slide-leave-active,
.slide-enter-active {
    position: absolute;
    width: 100%;
    top: 0;
    transition: .3s;
}

.slide-leave-active,
.slide-enter-active {
    opacity: 1;
}

.slide-enter-to {
    transition-delay: .3s;
}

.slide-enter-from,
.slide-leave-to {
    opacity: 0;
}

.placeholder {
    width: 7.35rem;
}

.monaco-editor .view-overlays .current-line {
    border: none !important;
    background-color: rgba(var(--primary-color-rgb), .05);
}


.none {
    font-size: 1.4rem;
    text-align: center;
    color: var(--font-primary-black);
    padding-top: 2rem;
}

$size: 1,2,3,4;
$pos: t, r, b, l;
$position: top, right, bottom, left;

@each $item in $position{
    $i:index($position,$item);
    @each $s in $size{
        .m-#{nth($pos, $i)}-#{$s}{
            margin-#{$item}: #{$s}rem;
        }
    }
}

@each $item in $position{
    $i:index($position,$item);
    @each $s in $size{
        .p-#{nth($pos, $i)}-#{$s}{
            padding-#{$item}: #{$s}rem;
        }
    }
}

.f-a-c{
    display: flex;
    align-items: center;
}

.f-c{
    display: flex;
    align-items: center;
    justify-content: center;
}

</style>
