exports.getPackageModules = () => {
    return [
        'uearth',
        'spray',
        'vuex',
        'pinia',
        'router',
    ].map(file => require(`../plugInModules/${file}`))
}
