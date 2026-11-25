# Third-party notices

SheenUI is released under the [MIT License](LICENSE). It builds on the open-source software, fonts and data listed here. This file reproduces their licence notices where a licence asks for that, and lists what is only used to build, test or document the project.

The package list was produced with `pnpm -r licenses list --prod` on 8 November 2026 against `pnpm-lock.yaml`, and the copyright lines were read from each package's own licence file. Regenerate it whenever dependencies change (`pnpm -r licenses list --prod --json`).

**How SheenUI is distributed matters here.** The library is source code you copy into your own app, so what lands in your app is the code in `theme/src` plus the npm packages you install for it (section 1). The docs site (`demo/`) additionally bundles fonts and data (sections 2 and 3). Build and test tooling (section 4) is never shipped.

## Contents

1. [Runtime dependencies (production)](#1-runtime-dependencies-production)
2. [Fonts](#2-fonts)
3. [Map data](#3-map-data)
4. [Build, test and image tooling (not shipped)](#4-build-test-and-image-tooling-not-shipped)
5. [Trademarks](#5-trademarks)

## 1. Runtime dependencies (production)

`@sheenui/theme` declares `@base-ui/react`, `@tanstack/react-table` (Data Table only), `clsx`, `motion` and `tailwind-merge`, and expects `react` and `react-dom` 19 from your app. With their dependencies that is 25 packages, **24 under the MIT licence and 1 (`tslib`) under 0BSD**. There is no GPL, AGPL, LGPL, SSPL or unlicensed code in the production tree.

| Package | Version | Licence | Copyright |
|---|---|---|---|
| [@babel/runtime](https://babel.dev/docs/en/next/babel-runtime) | 8.0.8 | MIT | 2014-present Sebastian McKenzie and other contributors |
| [@base-ui/react](https://base-ui.com) | 1.9.0 | MIT | 2019 Material-UI SAS |
| [@base-ui/utils](https://github.com/mui/base-ui#readme) | 0.5.0 | MIT | 2019 Material-UI SAS |
| [@floating-ui/core](https://floating-ui.com) | 1.8.0 | MIT | 2021-present Floating UI contributors |
| [@floating-ui/dom](https://floating-ui.com) | 1.8.0 | MIT | 2021-present Floating UI contributors |
| [@floating-ui/react-dom](https://floating-ui.com/docs/react-dom) | 2.1.9 | MIT | 2021-present Floating UI contributors |
| [@floating-ui/utils](https://floating-ui.com) | 0.2.12 | MIT | 2021-present Floating UI contributors |
| [@tanstack/react-store](https://tanstack.com/store) | 0.11.2 | MIT | 2021 Tanner Linsley |
| [@tanstack/react-table](https://tanstack.com/table) | 9.3.1 | MIT | 2016 Tanner Linsley |
| [@tanstack/store](https://tanstack.com/store) | 0.11.2 | MIT | 2021 Tanner Linsley |
| [@tanstack/table-core](https://tanstack.com/table) | 9.3.1 | MIT | 2016 Tanner Linsley |
| [@types/react](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react) | 19.3.0 | MIT | Microsoft Corporation. |
| [clsx](https://github.com/lukeed/clsx#readme) | 2.1.1 | MIT | Luke Edwards |
| [csstype](https://github.com/frenic/csstype#readme) | 3.2.3 | MIT | 2017-2018 Fredrik Nicol |
| [framer-motion](https://github.com/motiondivision/motion#readme) | 14.10.1 | MIT | 2018 Framer B.V. |
| [motion](https://github.com/motiondivision/motion#readme) | 14.10.1 | MIT | 2024 Motion B.V. |
| [motion-dom](https://github.com/motiondivision/motion#readme) | 14.10.1 | MIT | 2024 Motion B.V. |
| [motion-utils](https://github.com/motiondivision/motion#readme) | 14.7.0 | MIT | 2024 Motion B.V. |
| [react](https://react.dev/) | 19.3.1 | MIT | Meta Platforms, Inc. and affiliates. |
| [react-dom](https://react.dev/) | 19.3.1 | MIT | Meta Platforms, Inc. and affiliates. |
| [reselect](https://github.com/reduxjs/reselect#readme) | 5.3.0 | MIT | 2015-2018 Reselect Contributors |
| [scheduler](https://react.dev/) | 0.28.0 | MIT | Meta Platforms, Inc. and affiliates. |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | 3.7.0 | MIT | 2021 Dany Castillo |
| [tslib](https://www.typescriptlang.org/) | 2.8.1 | 0BSD | Microsoft Corporation. |
| [use-sync-external-store](https://github.com/react/react#readme) | 1.7.0 | MIT | Meta Platforms, Inc. and affiliates. |

`tslib` is 0BSD, which needs no attribution; it is listed for completeness. [Tailwind CSS](https://tailwindcss.com) v4.3.5 (MIT, Copyright (c) Tailwind Labs, Inc.) compiles the utilities that SheenUI's components use, and the compiled CSS of the docs site carries its notice.

### MIT License

The 24 MIT-licensed packages above are each distributed under the following terms, with the copyright line shown in the table:

```text
MIT License

Copyright (c) <year> <copyright holder, as listed in the table>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 2. Fonts

The docs site self-hosts its fonts from [Fontsource](https://fontsource.org) packages, so the font files (WOFF2 subsets) are served from this project's own domain. The theme itself ships no font files; your app chooses its fonts. All seven families are licensed under the **SIL Open Font License 1.1** (OFL), which allows use, embedding and redistribution, including commercial use, as long as the copyright notice and licence travel with the fonts and the fonts are not sold on their own. SheenUI does not modify the fonts or use their reserved names for derivatives.

| Family | Package (5.3.0) | Copyright notice |
|---|---|---|
| Inter (static, used for Open Graph cards) | `@fontsource/inter` | Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter) |
| Inter (variable) | `@fontsource-variable/inter` | Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter) |
| Inter Tight (variable) | `@fontsource-variable/inter-tight` | Copyright 2022 The Inter Project Authors (https://github.com/rsms/inter-tight) |
| Geist (variable) | `@fontsource-variable/geist` | Copyright 2024 The Geist Project Authors (https://github.com/vercel/geist-font) |
| Geist Mono (variable) | `@fontsource-variable/geist-mono` | Copyright 2024 The Geist Project Authors (https://github.com/vercel/geist-font) |
| JetBrains Mono (variable) | `@fontsource-variable/jetbrains-mono` | Copyright 2020 The JetBrains Mono Project Authors (https://github.com/JetBrains/JetBrainsMono) |
| Instrument Serif | `@fontsource/instrument-serif` | Copyright 2022 The Instrument Serif Project Authors (https://github.com/Instrument/instrument-serif) |

The Fontsource packages themselves are licensed under OFL-1.1 as well; their font files come from the upstream projects named in the notices above.

### SIL Open Font License, Version 1.1

```text
-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
```

## 3. Map data

The `WorldMap` chart draws country outlines from `theme/src/components/charts/geo/world-110m.ts`. That file is generated (see its header) from:

- **Natural Earth** 1:110m Cultural Vectors, Admin 0 Countries. Public domain, no permission needed. "Made with Natural Earth. Free vector and raster map data at [naturalearthdata.com](https://www.naturalearthdata.com)." Boundaries and names follow Natural Earth's de facto view; they are not a political statement.
- **[world-atlas](https://github.com/topojson/world-atlas) 2.0.2**, the TopoJSON packaging of Natural Earth, under the ISC licence (below).
- **[i18n-iso-countries](https://github.com/michaelwittig/node-i18n-iso-countries)**, used once at generation time to match ISO 3166-1 codes to the shapes, MIT licence. It is not a dependency of this project.

```text
ISC License

Copyright 2013-2019 Michael Bostock

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

## 4. Build, test and image tooling (not shipped)

These packages run on a developer machine or in CI. None of their code is copied into your app or served by the docs site. The counts are for the 502 packages installed on the maintainer's machine (`pnpm -r licenses list`, macOS arm64); platform-specific optional binaries differ per OS.

| Licence | Packages |
|---|---|
| MIT | 398 |
| Apache-2.0 | 34 |
| BSD-2-Clause | 20 |
| ISC | 17 |
| BSD-3-Clause | 8 |
| OFL-1.1 (the fonts in section 2) | 7 |
| BlueOak-1.0.0 | 6 |
| MPL-2.0 | 4 |
| CC0-1.0 | 2 |
| 0BSD | 1 |
| (MIT OR CC0-1.0) | 1 |
| CC-BY-4.0 | 1 |
| CC-BY-3.0 | 1 |
| LGPL-3.0-or-later | 1 |
| FSL-1.1-Apache-2.0 | 1 |

Licences that deserve a note:

- **Open Graph card images** (docs site) are drawn at build time with [satori](https://github.com/vercel/satori) 0.63.2 (MPL-2.0) and rasterised with [sharp](https://sharp.pixelplumbing.com) 0.35.5 (Apache-2.0). The cards use the static Inter faces from section 2. Only the resulting PNG files are published, not the tools.
- **libvips** is bundled with sharp as the prebuilt binary `@img/sharp-libvips-*` (LGPL-3.0-or-later). It is dynamically loaded by sharp on the build machine only. It is not distributed with SheenUI, so the LGPL has no effect on your app or on this repository's MIT licence.
- **MPL-2.0** (file-level copyleft) applies to satori, [axe-core](https://github.com/dequelabs/axe-core) (accessibility tests) and [lightningcss](https://lightningcss.dev) (used by Tailwind's build). SheenUI does not modify or redistribute them.
- **`sentry` 0.45.0** (FSL-1.1-Apache-2.0, the Functional Source License) arrives only as a transitive dependency of `lighthouse` (used for SEO and performance checks). SheenUI does not call it or ship it.
- **`caniuse-lite`** (CC-BY-4.0) and **`spdx-exceptions`** (CC-BY-3.0) are data packages used by build tools; attribution is given here: caniuse-lite data is by Alexis Deveria and contributors (caniuse.com), spdx-exceptions is by Kyle E. Mitchell.

No package in the tree has an unknown or missing licence, and none is under GPL, AGPL or SSPL.

## 5. Trademarks

React, Tailwind CSS, Base UI, Motion, TanStack, Apple, Liquid Glass, Vite, Vercel and other product names are trademarks of their respective owners and are used only to describe compatibility. SheenUI is an independent project and is not affiliated with or endorsed by them. "Liquid Glass" is also the name Apple gives its design language; SheenUI's Liquid Glass style is an independent implementation.
