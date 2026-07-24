// 建置後處理：把 Vite 打包產出（index.html、assets、audio）搬進 dist/avalon/，
// 讓實際的檔案結構跟 URL 路徑 /avalon/... 對得起來。
// 首頁（web100_00_Homepage）已經拆成獨立 repo，這裡不再處理首頁相關檔案。

import { existsSync, mkdirSync, renameSync } from 'node:fs';
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
