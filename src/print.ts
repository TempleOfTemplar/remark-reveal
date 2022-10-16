/* eslint-disable no-console */
import path from 'path';
import debug from 'debug';
import {revealBasePath} from './constants';
import {getPageOptions, getPuppeteerLaunchConfig} from './config';
import puppeteer from 'puppeteer';


export const exportPDF = async (initialUrl, print, printSize) => {
  if (!puppeteer) {
    return;
  }

  const puppeteerLaunchConfig = getPuppeteerLaunchConfig();

  const printPluginPath = path.join(revealBasePath, 'plugin', 'print-pdf', 'print-pdf.js');

  const filename = path.basename(initialUrl);
  const pdfFilename = typeof print === 'string' ? print : filename.replace(/\.md$/, '.pdf');

  debug({initialUrl, printPluginPath, pdfFilename, puppeteerLaunchConfig} as any);

  console.log(`Attempting to print "${filename}" to "${pdfFilename}".`);

  try {
    const browser = await puppeteer.launch(puppeteerLaunchConfig);
    const page = await browser.newPage();

    const pdfOptions = {path: pdfFilename, printBackground: true};
    Object.assign(pdfOptions, getPageOptions(printSize));

    await page.goto(`${initialUrl}?print-pdf`, {waitUntil: 'load'});
    await page.pdf(pdfOptions);
    await browser.close();
  } catch (err) {
    console.error(`Error while generating PDF for "${filename}"`);
    debug(err as any);
  }
};
