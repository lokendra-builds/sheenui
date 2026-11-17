import { Avatar } from "@sheenui/theme";

import type { AvatarScene } from "./ShowcaseStage.avatar";

const TEAM = ["Maya Chen", "Jonas Berg", "Priya Nair", "Leo Alvarez"];

/** The live Avatars on their stage: initials on a gradient, presence dots that come online. */
export function AvatarScene({ scene }: { scene: AvatarScene }) {
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-title">Design team</p>
      <div className="flex items-center gap-3">
        {TEAM.map((name, i) => (
          <Avatar key={name} name={name} size="lg" status={i < scene.online ? "online" : "offline"} />
        ))}
      </div>
      <p className="sheen-stage-sub sheen-stage-slot">
        {scene.online === 0 ? "Everyone is offline." : `${scene.online} of ${TEAM.length} online`}
      </p>
    </div>
  );
}
