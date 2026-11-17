import { useState } from "react";
import { GlassCard, SegmentedControl, SheenScene } from "@sheenui/theme";

import { BASE_PATH } from "../seo/site";

const scenes = ["room", "swoosh", "street", "hills", "studio"] as const;

/** The live demo of the "Scene switcher" example on /foundations: the same URLs as its Code panel, under the site base. */
export function SceneSwitcherDemo() {
  const [scene, setScene] = useState<string>("room");
  const url = (file: string) => `${BASE_PATH}scenes/${file}`;

  return (
    <div className="flex w-full flex-col gap-4">
      <SegmentedControl
        aria-label="Scene"
        value={scene}
        onValueChange={setScene}
        items={scenes.map((name) => ({ value: name, label: name }))}
      />
      <div className="relative isolate overflow-hidden rounded-sheen-lg">
        <SheenScene
          key={scene}
          src={url(`${scene}-v2.webp`)}
          avifSrc={url(`${scene}-v2.avif`)}
          srcSet={`${url(`${scene}-800-v2.webp`)} 800w, ${url(`${scene}-v2.webp`)} 1600w`}
          avifSrcSet={`${url(`${scene}-800-v2.avif`)} 800w, ${url(`${scene}-v2.avif`)} 1600w`}
          sizes="(min-width: 768px) 768px, 100vw"
          dim={0.5}
        />
        <div className="relative grid min-h-64 grid-cols-1 content-center gap-3 p-4 sm:grid-cols-3">
          {([1, 2, 3] as const).map((level) => (
            <GlassCard key={level} level={level} className="p-4">
              <code className="font-sheen-mono text-sm font-semibold">glass-{level}</code>
              <p className="mt-1 text-sm text-sheen-fg-muted">Blurs the {scene} scene.</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
