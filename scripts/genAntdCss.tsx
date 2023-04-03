import fs from "fs";
import path from "path";
import { StyleProvider, createCache, extractStyle } from "@ant-design/cssinjs";
import { renderToString } from "react-dom/server";
import { createHash } from "crypto";
import Entity from "@ant-design/cssinjs/lib/Cache";

const styleTagReg = /<style[^>]*>([\s\S]*?)<\/style>/g;

export type DoExtraStyleOptions = {
  cache: Entity;
  dir?: string;
  baseFileName?: string;
};
export function doExtraStyle({
  cache,
  dir = "antd-output",
  baseFileName = "antd.min",
}: DoExtraStyleOptions) {
  const baseDir = path.resolve(__dirname, "../../static/css");

  const outputCssPath = path.join(baseDir, dir);

  if (!fs.existsSync(outputCssPath)) {
    fs.mkdirSync(outputCssPath, { recursive: true });
  }

  const cssText = extractStyle(cache);
  const css = cssText.replace(styleTagReg, "$1");

  const md5 = createHash("md5");
  const hash = md5.update(css).digest("hex");
  const fileName = `${baseFileName}.${hash.substring(0, 8)}.css`;
  const fullpath = path.join(outputCssPath, fileName);

  const res = `_next/static/css/${dir}/${fileName}`;

  if (fs.existsSync(fullpath)) return res;

  fs.writeFileSync(fullpath, css);

  return res;
}
