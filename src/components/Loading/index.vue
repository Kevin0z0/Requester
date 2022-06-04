<template>
    <div class="loading">
        <svg class="w-0">
            <defs>
                <filter id="w-0">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
                    <feColorMatrix
                        in="blur"
                        mode="matrix"
                        values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -10"
                        result="res"
                    />
                    <feComposite in="SourceGraphic" in2="res" operator="atop" />
                </filter>
            </defs>
        </svg>
        <svg class="f-w-0" width="200" height="200" viewBox="0 0 200 200">
            <defs>
                <linearGradient id="linear-gradient">
                    <stop class="stop1" offset="0" />
                    <stop class="stop2" offset="1" />
                </linearGradient>
                <linearGradient
                    y2="160"
                    x2="160"
                    y1="40"
                    x1="40"
                    gradientUnits="userSpaceOnUse"
                    id="gradient"
                    xlink:href="#linear-gradient"
                />
            </defs>
            <path
                class="path-class"
                d="m 164,100 c 0,-35.346224 -28.65378,-64 -64,-64 -35.346224,0 -64,28.653776
           -64,64 0,35.34622 28.653776,64 64,64 35.34622,0 64,-26.21502 64,-64
           0,-37.784981 -26.92058,-64 -64,-64 -37.079421,0 -65.267479,26.922736
           -64,64 1.267479,37.07726 26.703171,65.05317 64,64 37.29683,-1.05317
           64,-64 64,-64"
            />
            <circle class="circle-class" cx="100" cy="100" r="64" />
        </svg>
        <svg class="svg-class-1" width="200" height="200" viewBox="0 0 200 200">
            <path
                class="path-class"
                d="m 164,100 c 0,-35.346224 -28.65378,-64 -64,-64 -35.346224,0 -64,28.653776
           -64,64 0,35.34622 28.653776,64 64,64 35.34622,0 64,-26.21502 64,-64
           0,-37.784981 -26.92058,-64 -64,-64 -37.079421,0 -65.267479,26.922736
           -64,64 1.267479,37.07726 26.703171,65.05317 64,64 37.29683,-1.05317 64,-64
           64,-64"
            />
            <circle class="circle-class" cx="100" cy="100" r="64" />
        </svg>
    </div>
</template>

<script>
export default {
    name: "Loading"
}
</script>

<style scoped lang="scss">
.loading{
    align-items: center;
    display: flex;
    justify-content: center;
    height: 100%;
    overflow: hidden;

    .w-0 {
        width: 0;
    }
    .f-w-0 {
        filter: url(#w-0);
    }
    .stop1 {
        stop-color: rgb(12,119,255);
    }
    .stop2 {
        stop-color: rgb(99, 145, 217);
    }
    .path-class {
        animation: key01 8s infinite linear;
        stroke-dasharray: 180 800;
        fill: none;
        stroke: url(#gradient);
        stroke-width: 23;
        stroke-linecap: round;
    }
    .circle-class {
        animation: key01 4s infinite linear;
        stroke-dasharray: 26 54;
        fill: none;
        stroke: url(#gradient);
        stroke-width: 23;
        stroke-linecap: round;
    }
    .svg-class-1 {
        filter: blur(5px);
        opacity: 0.3;
        position: absolute;
        transform: translate(3px, 3px);
    }
    @keyframes key01 {
        0% {
            stroke-dashoffset: 0;
        }
        100% {
            stroke-dashoffset: -403px;
        }
    }
}


</style>