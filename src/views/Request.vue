<template>
  <div class="request" v-if="requests.currentRid">
    <loading v-if="loading"></loading>
    <stretch-box width="30px"
                 small="30px"
                 min="250px"
                 max="50%"
                 ref="wrapBox"
                 :target="1">
      <template #left>
        <stretch-box height="42px"
                     small="42px"
                     min="150px"
                     max="100%"
                     :target="1"
                     ref="mainBox">
          <template #top>
            <div class="request__opt" style="">
              <div class="request__opt-input">
                <input-select :data="inputMethod"
                              :name="requestData.requestMethod"
                              @onSelect="onSelect"
                              @onInput="onInput"
                              @onDelete="onDelete"
                              @onUpdate="onUpdate"
                              @onBlur="onSelectBlur"
                              :allowDelete="true"
                              :allowUpdate="true"
                              :uppercase="true"/>
                <input-box class="request__opt-input__main"
                           v-model="requestData.url"
                           placeholder="input url here"
                           @onEnter="send(false)"
                           ref="urlBox"
                           @onBlur="onInputBlur(true, $event)"/>
                <r-button :type="btnStatus.type" @click="send(false)">
                  {{ btnStatus.text }}
                  <template #right>
                    <r-select :data="sendOption" @onSelect="onSendBtnSelected"/>
                  </template>
                </r-button>
              </div>
              <tabs v-model="activeName" class="request__tabs">
                <pane label="Params" name="1">
                  <params v-model="requestData.url" ref="params" @onUpdate="onInputBlur(false, $event)"/>
                </pane>
                <pane label="Body" name="2">
                  <r-body :height="topHeight" ref="body"/>
                </pane>
                <pane label="Headers" name="3">
                  <headers ref="headers"></headers>
                </pane>
                <pane label="Authorization" name="4">
                  <authorization ref="auth"/>
                </pane>
                <pane :label="$t('request.pretest')" name="5">
                  <pre-test :height="topHeight"
                            ref="preTest"
                            status="pretest"
                            description="Pre-request Test Script are written in JavaScript, and are run before the request is sent."></pre-test>
                </pane>
                <pane :label="$t('request.test')" name="6">
                  <test :height="topHeight"
                        ref="test"
                        status="test"
                        :testSnap="true"
                        description="Request Test Script are written in JavaScript, and are run after the request is sent."></test>
                </pane>
                <pane :label="$t('request.settings')" name="7">
                  <settings ref="settings"></settings>
                </pane>
              </tabs>
            </div>
          </template>
          <template #bottom>
            <result ref="result"
                    @onAbort="onAbort"
                    :onSend="onSend"/>
          </template>
        </stretch-box>
      </template>
      <template #right>
        <side ref="side"/>
      </template>
    </stretch-box>
  </div>
  <div v-else class="add-request">
    <h1>You have no Request here</h1>
    <p @click="add">click here to add new Request</p>
  </div>
</template>

<script>
import db from '@/utils/DB'
import {mapState} from 'vuex';
import http from '@/utils/requester'
import Tabs from '@/components/Tabs'
import Pane from '@/components/Pane'
import Side from '@/layout/Request/Side'
import RButton from '@/components/Button'
import {getBool} from '@/utils/functions'
import {ref, defineAsyncComponent} from 'vue'
import RSelect from '@/components/Select/Select'
import StretchBox from '@/components/StretchBox'
import InputSelect from '@/components/Input/InputSelect'
import systemProxy from '@/utils/requester/proxy/system'
import {debounce, FILE_FORMAT} from "@/utils/functions"
import Loading from "@/components/Loading"
import {replace} from "@/utils/envReplace";
import {addRequest} from "@/utils/DB/add";
import Message from "@/components/Message";
// eslint-disable-next-line no-unused-vars
import Selection from "@/utils/Selection";
const fs = window.require('fs')


const hasValue = (value) => {
  return value !== undefined
}

