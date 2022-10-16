/* eslint-disable no-console */
import _ from 'lodash';
import debug from 'debug';
import { getHost, getPort, getOptions, getPuppeteerLaunchConfig } from './config';
const host = getHost();
const port = getPort();

import puppeteer from 'puppeteer';

// try {
//   puppeteer = require('puppeteer');
// } catch (err) {
//   console.warn(`Puppeteer unavailable, unable to create featured slide image for OpenGraph metadata.`);
//   debug(err);
// }

const getSlideAnchor = featuredSlide => {
  const [slide, subslide] = featuredSlide.split('-').map(slide => _.parseInt(slide, 10));
  return `${isNaN(slide) ? '' : '#/' + slide + (isNaN(subslide) ? '' : '/' + subslide)}`;
};

export const featuredSlide = async (initialUrl, targetDir) => {
  const { featuredSlide } = getOptions();

  if (!featuredSlide || !puppeteer) {
    return;
  }

  const puppeteerLaunchConfig = getPuppeteerLaunchConfig();

  const snapshotFilename = `${targetDir}/featured-slide.jpg`;

  const url = `http://${host}:${port}/${initialUrl}${getSlideAnchor(featuredSlide.toString())}`;

  debug({ url, snapshotFilename, puppeteerLaunchConfig } as any);

  try {
    const browser = await puppeteer.launch(puppeteerLaunchConfig);
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1200 });
    await page.goto(url, { waitUntil: 'load' });
    await page.screenshot({ path: snapshotFilename, quality: 70, fullPage: true });
    await browser.close();
  } catch (err) {
    console.warn(`Error while generating featured slide snapshot for "${initialUrl}"]`);
    debug(err as any);
  }
};
