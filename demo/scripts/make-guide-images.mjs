// Writes the 480 and 768 px WebP variants of the guide screenshots (demo/public/img) for srcset. Run after adding or
// replacing an image: `node scripts/make-guide-images.mjs`. The originals are copies of docs/img.
import { readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const dir = join(resolve(dirname(fileURLToPath(import.meta.url)), ".."), "public/img");
for (const name of readdirSync(dir).filter((f) => f.endsWith(".webp") && !/-\d+\.webp$/.test(f))) {
  for (const width of [480, 768]) {
    const { width: original } = await sharp(join(dir, name)).metadata();
    if (original && original > width)
      await sharp(join(dir, name))
        .resize({ width })
        .webp({ quality: 78 })
        .toFile(join(dir, name.replace(/\.webp$/, `-${width}.webp`)));
  }
}
console.log("guide image variants written");
