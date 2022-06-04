<template>
    <div class="collections">
        <div class="collections__head">
            <input class="collections__search"/>
            <span class="iconfont icon-add"
                  @click="add"></span>
        </div>
        <tree :item="items"
              @onDrop="onDrop"
              @onToggle="onToggle"
              @onAddItem="addRequest"
              @onItemClick="onItemClick"
              itemPlaceholder="Untitled Request"
              empty="This collection is empty"
              @onContextMenu="menu"
              @onNameChange="saveName"
        />
    </div>
</template>

<script>
import {addCollection} from "@/utils/DB/add";
import {getCollectionItems} from "@/utils/DB/get";
// eslint-disable-next-line no-unused-vars
import {deleteCollection, deleteRequest} from "@/utils/DB/delete";
import ContextMenu from "@/utils/contextMenu/index";
import {insertItem} from "@/components/Tree/_shared";
import Tree from '@/components/Tree'
import db from "@/utils/DB";

const execMenu = function () {
    return {
        addFolder: () => {
            const id = this.item.id
            addCollection("New Folder", id).then(v => {
                insertItem(this.item, {
                    name: "New Folder",
                    isFolder: true,
                    expand: false,
                    father_id: id,
                    id: v,
                    new: true
                })
                this.expand()
            })
        },
        addItem: () => {
            if (this.item.isFolder) {
                // prevent add item twice when expanded
                // don't know why, but it does work
                setTimeout(()=>{
                    this.onAddItem(this.item)
                }, 0)
                this.expand()
            } else {
                this.onAddItem(this.father)
            }
        },
        deleteFolder: () => {
            const id = this.item.id
            deleteCollection(id).then(() => {
                // console.log(this.father, this.index)
                const list = this.father.children || this.father
                list.splice(this.index, 1)
            })
        },
        deleteRequest:async () => {
            const id = this.item.id
            const obj = await this.$store.dispatch('requests/activeListHasValue', id)
            if(obj){
                obj.father_id = null
                const currentObj = await this.$store.dispatch('requests/hasRequest', id)
                if(currentObj){
                    currentObj.info.father_id = null
                }
                db.update('request', {
                    father_id: null
                }, {
                    id: id
                })
            }else
                await deleteRequest(id)
            const list = this.father.children || this.father
            list.splice(this.index, 1)
        },
        rename: this.rename,
    }
}

export default {
    name: "Collections",
    components: {
        Tree
    },
    emits: ["addRequest"],
    inject: ["updateInfo"],
    data() {
        return {
            items: []
        }
    },
    created() {
        this.$store.dispatch('collections/init').then(v => {
            this.items = v
        })
    },
    methods: {
        menu(self) {
            const func = execMenu.call(self)
            self.item.isFolder ? ContextMenu.watch("Tree", [
                {label: 'Add Folder', name: 'addFolder'},
                {label: 'Add Request', name: 'addItem'},
                {label: 'Rename', name: 'rename'},
                {type: 'separator'},
                {label: 'Delete Folder', name: 'deleteFolder'},
            ], func) : ContextMenu.watch("Tree", [
                {label: 'Add Request', name: 'addItem'},
                {label: 'Rename', name: 'rename'},
                {type: 'separator'},
                {label: 'Delete Request', name: 'deleteRequest'},
            ], func)
        },
        onItemClick(id) {
            this.$store.dispatch('requests/setRequest', id).then(() => {
                this.updateInfo()
            })
        },
        add() {
            addCollection("New Collection").then(v => {
                this.items.push({
                    name: "New Collection",
                    isFolder: true,
                    expand: false,
                    father_id: 0,
                    id: v
                })
            })
        },
        onToggle(target, isExpand) {
            if (isExpand === null) return
            isExpand && !target.hasValue && getCollectionItems(target.id).then(v => {
                target.children = v
                target.hasValue = true
            })
            db.update("collections", {
                expand: isExpand ? 1 : 0
            }, {
                cid: target.id
            })
        },
        onDrop(father, child) {
            if (child.isFolder) {
                db.update("collections", {
                    father_id: father.id
                }, {
                    cid: child.id
                })
            } else {
                db.update("request", {
                    father_id: father.id,
                }, {
                    id: child.id
                })
            }
        },
        addRequest(item) {
            this.$emit('addRequest', item.id, (data) => {
                const info = data[0]
                info.name = ""
                insertItem(item, info)
            })
        },
        saveName(self) {
            if (self.item.isFolder) {
                db.update("collections", {
                    name: self.item.name
                }, {
                    cid: self.item.id
                })
            } else {
                self.$store.commit('requests/setInfo', {
                    value: self.item.name,
                    path: 'name',
                    id: self.item.id
                })
            }
        }
    }
}
</script>

<style scoped lang="scss">
.collections {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;

    &__head {
        display: flex;
        align-items: center;

        .icon-add {
            font-size: 2rem;
            color: var(--font-secondary-grey);
            cursor: pointer;
            transition: .2s;

            &:hover {
                color: var(--primary-color);
            }
        }
    }

    .tree {
        height: calc(100vh - 15.3rem);
        margin: 0 0 -1rem 0rem;
    }

    &__search {
        width: 100%;
        height: 2.4rem;
        border: .2rem solid var(--font-primary-grey);
        text-indent: .4rem;
        border-radius: .5rem;
        margin-right: 1rem;
        cursor: pointer;
        color: var(--font-primary-black);

        &:focus {
            outline: none;
        }
    }
}
</style>