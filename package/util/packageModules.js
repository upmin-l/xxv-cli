exports.getPackageModules = () => {
    return [
        'uearth',
        'spray',
        'vuex',
        'router',
    ].map(file => require(`../promptModules/${file}`))
}
