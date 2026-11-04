import fs from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

// 所有平台资源从同一 SVG 生成，避免品牌调整后残留旧图标。
const source = fs.readFileSync(new URL('../assets/deepdot.svg', import.meta.url));
for (const target of ['../web/public/icon.svg', '../docs/assets/deepdot-logo.svg']) {
  fs.writeFileSync(new URL(target, import.meta.url), source);
}
for (const size of [180, 192, 512, 1024]) {
  const image = new Resvg(source, { fitTo: { mode: 'width', value: size } }).render().asPng();
  fs.writeFileSync(new URL(`../web/public/icon-${size}.png`, import.meta.url), image);
}
