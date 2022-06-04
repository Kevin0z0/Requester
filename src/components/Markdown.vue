<template>
    <div class="markdown" ref="content">

    </div>
</template>

<script>
import markdown from "@/utils/markdown";

export default {
    name: "Markdown",
    props: {
        content: {
            default: "",
            type: String
        },
        placeholder: {
            default: "",
            type: String
        }
    },
    setup(props) {
        return {
            props
        }
    },
    mounted() {
        this.update()
    },
    methods: {
        update() {
            this.$refs.content.innerHTML = markdown(this.content, this.placeholder)
        }
    }
}
</script>

<style lang="scss">
.markdown{
    h1, h2, h3, h4{
        margin: 1rem 0;
    }

    p{
        margin: .6rem 0;
    }
    pre{
        background-color: var(--tertiary-white);
        padding: 1rem;
        margin: 1rem 0;
        width: 100%;
        overflow-x: auto;
    }
    blockquote{
        padding-left: 1rem;
        border-left: .3rem solid var(--primary-grey);
    }

}
</style>