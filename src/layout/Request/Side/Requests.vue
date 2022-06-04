<template>
    <div class="side-requests">
        <div class="side-requests__item"
             v-for="item in Object.keys(list).reverse()"
             :key="list[item].id"
             @click="changeItem(item)">
            <span :style="`color: var(--primary-${getColor(list[item].requestMethod)})`"
                  class="side-requests__item__method"
                  :class="{'side-requests__item__method-current': list[item].id === currentRid}"
                  :title="list[item].requestMethod">
                {{ list[item].requestMethod }}
            </span>
            <span class="side-requests__item__name" :title="getTitle(list[item])">
                {{ getTitle(list[item]) }}
            </span>
            <div class="side-requests__item__tools">
                <span class="iconfont icon-star" :class="{'icon-stared': list[item].star}"
                      @click="star(item, $event)"></span>
                <span class="iconfont icon-trash" @click="deleteItem(item)"></span>
            </div>
        </div>
    </div>
    <popup v-model="show" title="Save to collections" ref="popup">
        <collections-popup
            @cancel="saveCancel"
            @confirm="saveConfirm"
        />
    </popup>

</template>

<script>
import db from "@/utils/DB";
import {mapState, mapGetters} from 'vuex'
import {h, defineAsyncComponent} from 'vue'
import dialog from "@/components/Pop/Dialog.js"
import {deleteRequest} from '@/utils/DB/delete'
import {getColor, limitLength} from "../../_shared"
import {pauseEvent, getTitle} from "@/utils/functions"
// eslint-disable-next-line no-unused-vars
import {insertItem} from "@/components/Tree/_shared";
import Message from "@/components/Message";

export default {
    name: "Requests",
    components: {
        CollectionsPopup: defineAsyncComponent(() => import("@/layout/CollectionsPopup")),
        Popup: defineAsyncComponent(() => import('@/components/Pop/Popup'))
    },
    computed: {
        ...mapState({
            list: state => state.requests.activeList,
            info: state => state.requests.value.info,
            temp: state => state.requests.tempList,
            currentRid: state => state.requests.currentRid
        }),
        ...mapGetters({
            getRequest: 'requests/getById'
        })
    },
    data() {
        return {
            confirmDialog: false,
            show: false,
            currentID: null,
            currentIndex: null
        }
    },
    inject: ['updateInfo'],
    created() {

    },
    methods: {
        star(data, e) {
            pauseEvent(e)
            const item = this.list[data]
            item.star = 1 * !item.star
            db.update('request', {
                star: item.star
            }, {id: item.id})
        },
        getColor(method) {
            return getColor(method)
        },
        getTitle(item) {
            return getTitle(item)
        },
        deleteCollectionItem(item, index, extra) {
            db.update('request', {
                showIndex: null,
                ...extra
            }, {id: item.id}).then(() => {
                delete this.list[index]
            })
            deleteRequest(item.id, false).then(() => {
                this.updateInfo()
            })
        },
        deleteItem(index) {
            pauseEvent(event)
            const item = this.list[index]
            if (item.father_id) {
                //TODO: add http method
                return this.deleteCollectionItem(item, index)
            }
            // console.log(item)
            dialog({
                title: "Do you want to save?",
                message: h('p', null, [
                    h('span', null, 'This tab '),
                    h('b', {style: "color: var(--font-secondary-black); word-break: break-all;"}, limitLength(getTitle(item))),
                    h('span', null, ' has unsaved changes which will be lost if you choose to close it. Save these changes to avoid losing your work.')
                ]),
                confirm: {
                    text: "Save"
                },
                cancel: {
                    text: "Cancel"
                },
                extra: {
                    text: "Delete",
                    type: "error"
                }
            }).then(v => {
                if (v === 'Delete') {
                    deleteRequest(item.id).then((v) => {
                        v && this.updateInfo()
                    }).catch(err => {
                        Message({
                            message: err,
                            type: "error"
                        })
                    })
                } else if (v === 'Save') {
                    this.onSave(item, index)
                }
            }).catch(v => v)
        },
        saveCancel() {
            this.$refs.popup.onClose()
            this.currentID = null
            this.currentIndex = null
        },
        async saveConfirm(item, father) {
            const index = this.currentIndex
            const id = this.currentID
            const info = (await this.getRequest(id)).info
            const fid = father.id
            info.father_id = item.id
            insertItem(father, info)
            this.saveCancel()
            if(index === undefined) {
                this.$store.commit('requests/modifyActiveListItem', {
                    path: "father_id",
                    id: id,
                    value: fid
                })
                return db.update("request", {
                    father_id: fid
                }, {
                    id
                }).then(v=>{
                    if(v.changes){
                        Message({
                            message: "save success",
                            type: "success"
                        })
                    }
                    return v
                })
            }
            this.deleteCollectionItem(info, index, {
                father_id: fid
            })
        },
        changeItem(index) {
            // console.log(rid)
            this.$store.dispatch("requests/setRequest", this.list[index].id).then((v) => {
                if (v !== false)
                    this.updateInfo()
            })
        },
        onSave(item, index){
            this.show = true
            this.currentID = item.id
            this.currentIndex = index
        }
    }
}
</script>

<style scoped lang="scss">
.side-requests {
    &__item {
        height: 3rem;
        display: flex;
        align-items: center;
        font-size: 1.2rem;
        user-select: none;
        cursor: pointer;
        margin-left: -1rem;

        &__method {
            padding: .2rem 1rem .2rem .6rem;
            border-left: .3rem solid transparent;
            width: 6.5rem;
            text-align: center;
            flex-shrink: 0;
            @include ellipsis(1);

            &-current {
                border-left-color: var(--primary-color);
            }
        }

        &__name {
            transition: .2s color;
            @include ellipsis(1);
        }

        &__tools {
            margin-left: auto;
            display: none;

            .iconfont {
                cursor: pointer;
                font-size: 1.7rem;
                color: var(--font-secondary-grey);
            }

            .icon-trash {
                color: var(--primary-red);
            }

            .icon-star {
                margin-right: .8rem;

                &:hover {
                    color: var(--primary-orange);
                }

                &ed {
                    color: var(--primary-orange);
                }
            }
        }

        &:hover {
            color: var(--primary-color);

            .side-requests__item__name {
                max-width: calc(100% - 9.4rem);
            }

            .side-requests__item__tools {
                display: block;
            }
        }
    }
}
</style>