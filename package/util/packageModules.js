exports.getPackageModules = () => {
    return [
        'spray',
        'vuex',
    ].map(file => require(`../promptModules/${file}`))
}
