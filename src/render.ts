import path from 'path';
import _ from 'lodash';
import { md, parseYamlFrontMatter } from './util';
import fs from 'fs-extra';
import Mustache from 'mustache';
import defaults from './defaults.json';
import {
  getInitialDir,
  getTemplate,
  getPreprocessor,
  getSlideOptions,
  getRevealOptions,
  getThemeUrl,
  getHighlightThemeUrl,
  getScriptPaths,
  getCssPaths,
  getWatch
} from './config';

const slidifyProps = ['attributes', 'notesSeparator', 'separator', 'verticalSeparator'];
const getSlidifyOptions = context => _.pick(context, slidifyProps);

export const slidify = (markdown, slidifyOptions = _.pick(defaults, slidifyProps)) => {
  return md.slidify(markdown, slidifyOptions);
};

export const render = async (input, extraOptions = {}) => {
  const { yamlOptions, markdown } = parseYamlFrontMatter(input);
  const options = Object.assign(getSlideOptions(yamlOptions), extraOptions);

  const { title } = options;
  const themeUrl = getThemeUrl(options.theme, options.base);
  const highlightThemeUrl = getHighlightThemeUrl(options.highlightTheme);
  const revealOptions = Object.assign({}, getRevealOptions(options.revealOptions), yamlOptions.revealOptions);
  const scriptPaths = getScriptPaths(options.scripts, options.assetsDir, options.base);
  const cssPaths = getCssPaths(options.css, options.assetsDir, options.base);

  const preprocessorFn = getPreprocessor(options.preprocessor);
  const processedMarkdown = await preprocessorFn(markdown, options);

  const slides = slidify(processedMarkdown, getSlidifyOptions(options));

  const context = Object.assign(options, {
    title,
    slides,
    themeUrl,
    highlightThemeUrl,
    scriptPaths,
    cssPaths,
    revealOptionsStr: JSON.stringify(revealOptions),
    watch: getWatch()
  });

  const template = await getTemplate(options.template);

  return Mustache.render(template, context);
};

export const renderFile = async (filePath, extraOptions) => {
  try{
    const content = await fs.readFile(filePath);
    return render(content.toString(), extraOptions);
  }catch(e)
  {
    return render("File not found.", extraOptions)
  }
};

function sanitize(entry)
{
  if(entry.includes(".."))
  {
    entry = sanitize(entry.replace("..",""))
  }
  return entry
}

export const renderMarkdown = async(req, res) => {
  const dir = await getInitialDir();
  const filePath = path.join(dir, sanitize(decodeURIComponent(req.url)).replace(/\?.*/, ''));
  const markup = await renderFile(filePath, null);
  res.send(markup);
};
