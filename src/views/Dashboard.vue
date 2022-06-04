<template>
    <div class="dashboard">
        <div class="dashboard__welcome">
            <div class="dashboard__welcome__title">
                <h1>{{$t("dashboard.welcome")}} {{$store.state.user.username}}!</h1>
                <h4>{{$t("dashboard.nothingCreateNew")}}</h4>
            </div>
            <div class="dashboard__welcome__button">
                <r-button type="primary" @click="createNew">
                    <span class="iconfont icon-add"></span>
                    {{$t("dashboard.createNew")}}
                </r-button>
            </div>
        </div>
        <div class="dashboard__user-content">
            <div class="dashboard__explore">
                <div class="dashboard__title">
                    {{$t("dashboard.getStart")}}
                </div>
                <div class="dashboard__explore__block">
                    <h5 class="dashboard__explore__block__title">
                        {{$t("dashboard.importFile")}}
                    </h5>
                    <p>{{$t("dashboard.importFileIntro")}}</p>
                    <div class="dashboard__explore__block__target">
                        <span>{{$t("dashboard.import")}}</span>
                        <i class="iconfont icon-chevron_forward"></i>
                    </div>
                </div>
                <div class="dashboard__explore__block">
                    <h5 class="dashboard__explore__block__title">
                        {{$t("dashboard.document")}}
                    </h5>
                    <p>{{$t("dashboard.learn")}}</p>
                    <div class="dashboard__explore__block__target">
                        <span>{{$t("dashboard.explore")}}</span>
                        <i class="iconfont icon-chevron_forward"></i>
                    </div>
                </div>
            </div>
        </div>
        <div style="height: 1000px"></div>
    </div>
</template>

<script>
import RButton from '@/components/Button'
// import Message from '@/components/Message'
// let data = 1
export default {
    name: 'Dashboard',
    components: {
        RButton
    },
    unmounted(){
        console.log('unmounted')
    },
    methods:{
        createNew(){
            this.$router.push("/request")
        }
    }
}
</script>
<style lang="scss">
.dashboard{
    &__welcome__button{
        .button{
            &__size-default{
                .button__main{
                    padding: 1rem;
                }
            }
        }
    }
}
</style>

<style scoped lang="scss">
.dashboard {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 2rem;
    &__user-content{
        margin-top: 3rem;
    }

    &__title{
        font-size: 1.8rem;
        font-weight: 900;
        grid-area: 1 / 1 / 1 / grid-column-end;
    }

    &__welcome {
        display: flex;
        justify-content: space-between;
        &__title {
            h1 {
                font-size: 2.8rem;
                font-weight: 900;
            }

            h4 {
                font-size: 1.2rem;
                font-weight: 900;
                color: var(--font-secondary-grey);
                margin-top: 1rem;
            }
        }
    }

    &__explore{
        display: grid;
        grid-row-gap: 2rem;
        grid-column-gap: 3rem;
        justify-content: left;
        grid-template-columns: auto;
        &__block{
            border: .1rem solid var(--font-primary-grey);
            width: 28rem;
            height: 18rem;
            border-radius: .7rem;
            padding: 2rem;
            color: var(--font-secondary-grey);
            position: relative;
            &:hover{
                .dashboard__explore__block__title{
                    color: var(--font-secondary-black);
                }
            }

            & > *{
                transition: .2s color, .2s transform;
                cursor: default;
                &:hover{
                    color: var(--font-secondary-black);
                }
            }

            &__title{
                font-size: 1.2rem;
                margin-bottom: 2rem;
            }

            &__target{
                display: flex;
                align-items: center;
                font-size: 1.3rem;
                padding: .2rem 0;
                color: var(--primary-color);
                cursor: pointer;
                position: absolute;
                right: 2rem;
                bottom: 2rem;
                border-bottom: 0.2rem solid transparent;
                font-weight: 900;
                &:hover{
                    color: var(--primary-color);
                    border-bottom-color: var(--primary-color);
                    backface-visibility: hidden;
                    i{
                        transform: translateX(.4rem);
                    }
                }
                i{
                    transition: inherit;
                    padding-top: .1rem;
                }
            }

            p{
                font-size: 1.2rem;
            }
        }
    }
}
</style>