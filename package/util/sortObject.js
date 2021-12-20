module.exports = function sortObject (obj, keyOrder, dontSortByUnicode) {
    if (!obj) return
    const res = {}
    const keys = Object.keys(obj)
    !dontSortByUnicode && keys.sort()
    keys.forEach(key => {
        res[key] = obj[key]
    })

    return res
}
