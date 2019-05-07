/* eslint-disable @typescript-eslint/no-var-requires */
const { src, dest, lastRun, watch, series } = require('gulp')
const { createProject } = require('gulp-typescript')
const { remove } = require('fs-extra')
const eslint = require('gulp-eslint')

const tsProject = createProject('tsconfig.json')
const tsSrc = 'src/**/*.ts'

function clean () {
  return remove('dist')
}

function scripts () {
  return tsProject.src()
    .pipe(tsProject())
    .pipe(dest('dist'))
}

function scriptsLint () {
  return src(tsSrc, { since: lastRun(scripts) })
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
}

const build = series(clean, scriptsLint, scripts)
function watcher () {
  watch(tsSrc, series(scriptsLint, scripts))
}

module.exports = {
  default: build,
  watch: series(clean, watcher)
}
