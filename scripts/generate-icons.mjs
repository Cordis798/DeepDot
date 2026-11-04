import fs from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

// 保留用户选定原图，SVG 容器只负责等比布局，不重新绘制造型和光影。
const original = fs.readFileSync(new URL('../assets/deepdot-logo.png', import.meta.url));
const source = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><title>DeepDot</title><rect width="1024" height="1024" fill="white"/><image width="1024" height="1024" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${original.toString('base64')}"/></svg>`;
for (const target of ['../assets/deepdot.svg', '../web/public/icon.svg', '../docs/assets/deepdot-logo.svg']) {
  fs.writeFileSync(new URL(target, import.meta.url), source);
}
for (const size of [180, 192, 512, 1024]) {
  const image = new Resvg(source, { fitTo: { mode: 'width', value: size } }).render().asPng();
  fs.writeFileSync(new URL(`../web/public/icon-${size}.png`, import.meta.url), image);
}
