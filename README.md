# Requester



## 开发文档

### vue组件

#### stretch-box

| 参数   | 值          | 注释                        |
| ------ | ----------- | --------------------------- |
| width  | 50% / 100px | 宽度初始值                  |
| height | 50% / 100px | 高度初始值                  |
| max    | 50% / 100px | 宽/高最大值                 |
| min    | 50% / 100px | 宽/高最小值                 |
| small  | 50% / 100px | 最小化宽/高                 |
| target | 0 / 1       | (top/left) / (bottom/right) |

```html
<stretch-box width="250px"
             min="150px"
             max="300px"
             small="80px">
    <template v-slot:left>
        <div class="wrap"></div>
    </template>
    <template v-slot:right>
        <div class="test"></div>
    </template>
</stretch-box>
```

## TODO
> Dashboard
> 
> TODO List

