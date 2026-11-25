Canonical: https://lokendra-builds.github.io/sheenui/showcase

# React Component Showcase with Live Glass Demos

URL: https://lokendra-builds.github.io/sheenui/showcase
Sidebar name: Showcase

An animated React component showcase: 21 live SheenUI stories, from a Button to a login lamp, on glass stages that pause off-screen and for reduced motion.

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > Showcase

This React component showcase puts 21 SheenUI stories on one page: each card is a live glass component on a lit stage, and every card links to its docs page.

Three cards move at a time, only while they are on screen.

[See all components](https://lokendra-builds.github.io/sheenui/components/), or browse the [effects](https://lokendra-builds.github.io/sheenui/effects/) and [blocks](https://lokendra-builds.github.io/sheenui/blocks/).

## From a card to your app

Every card links to the page that documents it: the props, the keyboard and accessibility notes, the files to copy and the shadcn install command. For a whole screen, start with the [React glass login page](https://lokendra-builds.github.io/sheenui/blocks/glass-login) or the [lamp login](https://lokendra-builds.github.io/sheenui/blocks/lamp-login); for the refraction look, with [Liquid Glass UI for React](https://lokendra-builds.github.io/sheenui/effects/liquid-glass); for motion on its own, with the [animated React components](https://lokendra-builds.github.io/sheenui/effects/).


## When to use Showcase

- Use it to judge SheenUI at a glance before you install anything: each card plays the same story as the stage at the top of its component page, on the same lit glass stage, in whichever of the four looks you have chosen.
- Use it to compare motion: the springs, the glass and the pacing are shared tokens, so a Dialog, a Toast and a Command palette move alike.
- Open a card to reach the full docs page with live examples, props, keyboard table and the shadcn command that copies the source into your app.
- Skip it when you need to test a component yourself: the cards are pictures of a story and take no input, so use the examples on the component page instead.
- Share the page link when you want a team to see the library moving; it needs no sign-in and plays nothing it does not need to.


## Frequently asked questions

### Why do only some cards move at a time?

At most three cards animate at once, the ones nearest the middle of the screen, so scrolling stays smooth. The rest rest on the last frame of their story and start when they reach the middle.

### Do the animations pause when I leave the tab?

Yes. Cards stop when they scroll off screen and when the tab is hidden, and there is a Pause animations button on the page. Nothing runs in the background.

### What happens with reduced motion turned on?

Every card shows the final frame of its story and does not loop. That follows the operating system setting and SheenUI's own reduce motion switch.

### Are these real components or recordings?

They are the real components from @sheenui/theme, driven by small scripted stories. The Lamp login, Payment checkout and OTP verification cards type into the actual blocks.


## Showcase

- Component: [Animated React button](https://lokendra-builds.github.io/sheenui/components/button): A press, a loading spinner, then a green check and a sweep of light.
- Block: [Glass lamp login page for React](https://lokendra-builds.github.io/sheenui/blocks/lamp-login): Pull the cord and a warm light cone reveals the sign-in card.
- Component: [React OTP input with a glass seal](https://lokendra-builds.github.io/sheenui/components/otp-input): Six digits are typed, a light scans, then the cells fold into a glass seal.
- Block: [Glass payment checkout form](https://lokendra-builds.github.io/sheenui/blocks/payment-checkout): The card preview flips for the security code, then glows amber and green.
- Component: [React Switch with a spring thumb](https://lokendra-builds.github.io/sheenui/components/switch): The thumb springs across and the stage light switches on with it.
- Block: [React OTP verification screen](https://lokendra-builds.github.io/sheenui/blocks/otp-verification): A ring fills with every digit, then the padlock opens in a flood of light.
- Component: [Toast stack in React](https://lokendra-builds.github.io/sheenui/components/toast): A deploy pipeline raises, stacks and swaps glass notifications.
- Component: [React Tabs with a sliding pill](https://lokendra-builds.github.io/sheenui/components/tabs): The pill slides between tabs and a count badge ticks up.
- Component: [Glass modal dialog for React](https://lokendra-builds.github.io/sheenui/components/dialog): A strong-glass modal springs in over a dimmed stage, then confirms.
- Effect: [React morphing dialog](https://lokendra-builds.github.io/sheenui/effects/morphing-dialog): A card grows into a dialog and flies back to where it came from.
- Effect: [macOS-style dock in React](https://lokendra-builds.github.io/sheenui/effects/macos-dock): A pointer sweeps along the dock and the icons swell around it.
- Effect: [3D tilt card in React](https://lokendra-builds.github.io/sheenui/effects/3d-tilt-card): The card leans toward the pointer while a glare slides across the glass.
- Effect: [Spotlight card in React](https://lokendra-builds.github.io/sheenui/effects/spotlight-card): A soft light follows the pointer and lights the card's rim.
- Effect: [Liquid Glass effect for React](https://lokendra-builds.github.io/sheenui/effects/liquid-glass): A lens of refracting glass slides over the content behind it.
- Effect: [Animated border beam in React](https://lokendra-builds.github.io/sheenui/effects/border-beam): A comet of light runs around the rounded edge, then rests.
- Effect: [Blur-in text animation for React](https://lokendra-builds.github.io/sheenui/effects/blur-in): A headline sharpens out of a blur, word by word.
- Effect: [Typewriter text effect in React](https://lokendra-builds.github.io/sheenui/effects/typewriter): A phrase is typed with a human rhythm, deleted and replaced.
- Effect: [Animated number ticker in React](https://lokendra-builds.github.io/sheenui/effects/number-ticker): Odometer digits roll up to new revenue and user counts.
- Component: [React command palette](https://lokendra-builds.github.io/sheenui/overlays/command-palette): A shortcut opens the palette, a query filters it and Enter runs a command.
- Component: [Glass color picker for React](https://lokendra-builds.github.io/sheenui/forms/color-picker): The handle glides across the color area and the stage takes the color.
- Component: [React carousel with glass dots](https://lokendra-builds.github.io/sheenui/components/carousel): Slides advance one by one while the active dot fills.

---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
