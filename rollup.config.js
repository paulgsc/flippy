 /*
 * This file contains code adapted from the Node.js website repository,
 * available at: https://github.com/davidjerleke/embla-carousel
 * The original code is licensed under the MIT License.
 */


import fs from 'fs'
import path from 'path'
import some-uiPackageJson from 'some-ui/package.json'
import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'

const FOLDERS = {
  ESM: 'esm',
  CJS: 'cjs',
  UMD: 'umd',
  OUT: './'
}

const CONFIG_GLOBALS = {
  [some-uiPackageJson.name]: kebabToPascalCase(some-uiPackageJson.name),
  [utilsPackageJson.name]: kebabToPascalCase(utilsPackageJson.name)
}

const CONFIG_EXTERNAL_MODULES = {
  moduleDirectories: ['node_modules']
}

const CONFIG_BABEL = {
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  exclude: 'node_modules/**',
  babelHelpers: 'bundled'
}

const CONFIG_TYPESCRIPT = {
  tsconfig: path.join(__dirname, 'tsconfig.json')
}

function CONFIG_EXTERNAL_MODULE_SUPPRESS(warning, next) {
  if (warning.code === 'INPUT_HOOK_IN_OUTPUT_PLUGIN') return
  next(warning)
}

function kebabToPascalCase(string = '') {
  return string.replace(/(^\w|-\w)/g, (replaceString) =>
    replaceString.replace(/-/, '').toUpperCase()
  )
}

function addImportExtensions(content, extension = 'js') {
  return content.replace(/from\s'.\/(.*)';/g, (match) =>
    match.replace(/';/g, `.${extension}';`)
  )
}

function readFiles(dirname, onFileContent, onError) {
  fs.readdirSync(dirname, { withFileTypes: true }).forEach((entry) => {
    if (entry.isDirectory()) {
      return readFiles(dirname + entry.name + '/', onFileContent, onError)
    }

    fs.readFile(dirname + entry.name, 'utf-8', (error, content) => {
      if (error) return onError(error)
      onFileContent(dirname + entry.name, content)
    })
  })
}

function createBuildPath(packageJson, format) {
  const fileName = `${packageJson.name}.${format}.js`
  if (format === 'umd') return path.join(FOLDERS.OUT, fileName)
  return path.join(FOLDERS.OUT, format, fileName)
}

function createNodeNextSupportForPackage() {
  const workspacePath = process.cwd()
  const packageJsonPath = path.join(workspacePath, 'package.json')
  const workspacePackageJson = fs.readFileSync(packageJsonPath, 'utf-8')

  if (!workspacePackageJson) return

  const outFolder = path.join(workspacePath, FOLDERS.OUT)
  const esmFolder = path.join(workspacePath, FOLDERS.OUT, FOLDERS.ESM)
  const cjsFolder = path.join(workspacePath, FOLDERS.OUT, FOLDERS.CJS)

  const packageJson = JSON.parse(workspacePackageJson)
  const packageJsonMain = {
    ...packageJson,
    repository: {
      type: 'git',
      url: 'https://github.com/paulgsc/some-ui'
    },
    bugs: {
      url: 'https://github.com/paulgsc/some-ui/issues'
    },
    homepage: 'https://pgdev.maishatu.com/?tab=github',
    license: 'MIT',
    keywords: [

    ],
    files: [
      `${packageJson.name}*`,
      'components/**/*',
      'index.d.ts',
      'esm/**/*',
      'cjs/**/*'
    ],
    sideEffects: false,
    unpkg: `${packageJson.name}.umd.js`,
    main: `${packageJson.name}.umd.js`,
    module: `./${FOLDERS.ESM}/${packageJson.name}.${FOLDERS.ESM}.js`,
    types: 'index.d.ts',
    exports: {
      './package.json': './package.json',
      '.': {
        import: {
          types: `./${FOLDERS.ESM}/index.d.ts`,
          default: `./${FOLDERS.ESM}/${packageJson.name}.${FOLDERS.ESM}.js`
        },
        require: {
          types: `./${FOLDERS.CJS}/index.d.ts`,
          default: `./${FOLDERS.CJS}/${packageJson.name}.${FOLDERS.CJS}.js`
        }
      }
    }
  }

  const propsToDelete = ['scripts', 'exports', 'main', 'unpkg', 'module']
  propsToDelete.forEach((prop) => delete packageJson[prop])

  const files = [`${packageJson.name}*`, 'components/**/*', 'index.d.ts']
  const packageJsonEsm = {
    ...packageJson,
    module: `${packageJson.name}.${FOLDERS.ESM}.js`,
    files,
    type: 'module'
  }
  const packageJsonCjs = {
    ...packageJson,
    main: `${packageJson.name}.${FOLDERS.CJS}.js`,
    files,
    type: 'commonjs'
  }

  if (!fs.existsSync(outFolder)) fs.mkdirSync(outFolder)
  if (!fs.existsSync(esmFolder)) fs.mkdirSync(esmFolder)
  if (!fs.existsSync(cjsFolder)) fs.mkdirSync(cjsFolder)

  fs.writeFileSync(
    path.join(outFolder, 'package.json'),
    JSON.stringify(packageJsonMain, null, '\t')
  )

  fs.writeFileSync(
    path.join(esmFolder, 'package.json'),
    JSON.stringify(packageJsonEsm, null, '\t')
  )

  fs.writeFileSync(
    path.join(cjsFolder, 'package.json'),
    JSON.stringify(packageJsonCjs, null, '\t')
  )

  const esmTypesFilePath = path.join(esmFolder, 'index.d.ts')
  const esmTypesFile = fs.readFileSync(esmTypesFilePath, 'utf-8')
  const esmTypesFileWithImportExtensions = addImportExtensions(esmTypesFile)

  fs.writeFileSync(esmTypesFilePath, esmTypesFileWithImportExtensions)

  readFiles(path.join(esmFolder, 'components/'), (filename, fileContent) => {
    const fileContentWithImportExtensions = addImportExtensions(fileContent)
    fs.writeFile(filename, fileContentWithImportExtensions, (error) => {})
  })
}

function createNodeNextSupport() {
  return {
    name: 'createNodeNextSupport',
    closeBundle: createNodeNextSupportForPackage
  }
}

export {
  FOLDERS,
  CONFIG_BABEL,
  CONFIG_TYPESCRIPT,
  CONFIG_GLOBALS,
  CONFIG_EXTERNAL_MODULES,
  CONFIG_EXTERNAL_MODULE_SUPPRESS,
  babel,
  typescript,
  resolve,
  terser,
  createBuildPath,
  kebabToPascalCase,
  createNodeNextSupport
}