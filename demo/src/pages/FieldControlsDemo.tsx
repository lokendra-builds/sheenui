import { useState } from "react";
import { Rating, Switch } from "@sheenui/theme";

/** The "Every control with react-hook-form" preview of the Field page, loaded as an island (lazyBlock). */
export function FieldControlsDemo() {
  const [news, setNews] = useState(false);
  const [stars, setStars] = useState<number | null>(null);
  return (
    <div className="grid w-full max-w-sm gap-4">
      <Switch label="Send me news" checked={news} onCheckedChange={setNews} />
      <Rating label="Rating" value={stars} onValueChange={setStars} />
    </div>
  );
}
