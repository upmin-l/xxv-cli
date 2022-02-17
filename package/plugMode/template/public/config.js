function init() {
    window.CONFIG = CONFIG
    window.uino = uino
}

const CONFIG = {}
const uino = {
    app: null,
    map: null,
}
const isServer = typeof window === 'undefined'
isServer || init()

export default CONFIG
