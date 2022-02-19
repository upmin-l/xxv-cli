exports.getPackageModules = () => {
    return [
        'uearth',
        'spray',
        'vuex',
        'pinia',
        'router',
        'typescript'
    ].map(file => require(`../plugInModules/${file}`))
}
