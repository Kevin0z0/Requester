<template>
    <div class="test">
        <div class="test__code">
<!--            <button @click="run">click</button>-->
            <editor ref="editor"
                    :code="code"
                    language="javascript"
                    @onBlur="onEditorBlur">

            </editor>
        </div>
        <div class="test__intro">
            <p class="test__desc">{{description}}</p>
            <sub-title title="Snippets" type="bold">
                <a href="#"> <span class="iconfont icon-help"></span></a>
            </sub-title>
            <div v-for="(i, index) in snippets"
                 class="test__snippet"
                 :key="index"
                 @click="addCode(i)"
            >
                <span>{{i.name}}</span>
            </div>
            <div v-if="testSnap">
                <div v-for="(i, index) in testSnippets"
                     class="test__snippet"
                     :key="index"
                     @click="addCode(i)"
                >
                    <span>{{i.name}}</span>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
import {ref} from 'vue'
import vm from '@/utils/vm'
import db from "@/utils/DB"
import {mapState} from 'vuex'
import error from '@/utils/vm/bus'
import Editor from '@/components/Editor'
import SubTitle from '@/components/SubTitle'
const Buffer = window.require('buffer').Buffer
import {setEditorHeight} from "@/layout/_shared"
import {testResult} from "@/utils/vm/RequesterHandler";

const snippets = [
    {
        "name": "set an environment variable",
        "code": "re.env.set('key', 'value')"
    },
    {
        "name": "get an environment variable",
        "code": "re.env.get('key')"
    },
    {
        "name": "delete an environment variable",
        "code": "re.env.delete('key')"
    },
    {
        "name": "get request body value",
        "code": "rr.request.body.get()"
    },
    {
        "name": "set request body value",
        "code": "rr.request.body.set(value)"
    },
    {
        "name": "get request headers value",
        "code": "rr.request.headers.get(key)"
    },
    {
        "name": "set request headers value",
        "code": "rr.request.headers.set(key, value)"
    },
    {
        "name": "get request params value",
        "code": "rr.request.params.get(key)"
    },
    {
        "name": "set request params value",
        "code": "rr.request.params.set(key, value)"
    },
]

const testSnippets = [
    {
        "name": "Status Code: code is 200",
        "code": `rr.test("Status code is 200", function () {
    rr.response.to.have.status(200);
});`
    },
    {
        "name": "Response body: Is empty",
        "code": `rr.test("Response body is not empty", function() {
    rr.expect(rr.response.text()).to.not.be.empty
})`
    },
    {
        "name": "Response body: Json value check",
        "code": `rr.test("Json value is equal to 100", function () {
    const jsonData = rr.response.json();
    rr.expect(jsonData.value).to.be.equal(100);
});`
    },
    {
        "name": "Response body: Is equal to a string",
        "code": `rr.test("Body is correct", function () {
    rr.response.to.have.body("response_body_string");
});`
    },
    {
        "name": "Response header: Check header",
        "code": `rr.test("Content-Type is present", function () {
    rr.response.to.have.header("Content-Type");
});`
    },
    {
        "name": "Response Time: Total time less then 200ms",
        "code": `rr.test("Response time is less than 200ms", function () {
    rr.expect(rr.response.responseTime).to.be.below(200);
});`
    },
    {
        "name": "Status Code: Successful POST request",
        "code": `rr.test("Successful POST request", function () {
    rr.expect(rr.response.code).to.be.oneOf([200, 201]);
});`
    },
    {
        "name": "Status Code: Code name has String",
        "code": `rr.test("Status code name has string", function () {
    rr.response.to.have.status("Not Found");
});`
    }
]

const handleError = ()=>{
    const err = {error: error.error}
    error.error = null
    return err
}

export default {
    name: "Test",
    components:{
        Editor,
        SubTitle
    },
    props: {
        height: {
            type: Number,
            default: null
        },
        status: String,
        description: String,
        testSnap: {
            default: false,
            type: Boolean
        }
    },
    setup(props){
        const editor = ref(null)
        return {
            editor,
            props,
        }
    },
    data(){
        return {
            code: null,
            snippets,
            testSnippets
        }
    },
    computed:{
        ...mapState({
            test: state=>state.requests.value.test
        })
    },
    created(){
        this.code = this.test[this.status]
    },
    methods:{
        async run(obj = {}){
            const code = this.editor.getValue()
            testResult.test = []
            if(!code) return
            this.vm = vm(code, obj)
            return this.vm.runCode().then(()=>{
                return handleError()
            }).catch(()=>{
                return handleError()
            })
        },
        addCode(item){
            this.editor.updateContent(`${this.editor.getValue()}\n//${item.name}\n${item.code}`, false)
        },
        abort(){
            this.vm && this.vm.abort()
        },
        onEditorBlur(){
            if(!this.$refs.editor) return
            const str = this.$refs.editor.getValue()
            this.test[this.status] = str
            db.update('request_test', {
                [this.status]: window.online ? str : Buffer.from(str)
            }, {tid: this.test.tid})
        },
        updateInfo(){
            this.$refs.editor.updateContent(this.test[this.status])
        }
    },
    watch:{
        height: setEditorHeight.call(this, 96),

    }
}
</script>

<style lang="scss" scoped>
.test{
    display: flex;
    height: 100%;
    overflow: hidden;
    &__code{
        width: calc(100% - 30rem);
        @media screen and (max-width: 800px) {
            width: 60%;
        }
    }
    &__intro{
        width: 30rem;
        padding: 0 1.4rem;
        @media screen and (max-width: 800px) {
            width: 40%;
        }
        overflow-y: auto;
        height: 100%;
    }

    &__desc{
        font-size: 1.2rem;
        color: var(--font-primary-black);
        margin: 1rem 0;
    }

    &__snippet{
        font-size: 1.2rem;
        color: var(--primary-color);
        margin: 1rem 0;
        cursor: pointer;
        span{
            border-bottom: 2px solid transparent;
        }
        &:hover{
            & > span{
                border-bottom: 2px solid var(--primary-color);
            }
        }
    }
}
</style>