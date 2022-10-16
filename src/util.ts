import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import {promisify} from 'util';
const yamlFrontMatter = require('yaml-front-matter');
import glob from 'glob';

const stat = promisify(fs.stat);

export const md = (() => {
  // Hack required since https://github.com/hakimel/reveal.js/commit/d780352b7f78e16635ce9fabf2dbb53639610f18
  // @ts-ignore
  global['Reveal'] = {
    registerPlugin: () => {
    }
  };
  return require('reveal.js/plugin/markdown/markdown')();
})();

export const isDirectory = _.memoize(async dir => {
  const stats = await stat(path.resolve(dir));
  return stats.isDirectory();
});

export const isFile = _.memoize(async dir => {
  const stats = await stat(path.resolve(dir));
  return stats.isFile();
});

export const parseYamlFrontMatter = content => {
  console.log("yamlFrontMatter", yamlFrontMatter);
  const document = yamlFrontMatter.loadFront(content.replace(/^\uFEFF/, ''));
  return {
    yamlOptions: _.omit(document, '__content'),
    markdown: document.__content || content
  };
};

export const getFilePaths = (workingDir, globPattern) => {
  return glob.sync(globPattern, {
    cwd: workingDir,
    ignore: '**/node_modules/**'
  });
};

export const isAbsoluteURL = path => path.indexOf('://') > 0 || path.indexOf('//') === 0;
