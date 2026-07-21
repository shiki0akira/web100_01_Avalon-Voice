// 建置後處理：把 Vite 打包產出（index.html、assets、audio）搬進 dist/avalon/，
// 讓實際的檔案結構跟 URL 路徑 /avalon/... 對得起來。
// dist 根目錄留給 sitemap.xml、robots.txt，以及之後補上的 Web100 首頁。

import { existsSync, mkdirSync, renameSync, copyFileSync } from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const avalonDir = path.join(distDir, 'avalon');

mkdirSync(avalonDir, { recursive: true });

const itemsToMove = ['index.html', 'assets', 'audio'];

for (const item of itemsToMove) {
  const src = path.join(distDir, item);
  const dest = path.join(avalonDir, item);
  if (existsSync(src)) {
    renameSync(src, dest);
    console.log(`Moved ${item} -> dist/avalon/${item}`);
  } else {
    console.warn(`⚠️  Expected build output "${item}" not found, skipping.`);
  }
}

console.log('Postbuild restructure complete.');

// 把首頁原始檔複製成 dist 根目錄的 index.html
const homepageSrc = path.resolve('homepage', 'index.html');
const homepageDest = path.join(distDir, 'index.html');
if (existsSync(homepageSrc)) {
  copyFileSync(homepageSrc, homepageDest);
  console.log('Copied homepage/index.html -> dist/index.html');
} else {
  console.warn('⚠️  homepage/index.html not found, root homepage was not created.');
}
