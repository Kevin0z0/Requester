<template>
    <div class="collection">
        <stretch-box width="250px"
                     small="250px"
                     min="250px"
                     max="450px"
                     ref="wrapBox">

        </stretch-box>
    </div>
</template>

<script>
import StretchBox from '@/components/StretchBox'
export default {
    name: "Collection",
    components:{
        StretchBox
    }
}
</script>

<style scoped lang="scss">
.collection{
    height: 100%;
}
</style>