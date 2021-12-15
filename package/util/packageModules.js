exports.getPackageModules = () => {
    return [
        'thingjs',
        'uearth',
        'spray',
        'vuex',
        'router',
    ].map(file => require(`../promptModules/${file}`))
}