export default {
  name: "Request",
  components: {
    Pane,
    Tabs,
    Side,
    Loading,
    RButton,
    RSelect,
    StretchBox,
    InputSelect,
    RBody: defineAsyncComponent({
      loader: () => import('@/layout/Request/Body'),
      delay: 1500,
    }),
    Result: defineAsyncComponent({
      loader: () => import('@/layout/Request/Result'),
      delay: 1000,
    }),
    Test: defineAsyncComponent(() => import('@/layout/Request/Test')),
    PreTest: defineAsyncComponent(() => import('@/layout/Request/Test')),
    Params: defineAsyncComponent(() => import('@/layout/Request/Params')),
    Headers: defineAsyncComponent(() => import('@/layout/Request/Headers')),
    Settings: defineAsyncComponent(() => import('@/layout/Request/Settings')),
    InputBox: defineAsyncComponent(() => import('@/components/Input/InputBox')),
    Authorization: defineAsyncComponent(() => import('@/layout/Request/Authorization')),
  },
  setup() {
    const result = ref(null)
    return {
      result
    }
  },
  provide() {
    return {
      setSideBarWidth: () => {
        if (document.getElementsByClassName("side")[0].offsetWidth === 30)
          this.$refs.wrapBox.setWidth([250, "px"], false)
      },
      updateInfo: () => {
        this.requestData = this.requests.value.info
        this.$refs.params.updateInfo()
        this.$refs.headers.updateInfo()
        this.$refs.body.updateInfo()
        this.$refs.auth.updateInfo()
        this.$refs.preTest.updateInfo()
        this.$refs.test.updateInfo()
        this.$refs.settings.updateInfo()
      },
    }
  },
  inject: ["stretchBoxEvent"],
  data() {
    return {
      loading: true,
      activeName: '1',
      sendOption: [
        {
          name: "Parse cURL",
          icon: "code",
          value: "curl"
        },
        {
          name: "Send and download",
          icon: "download",
          value: "download"
        },
      ],
      inputMethod: [
        {name: "GET"},
        {name: "POST"},
        {name: "PUT"},
        {name: "DELETE"},
        {name: "PATCH"},
        {name: "COPY"},
        {name: "HEAD"},
        {name: "OPTIONS"},
        {name: "TRACE"},
        {name: "CONNECT"}
      ],
      requestData: null,
      topHeight: null,
      onSend: false,
      btnStatus: {
        text: this.$t("request.send"),
        type: 'primary'
      },
      debounceSQL: debounce((name) => {
        this.updateSQL(
            this.requests.currentRid,
            "requestMethod",
            name
        )
      }, 200)
    }
  },
  computed: {
    ...mapState({
      General: state => state.settings.General,
      Proxies: state => state.settings.Proxies,
      requests: state => state.requests
    })
  },
  created() {
    if (!this.requests.currentRid)
      this.show = false
    else {
      this.init()
    }
  },
  mounted() {

  },
  methods: {
    onSendBtnSelected(data) {
      switch (data.value){
        case 'download':
          this.send(true)
      }
    },
    init() {
      this.requestData = this.requests.value.info
      this.$nextTick(() => {
        !this.stretchBoxEvent._events.widthResize &&
        this.stretchBoxEvent.on('widthResize', this.onRightWidthResize)
        !this.$refs.mainBox.event._events.heightResize &&
        this.$refs.mainBox.event.on('heightResize', this.onTopHeightResize)


        setTimeout(() => {
          this.preload()
          this.loading = false
        }, 2000)
      })
    },
    async add() {
      const added = await addRequest(null)
      if (!added) {
        return Message({
          message: "Add request failed",
          type: 'error'
        })
      }
      this.$store.commit('requests/addNewRequest', {
        id: added.rid,
        data: added.result
      })
      this.init()

    },
    onSelect(data) {
      this.requestData.requestMethod = data.name
      const list = this.getCurrentInActiveList()
      list.requestMethod = this.requestData.requestMethod
      this.debounceSQL(data.name)
    },
    onInput(data) {
      this.requestData.requestMethod = data
    },
    onDelete(data) {
      this.inputMethod.splice(data[1], 1)
    },
    onUpdate() {
      this.inputMethod.push({name: this.requestData.requestMethod})
    },
    onSelectBlur() {
      this.getCurrentInActiveList().requestMethod = this.requestData.requestMethod
      this.debounceSQL(this.requestData.requestMethod)
    },
    getCurrentInActiveList() {
      return this.requests.activeList[this.requests.value.info.showIndex]
    },
    onInputBlur(updateParam, update) {
      if (update !== false) {
        this.getCurrentInActiveList().url = this.requestData.url
        this.updateSQL(
            this.requests.currentRid,
            "url",
            this.requestData.url
        )
        updateParam && this.$refs.params.updateSQL()
      }
    },
    getHost() {
      const url = this.requestData.url
      const index = url.indexOf("?")
      if (index > -1) {
        return replace(url.slice(0, index))
      }

      return replace(url)
    },
    updateSQL(id, name, value) {
      return db.update('request', {
        [name]: value
      }, {id})
    },
    onSendRequest() {
      this.onSend = true
      this.result.clearContent()
      this.btnStatus.text = this.$t("request.sending")
      this.btnStatus.type = "forbid"
    },
    onReceiveResponse() {
      this.onSend = false
      this.btnStatus.text = this.$t("request.send")
      this.btnStatus.type = "primary"
    },
    async getProxy() {
      const customValue = this.Proxies.Proxy.custom.value
      if (customValue.active) {
        const proxy = {
          type: "custom",
          bypass: customValue.bypass
              .replace(/\./g, "\\.")
              .replace(/\*/g, ".*")
              .split(',').map(v => v.trim())
        }
        const url = customValue.server.ip + ":" + customValue.server.port
        if (customValue.type["HTTP"]) proxy["http"] = url
        if (customValue.type["HTTPS"]) proxy["https"] = url
        if (customValue.auth.value) proxy["auth"] = {
          username: customValue.auth.username,
          password: customValue.auth.password
        }
        return proxy
      } else {
        const systemValue = this.Proxies.Proxy.system.value
        if (systemValue.active) {
          const temp = await systemProxy()
          if (!temp) return temp
          return {
            http: temp['ProxyServer'],
            https: temp['ProxyServer'],
            bypass: temp['ProxyOverride'],
            type: 'system'
          }
        }
      }
    },
    setResultHeight() {
      if (document.getElementsByClassName("result")[0].offsetHeight === 42)
        this.$refs.mainBox.setHeight([50, "%"], true)
    },
    getSettings(singleSettings) {
      const obj = {}
      for (const i of ["sslCert", "followRedirects", "MaxRedirects"]) {
        const item = singleSettings[i]
        if (!item.followGlobal) {
          obj[i] = item.value
        }
      }
      return obj
    },
    beforeSend() {
      this.onSendRequest()
      this.setResultHeight()
    },
    async preload() {
      try {
        http()
        getBool(0)
        this.getHost()
        this.getProxy()
        hasValue(0)
        this.getSize({})
        //use two await 'cause current env has not been added to the Map when the first query executed
        await this.$refs.params.get()
        await this.$refs.body.get()
        this.$refs.auth.get()
        this.$refs.headers.get()
        this.result.setContent("")
        this.getSettings(this.$refs.settings.get())
      } catch (e) {
        return e
      }
    },
    async send(download) {
      if (this.onSend) return
      this.beforeSend()
      const body = await this.$refs.body.get()
      const paramValue = await this.$refs.params.get()
      console.log(paramValue)
      const headersValue = await this.$refs.headers.get()
      this.$store.commit('requests/setResult', {
        params: paramValue,
        headers: headersValue,
        body: body
      })
      const preTest = await this.$refs.preTest.run()
      if (preTest?.error) {
        this.result.setError("PreTest Script", preTest.error)
        this.onReceiveResponse()
        return
      }
      const singleSettings = this.$refs.settings.get()
      const settings = this.getSettings(singleSettings)
      this.req = http()
      const data = this.req.request(
          await this.getHost(),
          this.requestData.requestMethod,
          {
            params: paramValue,
            data: body['value'],
            headers: headersValue,
            auth: await this.$refs.auth.get(),
            type: body['type'],
            dataType: body['dataType'],
            proxy: await this.getProxy(),
            timeout: parseInt(this.General.Request.timeout.value),
            redirect: {
              maxRedirect: hasValue(settings.MaxRedirects) ? settings.MaxRedirects : parseInt(this.General.Response.redirectTimes.value),
              follow: hasValue(settings.followRedirects) ? settings.followRedirects : getBool(this.General.Response.redirects.value),
              followMethod: singleSettings.followMethod,
              inherit: singleSettings.inherit,
              removeReferer: singleSettings.removeReferer
            },
            verify: hasValue(settings.sslCert) ? settings.sslCert : getBool(this.General.Request.SSLVerification.value)
          })
      data.byte(v => {
        console.log(v)
        if(download){
          const {dialog} = window.require('electron').remote
          dialog.showSaveDialog({
            title: 'Choose your path to save',
            defaultPath: "response." + (FILE_FORMAT[v.headers['content-type']] || 'html'),
          }).then(result => {
            if(result.filePath)
              fs.writeFile(result.filePath, v.data, 'binary', (err)=>{
                if(err)
                  Message({
                    message: "Save request failed",
                    type: 'error'
                  })
              })
          })
        }
        data.time(async time => {
          this.result.responseInfo = {
            status: {
              code: v.status_code,
              message: v.raw.statusMessage
            },
            time: time,
            size: this.getSize(v)
          }
          const test = await this.$refs.test.run({
            response: v,
            time: time
          })
          if (test?.error) {
            this.result.setError("Test Script", test.error)
            this.onReceiveResponse()
            return
          }
          this.result.setContent(v)
        })
      }).catch(v => {
        if (v.error) {
          this.result.setError("Request", v.error)
          return
        }
        v && this.result.setError("Request", v)
      }).finally(() => {
        this.onReceiveResponse()
      })
    },
    onTopHeightResize({height, mainHeight}) {
      this.topHeight = height
      this.result && this.result.setHeight(mainHeight - height)
    },
    onRightWidthResize() {
      const side = document.getElementsByClassName('side')[0]
      side && (this.$refs.side.small = side.offsetWidth === 30)
    },
    onAbort() {
      this.$refs.preTest.abort()
      this.req && this.req.abort()
    },
    getSize(data) {
      if (!data.raw || !data.raw.rawHeaders) return {total: 0, detail: null}
      const headers = data.raw.rawHeaders
      let count = 0
      for (let i = 0; i < headers.length; i += 2) {
        count += headers[i].length + headers[i + 1].length + 4
      }
      return {
        total: data.data.length + count,
        detail: {
          headers: count,
          body: data.data.length
        }
      }
    }
  }
}
</script>

<style lang="scss">
.request {
  &__opt {
    &-input {
      .input-select {
        border-radius: .8rem 0 0 .8rem;
      }
    }
  }

  &__editor {
    padding-top: 1rem;
  }
}
</style>

<style scoped lang="scss">

.request {
  height: 100%;

  &__opt {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;

    &-input {
      padding: 1.5rem 1.5rem 0 1.5rem;
      display: flex;

      & > &__main {
        margin-right: 1rem;
        background-color: var(--secondary-white);
        border-left: .1rem solid var(--font-primary-grey);
        font-size: 1.4rem;
        border-radius: 0 .8rem .8rem 0;
        transition: .2s;

        &:hover {
          background-color: var(--font-primary-grey);
        }
      }
    }
  }

  &__tabs {
    height: calc(100% - 6rem);
    flex-direction: column;

  }
}

.add-request {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  flex-direction: column;

  p {
    font-size: 1.4rem;
    color: var(--primary-color);
    cursor: pointer;
    margin-top: 1rem;
    border-bottom: 1px solid transparent;

    &:hover {
      border-bottom-color: var(--primary-color);
    }
  }
}
</style>