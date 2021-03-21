import Vue from 'vue'
import Ws from '@adonisjs/websocket-client'

class WsPlugin extends Vue {
  constructor (adonisWS) {
    super()
    this.AdonisWS = adonisWS
    this.connected = false
    this.socket = null
    this.onOpen = () => { }
  }

  anyListener (topic, event, data) {
    this.$emitToFront(`${topic}|${event}`, data)
    this.$emitToFront(`${event}`, data)
  }

  // Register a custom callback as meddler that gets called upon each event emission.
  // It can be bound to $on as well.
  $onAny (callback) {
    this.meddler = callback
  }

  // Override Vue's $emit to call the custom meddler callback upon each event emission.
  $emitToFront (event, ...args) {
    if (this.meddler && typeof this.meddler.call === 'function') {
      this.meddler(event, ...args)
    }

    return super.$emit(event, ...args)
  }

  $emitToServer (subscriptionTopic, eventName, data = {}) {
    if (!this.socket) {
      throw new Error('Socket is not connected')
    }
    if (!this.socket.ws) {
      throw new Error('Socket is not ready, please check your internet connection')
    }
    // console.log('emitToServer subscriptionTopic:', subscriptionTopic)
    let subscription = this.socket.getSubscription(subscriptionTopic)
    if (!subscription) {
      subscription = this.subscribe(subscriptionTopic)
    }
    subscription.emit(eventName, data)
  }

  connect ({ wsDomain, jwtToken = null } = {}, options = {}) {
    if (!this.AdonisWS) {
      throw new Error('Please define adonisWs in Vue.use(WsPlugin, { adonisWS: window.adonis.Ws })')
    }
    if (this.connected) {
      throw new Error('Socket is already connected')
    }
    const ws = new this.AdonisWS(wsDomain, options)
    if (jwtToken) {
      ws.withJwtToken(jwtToken)
    }
    this.socket = ws.connect()
    this.socket.on('open', () => {
      this.connected = true
      this.onOpen()
    })

    this.socket.on('close', () => {
      this.connected = false
    })

    this.socket.on('error', () => {
      this.connected = false
    })
    return this
  }

  subscribe (topic) {
    const subscription = this.socket.subscribe(topic)
    subscription.emitter.onAny((event, data) => {
      this.anyListener(topic, event, data)
    })
    subscription.on('close', () => {
      if (subscription.emitter) {
        subscription.emitter.offAny(() => {
          this.anyListener(topic)
        })
      }
    })
    return subscription
  }

  unsubscribe (topic) {
    if (this.socket.subscriptions[topic]) {
      console.log('Found Socket')
    }
    this.socket.subscriptions[topic].close()
  }

  pageChange (noty) {
    this.$off()
    for (const key in this.socket.subscriptions) {
      this.unsubscribe(key)
    }
    this.$on('error', (err) => {
      noty.error(err.message || 'Unknown Error')
    })
  }

  disconnect () {
    try {
      if (this.socket) {
        this.socket.offAny(this.anyListener)
        this.socket.close()
        this.socket = null
      }
      this.connected = false
    } catch (e) {
      console.error('AdonisVueWs', e.message)
    }
  }

  onOpen (cb = () => { }) {
    this.onOpen = cb
  }
}

export default function ({ app, $auth }, inject) {
  inject('ws', new WsPlugin(Ws))
  if ($auth.loggedIn) {
    connect(app, $auth.strategy.token.get())
  }
  $auth.$storage.watchState('loggedIn', (loggedIn) => {
    if (loggedIn) {
      connect(app, $auth.strategy.token.get())
    } else {
      app.$ws.disconnect()
    }
  })
}

function connect (app, token) {
  try {
    app.$ws.disconnect()
    app.$ws.connect(
      {
        wsDomain: process.env.SOCKET_URL,
        jwtToken: token
      },
      {
        path: 'adonis-ws',
        reconnectionAttempts: 300,
        reconnectionDelay: 5000
      }
    )
  } catch (e) {
    console.log(e)
  }
}
