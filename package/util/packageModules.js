exports.getPackageModules = () => {
    return [
        'spray',
        'vuex',
        'router'
    ].map(file => require(`../promptModules/${file}`))
}
