module.exports = function injectImports (fileInfo, api, { imports }) {
  console.log('fileInfo',fileInfo);
  console.log("api",api);
  console.log('{imports}',{imports});
  const j = api.jscodeshift
  const root = j(fileInfo.source)

  const toImportAST = i => j(`${i}\n`).nodes()[0].program.body[0]
  const toImportHash = node => JSON.stringify({
    specifiers: node.specifiers.map(s => s.local.name),
    source: node.source.raw
  })

  const declarations = root.find(j.ImportDeclaration)
  const importSet = new Set(declarations.nodes().map(toImportHash))
  const nonDuplicates = node => !importSet.has(toImportHash(node))

  const importASTNodes = imports.map(toImportAST).filter(nonDuplicates)

  if (declarations.length) {
    declarations
      .at(-1)
      .forEach(({ node }) => delete node.loc)
      .insertAfter(importASTNodes)
  } else {
    // 没有预先存在的导入声明
    root.get().node.program.body.unshift(...importASTNodes)
  }

  return root.toSource()
}
