#!/usr/bin/env node
/**
 * 从 icons/icon.svg 生成 16、48、128 的 PNG，供扩展 default_icon 使用。
 * 运行: npm run build:icons（需先 npm install sharp）
 */
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const iconsDir = path.join(root, 'icons')
const svgPath = path.join(iconsDir, 'icon.svg')

const sizes = [16, 48, 128]

async function main() {
  let sharp
  try {
    sharp = (await import('sharp')).default
  } catch {
    console.error('请先安装 sharp: npm install -D sharp')
    process.exit(1)
  }

  const svg = readFileSync(svgPath)
  for (const size of sizes) {
    const outPath = path.join(iconsDir, `icon${size}.png`)
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(outPath)
    console.log(`  ${outPath}`)
  }
  console.log('icons 已生成: icon16.png, icon48.png, icon128.png')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
