import {
  Button,
  MorphingDialog,
  MorphingDialogActions,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogMedia,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
  useToast,
} from "@sheenui/theme";

/**
 * The "Gallery" demo of /effects/morphing-dialog. The page loads it as an island (lazyBlock, eager: requested while the page
 * hydrates), so the dialog code stays out of the page's initial JS (the example-page budget); the prerendered HTML already
 * shows the finished cards.
 */
type Place = { name: string; region: string; art: string; body: string; facts: [string, string][] };

const places: Place[] = [
  {
    name: "Aurora",
    region: "Lofoten, Norway",
    art: "[background:radial-gradient(80%_60%_at_30%_20%,var(--sheen-chart-3),transparent_70%),radial-gradient(70%_70%_at_80%_40%,var(--sheen-chart-1),transparent_70%),linear-gradient(180deg,var(--sheen-ink-900),var(--sheen-ink-700))]",
    body: "Winter nights here last almost the whole day, and when the sky is clear the northern lights ripple green and violet over the fjords. Stay in a fisherman's cabin on stilts and watch from the window.",
    facts: [
      ["Best time", "Sep – Mar"],
      ["Flight", "2 h from Oslo"],
    ],
  },
  {
    name: "Dunes",
    region: "Wadi Rum, Jordan",
    art: "[background:radial-gradient(60%_50%_at_75%_25%,var(--sheen-chart-4),transparent_70%),linear-gradient(170deg,var(--sheen-chart-2),var(--sheen-chart-8))]",
    body: "Red sandstone towers and soft dunes, crossed by jeep by day and lit only by stars at night. Bedouin camps serve zarb, a feast slow-cooked in the sand.",
    facts: [
      ["Best time", "Mar – May"],
      ["Drive", "4 h from Amman"],
    ],
  },
  {
    name: "Lagoon",
    region: "Bora Bora, French Polynesia",
    art: "[background:radial-gradient(70%_60%_at_25%_75%,var(--sheen-chart-3),transparent_70%),linear-gradient(160deg,var(--sheen-chart-7),var(--sheen-chart-1))]",
    body: "A turquoise lagoon ringed by a reef, with the green peak of Otemanu in the middle. Snorkel with rays in the morning, paddle at sunset.",
    facts: [
      ["Best time", "May – Oct"],
      ["Flight", "50 min from Tahiti"],
    ],
  },
];

function PlaceArt({ art }: { art: string }) {
  return (
    <span aria-hidden className={`relative block size-full ${art}`}>
      {/* Hard shapes make the flight easy to follow. */}
      <span className="absolute end-[12%] bottom-[16%] aspect-square w-[18%] rounded-full bg-sheen-accent-fg/75 shadow-[0_0_24px_4px_color-mix(in_oklab,var(--sheen-accent-fg)_35%,transparent)]" />
      <span className="absolute bottom-0 start-0 h-[28%] w-full [background:linear-gradient(transparent,color-mix(in_oklab,var(--sheen-ink-950)_35%,transparent))]" />
    </span>
  );
}

function PlaceCard({ place }: { place: Place }) {
  const toast = useToast();
  return (
    <MorphingDialog>
      <MorphingDialogTrigger className="w-full p-2 pb-4">
        <MorphingDialogMedia className="aspect-[4/3]">
          <PlaceArt art={place.art} />
        </MorphingDialogMedia>
        <MorphingDialogTitle className="px-2 pt-2">{place.name}</MorphingDialogTitle>
        <MorphingDialogSubtitle className="px-2">{place.region}</MorphingDialogSubtitle>
      </MorphingDialogTrigger>
      <MorphingDialogContent className="p-3 pb-6">
        <MorphingDialogMedia className="aspect-[4/3]">
          <PlaceArt art={place.art} />
        </MorphingDialogMedia>
        <div className="px-3 pt-4">
          <MorphingDialogTitle>{place.name}</MorphingDialogTitle>
          <MorphingDialogSubtitle>{place.region}</MorphingDialogSubtitle>
        </div>
        <MorphingDialogDescription className="flex flex-col gap-4 px-3 pt-3">
          <p>{place.body}</p>
          <dl className="grid grid-cols-2 gap-3">
            {place.facts.map(([term, value]) => (
              <div key={term} className="rounded-sheen-md bg-sheen-hover px-3 py-2">
                <dt className="text-xs text-sheen-fg-muted">{term}</dt>
                <dd className="font-medium text-sheen-fg">{value}</dd>
              </div>
            ))}
          </dl>
        </MorphingDialogDescription>
        <MorphingDialogActions className="px-3 pt-4">
          <Button onClick={() => toast.success(`${place.name} saved to your trips`)}>Plan a trip</Button>
        </MorphingDialogActions>
      </MorphingDialogContent>
    </MorphingDialog>
  );
}

export function MorphingGalleryDemo() {
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {places.map((place) => (
        <li key={place.name}>
          <PlaceCard place={place} />
        </li>
      ))}
    </ul>
  );
}
