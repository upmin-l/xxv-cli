const descriptions = {
  dev: '启动项目',
  build: '编译打包项目',
}

function printScripts (pkg, packageManager) {
  return Object.keys(pkg.scripts || {}).map(key => {
    if (!descriptions[key]) return ''
    return [
      `\n### ${descriptions[key]}`,
      '```',
      `${packageManager} ${packageManager !== 'yarn' ? 'run ' : ''}${key}`,
      '```',
      ''
    ].join('\n')
  }).join('')
}

module.exports = function generateReadme (pkg, packageManager) {
  return [
    `# ${pkg.name}\n`,
    printScripts(pkg, packageManager),
    ''
  ].join('\n')
}
