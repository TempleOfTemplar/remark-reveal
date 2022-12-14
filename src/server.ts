import path from 'path';
import express from 'express';
import favicon from 'serve-favicon';
import liveReload from 'livereload';
import {renderMarkdown} from './render';
import {renderMarkdownFileListing} from './listing';
import {getAssetsDir, getFaviconPath, getHost, getInitialDir, getInitialPath, getPort, getWatch} from './config';
import {highlightThemePath, revealBasePath} from './constants';

const staticDir = express.static;

const assetsDir = getAssetsDir();
const host = getHost();
const port = getPort();
const isLiveReload = getWatch();

export const startServer = async () => {
  const app = express();
  const initialDir = await getInitialDir();
  const initialPath = await getInitialPath();

  const faviconPath = await getFaviconPath();
  app.use(favicon(faviconPath));

  ['plugin', 'dist'].forEach(dir => {
    app.use('/' + dir, staticDir(path.join(revealBasePath, dir)));
  });

  app.use('/css/highlight', staticDir(highlightThemePath));

  if (isLiveReload) {
    const liveReloadServer = liveReload.createServer({
      /* Live Reload defaults + 'md' */
      exts: ['html', 'css', 'js', 'png', 'gif', 'jpg', 'php', 'php5', 'py', 'rb', 'erb', 'coffee', 'md']
    });
    liveReloadServer.watch(initialDir);
  }

  app.get(/(\w+\.md)/, renderMarkdown);

  app.use(`/${assetsDir}`, staticDir(process.cwd(), {fallthrough: false}));
  app.use('/', staticDir(initialDir));

  app.get('/*', renderMarkdownFileListing);

  const server = app.listen(port);

  console.log(`Reveal-server started at http://${host}:${port}`); // eslint-disable-line no-console

  return [server, `http://${host}:${port}/${initialPath}`];
};

