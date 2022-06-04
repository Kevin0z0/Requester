<template>
    <div class="message"
         :class="'message__' + type"
         ref="main"
         style="transform:translateY(-30px);opacity: 0">
        <p>{{ message }}</p>
    </div>
</template>

<script>
import anime from 'animejs/lib/anime.es.js';
export default {
    name: "Message",
    emits: ['vanish'],
    props: {
        message: {
            default: "",
            type: String
        },
        type: {
            default: "default",
            type: String
        }
    },
    mounted() {
        anime({
            targets: this.$refs.main,
            translateY: '0px',
            opacity: 1,
            easing: 'cubicBezier(0.100, 0.735, 0.635, 0.950)',
            duration: 100
        })
        this.timeout = setTimeout(()=>{
            this.remove()
        },3000)
    },
    methods: {
        remove(){
            clearTimeout(this.timeout)
            anime({
                targets: this.$refs.main,
                translateY: '-30px',
                opacity: 0,
                easing: 'cubicBezier(0.100, 0.735, 0.635, 0.950)',
                duration: 100,
                complete:()=>{
                    this.$emit('vanish')
                }
            })
        }
    }
}
</script>

<style scoped lang="scss">
.message {
    min-width: 24rem;
    font-size: 1.4rem;
    background: #ccc;
    border-radius: 0.7rem;
    text-align: center;
    box-shadow: 0 .2rem 1.4rem 0 rgba(0, 0, 0, .1);
    padding: 1rem 3rem;
    transition: .2s;
    margin: 2rem 0;

    p{
        @include ellipsis(1);
    }

    &__success {
        color: #15ac3c;
        background-color: #aeecc6;
    }

    &__error{
        color: #f56c6c;
        background-color: #fef0f0;
    }

    &__warning{
        color: #e6a23c;
        background-color: #fdf6ec;
    }
}
</style>