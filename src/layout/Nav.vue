<template>
    <ul class="nav">
        <li v-for="(i, index) in value" :key="i.name">
            <p class="nav__separator" v-if="i.name.startsWith('_')"></p>
            <router-link :to="i.router" v-else @dblclick="spread(index)">
                <span :class="['iconfont', i.icon]"></span>
                <span class="nav__name">{{ i.name }}</span>
                <span :class="{
                    'iconfont': true,
                    'icon-chevron_backward': true,
                    'icon__rotate': arrow[index]
                }" @click="spread(index)" v-if="i.content?.length"></span>
            </router-link>
            <div :class="{ 'nav__list': true, 'nav__list-show': arrow[index] }" v-if="i.content?.length">
                <p v-for="(j, index) in i.content" :key="index" class="nav__list-item">
                    <span :style="`background-color: var(--primary-${j.color})`" class="nav__list-item__color"></span>
                    <span class="nav__list-item__name">{{ j.name }}</span>
                </p>
            </div>
        </li>
    </ul>
</template>

<script>
import { pauseEvent } from '@/utils/functions'
export default {
    name: "Nav",
    data() {
        return {
            arrow: {},
            value: [
                {
                    name: this.$t("main.dashboard"),
                    icon: "icon-dashboard",
                    router: "/"
                },
                {
                    name: this.$t("main.request"),
                    icon: "icon-rocket",
                    router: "/request"
                },
                {
                    name: "_1"
                },
                {
                    name: this.$t("main.environment"),
                    icon: "icon-pie_chart",
                    router: "/environment",
                },
                // {
                //     name: "Teams",
                //     icon: "icon-group",
                //     router: "/teams"
                // },
                {
                    name: "_2"
                }
            ]
        }
    },
    methods: {
        spread(index) {
            pauseEvent(event)
            const item = this.arrow[index]
            item ? this.arrow[index] = !item : this.arrow[index] = true
        }
    }
}
</script>

<style lang="scss" scoped>
.nav {
    margin-right: .75rem;
    padding: 2rem 2rem 1rem 2rem;
    height: 100%;
    overflow-y: auto;

    li {
        margin-bottom: 2rem;
    }

    a {
        display: flex;
        align-items: center;
        padding: .6rem 0 .6rem .8rem;
        border-radius: .8rem;
        color: var(--font-secondary-grey);
        transition: .2s;
        border: .2rem solid transparent;

        &:hover {
            background: var(--primary-color);
            color: var(--primary-white);
        }

        &:focus{
            outline: none;
            border: .2rem solid var(--primary-color);
        }
    }

    .iconfont {
        font-size: 2.2rem;
        margin-right: 1rem;
    }

    .icon {
        &-chevron_backward {
            font-size: 1.8rem;
            transition: .2s;

            &:hover {
                transform: scale(1.2);
            }
        }

        &__rotate {
            transform: rotate(-90deg);

            &:hover {
                transform: rotate(-90deg) scale(1.2);
            }
        }
    }

    &__name {
        font-weight: 900;
        font-size: 1.2rem;
        flex: 2;
    }

    &__separator {
        border-top: 0.2rem solid var(--secondary-white);
    }

    .router-link-exact-active {
        background: var(--primary-color);
        color: var(--primary-white);
    }

    &__list {
        display: none;

        &-show {
            display: block;
        }

        &-item {
            margin: 2rem 0 2rem 2.2rem;
            display: flex;
            align-items: center;

            span {
                display: inline-block;
                cursor: pointer;
            }

            &__color {
                width: 1rem;
                height: 1rem;
                border-radius: 1rem;
                margin-right: 1rem;
            }

            &__name {
                font-size: 1.2rem;
                width: calc(100% - 2rem);
                color: var(--font-secondary-grey);
                @include ellipsis(1);
            }
        }
    }

}
</style>