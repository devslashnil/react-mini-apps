const fs = require('fs');
let numFolder = 1;
var jsonFormat = require('gulp-json-format');
const { src, dest, series } = require('gulp');
const change = require('gulp-change');
const { argv } = require('yargs');

fs.readdir('./src', (err, files) => {
  numFolder = files.length - files.includes('shareable');
});

const camelToSnakeCase = (str) =>
  str[0].toLowerCase() +
  str
    .slice(1, str.length)
    .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const copyDefaultApp = () => {
  if (argv.page === undefined)
    throw Error('Передайте параметр --page **PageName**, имя будущей страницы');
  const appName = `${camelToSnakeCase(argv.page)}-app`;
  return src('./src/default-app/**').pipe(
    dest(`./src/${camelToSnakeCase(appName)}`),
  );
};

const changeSubPkg = () => {
  const appName = `${camelToSnakeCase(argv.page)}-app`;
  return src(`./src/${appName}/package.json`)
    .pipe(
      change((content) => {
        return content
        .replace(/PAGE_NAME/g, argv.page)
        .replace(/default-app/g, appName)
        .replace('3010', String(3010 + numFolder)) // Обновляем порт
      }),
    )
    .pipe(dest(`./src/${appName}`));
};

const changeMainPkg = () => {
  const appName = `${camelToSnakeCase(argv.page)}-app`;
  return src('./package.json')
    .pipe(
      change((content) => {
        const pkg = JSON.parse(content);
        const buildCommand = `npm run build --prefix src/${appName}`;
        pkg.scripts.build = pkg.scripts.build
        ? `${pkg.scripts.build} && ${buildCommand}`
        : buildCommand;
        pkg.scripts[`build-${appName}`] = buildCommand;
        pkg.scripts[
          `start-${appName}`
        // eslint-disable-next-line no-useless-escape
        ] = `concurrently --kill-others \"npm run proxy\" \"npm run start --prefix src/${appName}\"`;
        return JSON.stringify(pkg);
      }),
    )
    .pipe(dest('.'));
};

const prettifyPkgJson = () => {
  return src('package.json')
    .pipe(jsonFormat(2)) // 2 - кол-во пробелов
    .pipe(dest('.'));
}

exports.add = series(copyDefaultApp, changeSubPkg, changeMainPkg, prettifyPkgJson);
