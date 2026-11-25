/* =====================================================================
 * (e) Non-modal inspector next to a list
 * ===================================================================== */

type FileItem = {
  id: string;
  name: string;
  kind: string;
  size: string;
  owner: string;
  modified: string;
  shared: number;
  path: string;
};

export const FILES: FileItem[] = [
  {
    id: "f1",
    name: "Q4 roadmap.fig",
    kind: "Design file",
    size: "18.4 MB",
    owner: "Meera Iyer",
    modified: "2026-10-30T08:40:00Z",
    shared: 12,
    path: "/Design/Roadmaps",
  },
  {
    id: "f2",
    name: "Brand guidelines.pdf",
    kind: "PDF document",
    size: "6.2 MB",
    owner: "Tom Becker",
    modified: "2026-10-27T15:05:00Z",
    shared: 48,
    path: "/Brand",
  },
  {
    id: "f3",
    name: "Pricing experiments.xlsx",
    kind: "Spreadsheet",
    size: "742 KB",
    owner: "Lena Fischer",
    modified: "2026-10-26T11:22:00Z",
    shared: 5,
    path: "/Growth",
  },
  {
    id: "f4",
    name: "Onboarding flow.mp4",
    kind: "Video",
    size: "112 MB",
    owner: "Ravi Kumar",
    modified: "2026-10-21T17:48:00Z",
    shared: 3,
    path: "/Research/Sessions",
  },
  {
    id: "f5",
    name: "API changelog.md",
    kind: "Markdown",
    size: "24 KB",
    owner: "Grace Hopper",
    modified: "2026-10-19T09:30:00Z",
    shared: 31,
    path: "/Engineering/Docs",
  },
  {
    id: "f6",
    name: "Glass icons.svg",
    kind: "SVG image",
    size: "96 KB",
    owner: "Meera Iyer",
    modified: "2026-10-12T13:10:00Z",
    shared: 9,
    path: "/Design/Assets",
  },
];
