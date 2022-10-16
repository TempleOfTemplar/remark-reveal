import Mustache from 'mustache';
import path from 'path';
import {getFilesGlob, getInitialDir, getListingTemplate, getOptions, getThemeUrl} from './config';
import {getFilePaths, parseYamlFrontMatter} from './util';
import fs from 'fs-extra';

const getFileMeta = async filePath => {
  const baseDir = await getInitialDir();
  const markdownFilePath = path.join(baseDir, filePath).replace(/\.html$/, '.md');
  let yamlOptions = {};
  try {
    const markdown = (await fs.readFile(markdownFilePath)).toString();
    yamlOptions = parseYamlFrontMatter(markdown).yamlOptions;
  } catch (error) {
    console.error(error);
  }
  return Object.assign(
    {
      filePath,
      fileName: path.basename(filePath),
      absPath: path.resolve(filePath)
    },
    yamlOptions
  );
};

export const renderListFile = async filePaths => {
  const {title, listingTemplate, theme} = getOptions();
  const template = await getListingTemplate(listingTemplate);
  const themeUrl = getThemeUrl(theme, '.');
  const files = await Promise.all(filePaths.map(getFileMeta));
  return Mustache.render(template, {
    base: '',
    themeUrl,
    pageTitle: title,
    files
  });
};

export const renderMarkdownFileListing = async (req, res) => {
  const list = getFilePaths(await getInitialDir(), getFilesGlob());
  const markup = await renderListFile(list);

  res.send(markup);
};
