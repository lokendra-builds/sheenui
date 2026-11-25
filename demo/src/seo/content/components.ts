import type { PageContent } from "../page-content";

export const content: Record<string, PageContent> = {
  "/components/alert": {
    when: [
      "Use Alert as an inline message in React for a form-level error above a checkout form, such as a declined card, where the message must stay on screen next to the fields the person has to fix.",
      "Use it for a plan-limit banner at the top of a settings page, with an action button like Upgrade placed at the end of the row and a close button for people who have seen it.",
      "Use the success tone for a saved confirmation that should remain readable until the next navigation, instead of vanishing the way a toast does after a few seconds.",
      "Skip it when the message should disappear by itself after a short moment or must block the page until answered. Use Toast for the first case and Dialog or AlertDialog for the second.",
      "Pair it with Button for the action slot, Field or Input for the form it explains, and Toast for the lighter follow-up feedback once the problem is fixed.",
    ],
    faq: [
      {
        q: "How do I make a dismissible alert in React with SheenUI?",
        a: "Set the dismissible prop and the alert shows a close button and hides itself when pressed. For control, pass open and onOpenChange, which receives false on dismiss, or use defaultOpen when uncontrolled. The close button is named by labels.dismiss, so translate that string for other languages.",
      },
      {
        q: "Which ARIA role does the alert component use?",
        a: "The role depends on the tone. Danger and warning default to role alert, which screen readers announce immediately. Info and success default to role status, announced politely. You can override it, and role none suits a message already on screen at page load so nothing is announced twice.",
      },
      {
        q: "Can I replace the icon or add a button to the alert?",
        a: "Yes. The icon prop replaces the tone icon with your own node, and icon={false} hides it. The action prop takes a button or link rendered at the end of the alert. Keep it a real control, since the alert itself is not focusable and the action is a normal tab stop.",
      },
      {
        q: "Does the alert still animate when the user prefers reduced motion?",
        a: "It simplifies. Normally the alert moves 6px into place while fading in and leaves with a shorter fade. When reduced motion is on, through the OS setting or the in-app toggle, it only fades with no vertical movement. The tinted surface is near opaque, so text keeps contrast on photos too.",
      },
    ],
  },

  "/components/avatar": {
    when: [
      "Use Avatar with an initials fallback beside each author in a comment thread or activity feed, where a profile picture gives people a quick visual anchor and initials cover users who never uploaded one.",
      "Use the status prop for an avatar with status in a team directory or chat sidebar that shows who is online, away or offline, with the hollow ring marking offline so color is not the only cue.",
      "Use AvatarGroup for a stack of project members on a card header, labeled with an aria-label that says who the people are, such as Project members.",
      "Skip it when the picture itself must be clicked or must act as a control. Avatar takes no focus, so wrap it in a Button or a link, or use a Badge for non-person labels.",
      "Pair it with Tooltip to reveal a full name on hover, DataTable for a user column with a picture, and Badge for a role label placed under the name.",
    ],
    faq: [
      {
        q: "What does the React avatar component show when the image fails to load?",
        a: "It shows initials built from the name prop, taking the first letters of up to the first two words, uppercased. With an image, the initials appear after a short 400ms delay if it is still loading, and stay if it fails. Under the hood it uses Base UI Avatar, so the fallback swaps in without extra state in your code.",
      },
      {
        q: "How do I make an avatar accessible?",
        a: "Pass the full name. It becomes the alt text of the image, and the initials fallback is exposed as role img with the name as its label. The presence dot is its own labeled image reading online, away or offline. The avatar itself is not interactive and takes no focus.",
      },
      {
        q: "What sizes does the SheenUI Avatar support?",
        a: "Three sizes through the size prop: sm at 32px, md at 40px, which is the default, and lg at 56px. The pixel width and height are also written on the img element, so the browser reserves the box before the image arrives and the layout does not shift.",
      },
      {
        q: "How do I make an avatar clickable?",
        a: "Avatar is deliberately not interactive, so wrap it in a Button (for example the ghost variant) or a link with its own accessible name. That keeps focus and keyboard activation on a real control, and the avatar inside stays a plain image with its label.",
      },
    ],
  },

  "/components/badge": {
    when: [
      "Use Badge on an invoice list or a project card to label an item Paid, Draft or Beta in one short word, with a dot or an icon beside it so the state never rests on color alone.",
      "Use it for a count beside a navigation item, for example 3 new beside Inbox, and choose the accent or solid tone to separate it from neutral labels.",
      "Use the dot and pulse props for a live state like a running deploy or an active stream; the ping runs a few times then rests, and stays still under reduced motion.",
      "Skip it when the label must be clicked, toggled or removed. A Badge takes no focus, so use Button for an action or Toggle for a pressed state instead.",
      "Pair it with Avatar for a role under a name, DataTable cells for status columns, and Progress when a state needs a number and not only a word.",
    ],
    faq: [
      {
        q: "Which tones does the react badge component offer?",
        a: "The tone prop takes neutral, accent, success, warning, danger or solid, with neutral as the default. Neutral is a glass surface, the colored tones are flat tints over a near-opaque base, and solid is a filled accent. Every badge carries words so color is never the only signal.",
      },
      {
        q: "Does the pulsing dot loop forever?",
        a: "No. The pulse prop pings the dot a few times, four according to the source comments, and then rests with a solid dot, which keeps it within WCAG 2.2.2 on endless motion. Under reduced motion the ping is skipped and only the static dot remains.",
      },
      {
        q: "Can I use Badge as a button?",
        a: "Not directly. Badge renders a span with the normal span attributes and is not interactive or focusable. For something clickable, use a Button, for example the ghost or glass variant at the sm size, so keyboard users get a real tab stop and Enter or Space activation.",
      },
      {
        q: "Will badge text stay readable over images?",
        a: "Yes for the colored tones. The tint is layered over a near-opaque surface, so the tone text color keeps a 4.5:1 contrast ratio over glass, photos or blobs. The neutral tone uses a single glass surface, and the status dot is aria-hidden so screen readers only read the words.",
      },
    ],
  },

  "/components/button": {
    when: [
      "Use Button as a glassy, animated button in React for the main call to action on a landing page, with the primary variant for the one action you want taken and glass or ghost for secondary choices beside it.",
      "Use the loading prop on a Save or Pay button so the click is ignored while a request runs, the spinner shows, and focus stays on the button.",
      "Use the render prop to make a router link look and behave like a button, for example a See pricing link, without nesting an anchor inside a button element.",
      "Skip it when the control chooses a value or a view, not an action. Use Toggle for a pressed state, SegmentedControl for one of a few options, and Tabs for switching panels.",
      "Pair it with Dialog and Popover triggers through the render prop, Spinner or BorderBeam as children, and Tooltip to name an icon-only button with the icon size.",
    ],
    faq: [
      {
        q: "How do I build a glass button in React with SheenUI?",
        a: "Set variant to glass. It renders one frosted glass-1 surface with a light ripple from the press point. The other variants are primary, outline, ghost, link and danger. Sizes are sm, md and lg, plus icon for a 40px square, and fullWidth stretches it across its container.",
      },
      {
        q: "What happens to a button while loading is true?",
        a: "It shows a spinner, ignores clicks and sets aria-busy. It uses aria-disabled instead of the disabled attribute, so keyboard focus is never lost mid-action. A click handler is skipped, and preventDefault also cancels a form submit or a link navigation while the work runs.",
      },
      {
        q: "Can the button render as a link or a Base UI trigger?",
        a: 'Yes, through the render prop: Button render={<Link to="/pricing" />}. Link semantics are kept, and type and disabled are not added; a disabled state is announced with aria-disabled. It also works as the render target of Base UI triggers such as DialogTrigger.',
      },
      {
        q: "How do I recolor the danger button?",
        a: "The danger fill is a gradient background-image over a solid color of the same red. To recolor, override both, for example className bg-orange-700 with the arbitrary class [background-image:none], or set the --sheen-danger-fill variable. Overriding only the background color leaves the gradient visible.",
      },
    ],
  },

  "/components/checkbox": {
    when: [
      "Use Checkbox as a React checkbox component for independent yes or no options in a settings form, such as email me about product updates, where each choice can be on or off without affecting the others.",
      "Use the indeterminate prop for a select all row above a list, so the parent shows a mixed state when only some of the child checkboxes are checked.",
      "Use label and description for a terms and conditions line, with the explanation under the label sharing one label element so clicking either toggles the box.",
      "Skip it when the setting applies immediately with no submit step. Use Switch for that, and RadioGroup when exactly one option out of several must be picked.",
      "Pair it with Field or a form library for validation, Button for the submit action, and DataTable, which uses checkbox cells for row selection and bulk actions.",
    ],
    faq: [
      {
        q: "How do I build an animated checkbox in React with SheenUI?",
        a: "Use the Checkbox component. The accent fill fades in on its own layer and the check mark draws itself using SVG pathLength; both leave faster than they arrive. Under reduced motion the mark simply fades, with no drawing or scaling. You get that without writing any animation code.",
      },
      {
        q: "How do I show an error on a checkbox?",
        a: "Pass the error prop. It marks the control invalid with aria-invalid and a danger border, shows the message under the control and links it through aria-describedby so it is announced. Any aria-describedby you pass yourself is kept alongside it.",
      },
      {
        q: "Which keys toggle the checkbox?",
        a: "Tab focuses it and Space toggles it. It is a real checkbox role, so indeterminate is exposed as aria-checked mixed. Clicking the label or description also toggles it, because they share a label element. Without a visible label, give the checkbox an aria-label.",
      },
      {
        q: "What props does the checkbox accept?",
        a: "Everything Base UI Checkbox.Root takes, including checked, defaultChecked, onCheckedChange, indeterminate, disabled, readOnly, required, name and value. On top of that it adds label, description and error. The checked state works controlled with useState or uncontrolled with defaultChecked.",
      },
    ],
  },

  "/components/combobox": {
    compare: {
      title: "Looking for Select2 in React?",
      text: "Select2 is a jQuery plugin for searchable selects, tags and remote data. SheenUI's Combobox gives the same features in React without jQuery: type to filter, multiple selection as removable chips, grouped options, created options through onCreate and async search through loadOptions, built on Base UI's Combobox so the ARIA pattern is correct.",
    },
    when: [
      "Use Combobox as a Select2-style searchable select for a country or timezone picker, where the list has dozens of entries and people would rather type a few letters than scroll a long menu. Use it as an autocomplete for React and Tailwind projects when a plain select is too long to scan and people need to type to narrow the options.",
      "Use multiple with chips for choosing tags or assignees, with maxSelected to cap the count and Backspace to remove the last chip from the keyboard.",
      "Use loadOptions for a user search backed by an API; requests are debounced by debounceMs, and loading, empty and failed states with a Try again option are shown in the popup.",
      "Skip it when there are only a handful of fixed options. Use Select for a short list, RadioGroup for two or three visible choices, or Command for an app-wide action search.",
      "Pair it with Field or react-hook-form through name, ref and onBlur, Badge or Avatar as option icons, and Button for the submit step of the form around it.",
    ],
    faq: [
      {
        q: "How do I build a React combobox with search and multi-select?",
        a: "Pass options with value and label, then set multiple and manage value as a string array with onValueChange. Selected items appear as removable chips. Add maxSelected to stop adding after a limit. It is built on Base UI Combobox, so the ARIA combobox pattern comes with it.",
      },
      {
        q: "How does async search work?",
        a: "Provide loadOptions, a function that takes the query and returns a promise of options. Calls are debounced, 250ms by default, tunable with debounceMs. The popup shows searching, a start typing hint, and an error with a retry option; onError receives the thrown error for logging.",
      },
      {
        q: "Can users create an option that is not in the list?",
        a: "Yes. Pass onCreate, which receives the typed label and returns the new option or a promise of it. A Create option then appears in the list. If it throws, a message shows under the field and onError is called. All of these strings can be translated through labels.",
      },
      {
        q: "Which keyboard shortcuts does the combobox support?",
        a: "Type to filter, Down or Up to move through options, Enter to pick and Escape to close. On a closed single-select list Escape clears the value, controlled by clearOnEscape. In multiple mode Backspace removes the last chip and Left or Right move across the chips.",
      },
    ],
  },

  "/components/data-table": {
    compare: {
      title: "SheenUI DataTable or the shadcn data table recipe?",
      text: "The shadcn/ui data table is a recipe: you assemble columns, filters and pagination around TanStack Table yourself. SheenUI's DataTable is a finished component on TanStack Table v9: you pass data, columns and a caption and get search, faceted filters, multi-sort, pagination, row selection with bulk actions and a server mode through manual. Choose the recipe for full control of every cell; choose this one to skip the wiring.",
    },
    when: [
      "Use DataTable as a React table with filters and pagination for an admin list of users or orders where people need search with highlighted matches, multi-column sorting and a faceted Status filter with counts. If you are looking for a shadcn data table alternative, this one comes with sorting, paging, selection and a caption in a single component.",
      "Use enableSelection with bulkActions for a list where people pick rows across several pages and then export, archive or delete them from the floating selection bar.",
      "Use manual with rowCount and the controlled sorting, pagination and filter props when the dataset lives on a server and only the current page is in memory.",
      "Skip it when you only need a few static rows or a key value layout. A plain table, DescriptionList or a stack of GlassCard items is lighter and easier to scan.",
      "Pair it with the Pagination component it already uses in its footer, Badge, Avatar and Progress through the StatusCell, UserCell and ProgressCell helpers, and Toast to confirm a bulk action or a finished CSV export.",
    ],
    faq: [
      {
        q: "How do I build a React data table with sorting and search?",
        a: "Pass data, columns and a caption, the three required props. Each column needs only an id and a header; the id is also the accessor key unless you set accessorKey or accessorFn. Search, sorting, faceted filters, paging and CSV export all run client-side by default. It uses TanStack Table v9 headless underneath, so you do not wire that library yourself.",
      },
      {
        q: "How does server-side mode work?",
        a: "Set manual and pass rowCount, plus controlled state props for sorting, pagination, search and filters. The data prop then holds only the current page. The toolbar Export button appears only when you provide an export handler, because the table cannot export rows it does not have.",
      },
      {
        q: "Is the data table accessible?",
        a: "It renders a real table with a caption, scoped headers and aria-sort on sorted columns. Sorting, paging, selection and result counts are announced through one polite live region, and checkboxes carry row-specific names. Sortable headers work with Enter or Space, and Shift-click or Shift+Enter adds a sort column.",
      },
      {
        q: "What happens on small screens?",
        a: "By default the table scrolls sideways, with the first data column pinned unless you turn off stickyFirstColumn. Set mobileLayout to cards and rows become glass cards under 640px. A column can opt out of the card with hideInCards. The scroll region is keyboard reachable.",
      },
    ],
  },

  "/components/dialog": {
    when: [
      "Use Dialog as a glass modal for a short form that blocks the page, such as renaming a project or inviting a teammate, where the person finishes or cancels before going back to the page. Use it as an animated modal in React whenever the content needs the person's full attention.",
      "Use it for a details view opened from a table row or a card, with DialogTitle and DialogDescription naming and describing it for screen readers.",
      "Use DialogFooter with DialogClose for Cancel and Save actions, and keep the corner close button on with showClose unless the footer already offers a clear exit.",
      "Skip it when the person must answer a destructive question, where AlertDialog fits better, or when the content is a side panel you want next to the page, where Drawer fits better.",
      "Pair it with Button through the render prop on DialogTrigger, Input and Field for the form inside, and Toast to confirm the result after the dialog closes.",
    ],
    faq: [
      {
        q: "How do I build a React modal dialog with SheenUI?",
        a: "Compose Dialog with DialogTrigger and DialogContent, then DialogHeader, DialogTitle, DialogDescription and DialogFooter inside. Dialog holds open, defaultOpen and onOpenChange and renders no element. It wraps Base UI Dialog, so the portal, focus handling and scroll lock are already done.",
      },
      {
        q: "How does the dialog handle keyboard focus?",
        a: "Enter or Space on the trigger opens it and focus moves to the first control inside. Tab and Shift+Tab stay in the dialog, Escape or a click on the scrim closes it, and focus returns to the trigger. The page behind is inert and its scroll is locked.",
      },
      {
        q: "Do I have to include a title?",
        a: "Yes, always render one. DialogTitle is an h2 and the dialog's accessible name, with aria-labelledby wired for you; DialogDescription gives aria-describedby. If the design has no visible heading, add className sr-only to the title so it stays available to assistive technology.",
      },
      {
        q: "How do I change the size or hide the close button?",
        a: "DialogContent is centered, at most 28rem wide and never taller than the viewport; it scrolls inside. Override width with className. Set showClose to false to remove the corner button, and use labels to translate its aria-label, which is Close by default.",
      },
    ],
  },

  "/components/glass-card": {
    when: [
      "Use GlassCard as a glassmorphism card for the tiles on a dashboard or pricing page, where grouped content sits on a gradient or photo background and the frosted surface keeps text readable.",
      "Use the tint prop to mark a featured plan or highlighted stat, so one card among several reads as accent colored without writing custom styles.",
      "Use interactive for a clickable card in a project grid, adding role, tabIndex and key handlers yourself, so it lifts on hover and shows a solid focus ring.",
      "Skip it when you need the full refracting lens look, which LiquidGlass provides, or when a page has more than a handful of cards in view, since each is a backdrop-filter surface.",
      "Pair it with Badge and Button in the footer, Avatar in the header, and Progress or NumberTicker in the content area for stat cards.",
    ],
    faq: [
      {
        q: "How do I create a glassmorphism card in React?",
        a: "Render GlassCard and compose GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent and GlassCardFooter inside it. It is a div with backdrop blur, and level 1, 2 or 3 sets how opaque the glass is, from chips and cards to dialogs and bars. Level 2 is the default.",
      },
      {
        q: "Does the card have a performance limit?",
        a: "Each GlassCard is one backdrop-filter surface, and the source states a budget of at most 8 in view at once. Past that, use fewer glass surfaces or plain containers for inner content. Reduced transparency makes the card opaque, and forced colors give it a solid border and background.",
      },
      {
        q: "What does the sheen prop do?",
        a: "It adds a soft highlight that follows the pointer, on by default. It only reacts to mouse and pen, never touch, and it stays at rest with reduced motion. Set sheen to false to turn it off. The light moves with a composited translate, so the card is not repainted on each move.",
      },
      {
        q: "Is a GlassCard focusable?",
        a: "Not on its own. It has no role, so a plain card is just a group of content. For a clickable card, give it role link or button with tabIndex 0 and key handlers; interactive then draws a solid focus ring. Every div prop, including onClick and className, is accepted.",
      },
    ],
  },

  "/components/input": {
    when: [
      "Use Input as a text input with label and error for single-line entry like email, password, search and names in a sign-in or checkout form, where a label and an error message must be tied to the field.",
      "Use leading and trailing for a search box with a magnifier icon, or a password field with a show button inside the right edge of the field.",
      "Use the error prop for server-side validation messages, which mark the field invalid with aria-invalid and are announced without moving focus.",
      "Skip it when the text spans several lines or the value is a stepped number. Use Textarea for multi-line text, NumberField for a stepper, and OtpInput for a fixed-length code.",
      "Pair it with Button for submit, its label, description and error props for the field text, and Select or Combobox in the same form, since all three share the className wrapper convention.",
    ],
    faq: [
      {
        q: "How do I add a label and error to a glass input in React?",
        a: "Pass label, description and error. Base UI Field links them to the input through aria-labelledby, aria-describedby and aria-invalid. The description is hidden while an error shows, and the error is announced to screen readers. Without a visible label, set aria-label instead.",
      },
      {
        q: "What does className style on the Input?",
        a: "className styles the outer wrapper that holds label, field and messages, matching Select and Combobox. Use inputClassName for the native input element. Every other prop, such as type, value, onChange and autoComplete, passes to the input.",
      },
      {
        q: "Will iOS zoom into the field on focus?",
        a: "The input is 44px tall with 16px text on touch screens, which is what stops iOS Safari from zooming on focus. The control border keeps a 3:1 contrast against its surroundings for WCAG 1.4.11, and forced colors mode keeps a visible border.",
      },
      {
        q: "Does the input work with form libraries?",
        a: "Yes. It accepts the native input props, so value, onChange, name, ref and onBlur work with controlled state or libraries such as react-hook-form. Typing, selection and browser autofill behave natively, because the field renders a real input element inside the glass wrapper.",
      },
    ],
  },

  "/components/otp-input": {
    compare: {
      title: "SheenUI OtpInput or input-otp?",
      text: "input-otp is a headless one-time-code library. SheenUI's OtpInput is built on Base UI's OTP field and arrives styled: glass slots, paste and SMS autofill, grouped and mask options, and error and success feedback through the status prop. Use input-otp if you want to draw every slot yourself; use this one if you want a finished, accessible field to copy.",
    },
    when: [
      "Use OtpInput as a verification code input in React on a two-factor sign-in or phone verification screen, where an SMS or authenticator code of fixed length arrives and people type or paste it. Treat it as an input-otp alternative when you want styled, labeled code slots instead of a headless primitive.",
      "Use onComplete to verify the code the moment the last digit lands, and set status to error or success to shake the field or play a soft ripple with a message.",
      "Use grouped for a six digit code shown as 3 + 3, or mask when the code is sensitive and should not be readable over someone's shoulder.",
      "Skip it when the value is not a fixed-length numeric code. Use Input for an email or a recovery phrase, including a password with a show button in its trailing slot.",
      "Pair it with Button for a resend action, Alert for a rate-limit message, and the OTP verification block, which already assembles these pieces on one screen.",
    ],
    faq: [
      {
        q: "How do I build a React OTP input with SheenUI?",
        a: "Render OtpInput with a length, 6 by default, and handle value with onValueChange or leave it uncontrolled with defaultValue. onComplete fires once every slot is filled. It is built on Base UI OTPField, and name submits the joined code with a form.",
      },
      {
        q: "Can users paste a code or use SMS autofill?",
        a: "Yes to both. Pasting a whole code fills every slot at once, and the slots use autoComplete one-time-code, so phones can offer the SMS code. Typing advances to the next slot, Backspace clears and moves back, and the left and right arrow keys move between slots.",
      },
      {
        q: "How are the slots named for screen readers?",
        a: "The first slot is named by the label or aria-label, which defaults to Verification code. The others are named Digit n of N through digitLabel, which you can translate. Error and success messages sit in a polite live region, and each slot is at least 44px wide and 48px tall.",
      },
      {
        q: "How do I trigger the error shake more than once?",
        a: "Set status back to idle before setting it to error again. The shake and the success ripple play when the status changes, so repeating the same status does nothing. Both animations use transform and opacity only, and both are skipped when reduced motion is on.",
      },
    ],
  },

  "/components/popover": {
    when: [
      "Use Popover for a Filters or Share button in a toolbar that opens a compact panel with a few fields and a confirm action, kept next to the button so the page behind stays in view.",
      "Use it for an account menu with a profile summary and a sign out button, or a share panel with a link field, where content stays near the trigger.",
      "Use side, align and sideOffset on PopoverContent to place the panel, knowing it flips to the other side when there is no room in the viewport.",
      "Skip it when the content is a plain hint or a list of commands. Use Tooltip for a label on hover, Menu for actions, and Dialog when the task needs the whole page's attention.",
      "Pair it with Button through the render prop on PopoverTrigger, Field and Switch for settings inside the panel, and Calendar when a date picker needs custom content.",
    ],
    faq: [
      {
        q: "How do I build a React popover with SheenUI?",
        a: "Compose Popover with PopoverTrigger and PopoverContent, then PopoverTitle, PopoverDescription and your controls inside. Popover holds open, defaultOpen and onOpenChange and renders no element. It wraps Base UI Popover, so positioning, outside-press handling and focus management are included.",
      },
      {
        q: "How does the popover behave with the keyboard?",
        a: "Enter or Space on the trigger toggles it, focus moves into the panel, and Tab cycles inside it. Escape or an outside press closes it and returns focus to the trigger. The trigger gets aria-expanded and aria-controls automatically; the panel is a dialog named by PopoverTitle.",
      },
      {
        q: "Can I change the popover width and position?",
        a: "The panel is w-72 and never wider than the viewport minus 2rem; override it with className. side defaults to bottom, align to center and sideOffset to 8px. A preferred side flips when there is no room. Everything else passes to the Base UI popup.",
      },
      {
        q: "What does the popover do with reduced motion or transparency?",
        a: "The panel is a glass-2 surface that fades and springs in from the trigger side. With reduced motion it only fades. Reduced transparency and forced colors both give it a solid surface, so text stays readable when the backdrop blur is switched off by the user.",
      },
    ],
  },

  "/components/progress": {
    when: [
      "Use Progress as an animated progress bar for a file upload or an import job where the total is known, showing the percentage on the right and a label like Uploading report.pdf above the bar.",
      "Use it for a multi-step setup wizard, passing value and a max equal to the number of steps so the bar fills as each step completes.",
      "Use value null for an indeterminate bar while a request has no known length, which Base UI exposes without aria-valuenow so screen readers do not read a false number.",
      "Skip it when the number is a measurement against a range, such as disk space or password strength, where Meter fits. Use Spinner for tiny waits and Skeleton for content shapes.",
      "Pair it with Button to start or cancel the task, Toast for completion, and DataTable progress cells to show per-row status in a long list.",
    ],
    faq: [
      {
        q: "How do I make a React progress bar with SheenUI?",
        a: "Render Progress with a value from 0 to max, which defaults to 100 so value reads as a percentage. Add a label, which also names the bar for assistive technology. Set showValue to false to hide the percentage, and pass locale for prerendered pages so server and browser text match.",
      },
      {
        q: "What does an indeterminate progress bar look like?",
        a: "Pass value as null. The bar slides to signal loading with no known end, and Base UI omits aria-valuenow, aria-valuemin and aria-valuemax in that state. Under reduced motion it becomes a static, half-tone full-width bar instead of sliding.",
      },
      {
        q: "How does it animate between values?",
        a: "The fill is a full-width bar moved with translateX, transform only, so the rounded leading edge never distorts and the track clips it. A light sweeps across the fill a few times after each change. With reduced motion the fill jumps straight to each new value.",
      },
      {
        q: "Is the progress bar focusable?",
        a: "No. It is a read-out with role progressbar, so it takes no tab stop. Base UI supplies aria-valuenow, min and max for determinate values, and the label provides the name. Forced colors keep the fill visible, and the percentage is formatted in the locale you pass.",
      },
      {
        q: "When should I use Progress, Meter or Spinner?",
        a: "Use Progress for a task with a known length, such as an upload or a setup wizard, and pass value={null} while the length is unknown. Use Meter for a measurement against a range, such as disk used or password strength. A Spinner says that something is busy without saying how far along it is.",
      },
      {
        q: "Can I hide the percentage or translate it?",
        a: 'Yes. showValue turns the percentage text on or off, and the number is formatted in the locale prop. label names the bar for assistive tech: Base UI renders role="progressbar" with aria-valuenow, aria-valuemin and aria-valuemax, and leaves all three out while the value is null.',
      },
    ],
  },

  "/components/select": {
    when: [
      "Use Select as a glass select for a short, fixed list like a sort order, a time zone preset or a billing plan, where people pick one value and the options fit in one popup. Use it as a custom select in Tailwind projects when the native dropdown cannot be styled to match the rest of the page.",
      "Use group, icon and description on items for a language or workspace picker, where headings, flags or a second line help people choose the right entry.",
      "Use error, required and name for a field inside a form, with the value submitted natively and the message linked to the trigger for screen readers.",
      "Skip it when the list is long enough that people want to type to find an item, or when several values can be picked. Combobox handles both, and RadioGroup suits two or three visible choices.",
      "Pair it with Input and Combobox in the same form, which share the className wrapper convention, and Field or react-hook-form through ref, onBlur and name.",
    ],
    faq: [
      {
        q: "How do I build a React select dropdown with SheenUI?",
        a: 'Render Select with an items array of value and label objects, then control it with value and onValueChange, or leave it uncontrolled with defaultValue. Add label, description and placeholder, which defaults to "Select…". It wraps Base UI Select, so the listbox behavior comes included.',
      },
      {
        q: "Which keys work on the select?",
        a: "Enter, Space or the Down arrow opens the list. Up and Down move through options, Home and End jump to the ends, and typing jumps to a matching option. Enter or Space selects, and Escape closes and returns focus to the trigger. Disabled items are shown but cannot be selected.",
      },
      {
        q: "How do I style the trigger and wrapper separately?",
        a: "className styles the outer wrapper that holds label, trigger and helper text, as in Input and Combobox. triggerClassName styles the button. For forms it forwards ref to the trigger, plus onBlur, name, required, disabled, aria-invalid and aria-describedby, so form libraries can focus it after a failed validation.",
      },
      {
        q: "When should I switch from Select to Combobox?",
        a: "Switch when people would rather type than scroll, or when they need several values. Select supports typeahead jumping but has no search box, async loading or chips. Combobox adds filtering, loadOptions, onCreate and a multiple mode with removable chips, and takes options with the same value and label fields.",
      },
    ],
  },

  "/components/slider": {
    when: [
      "Use Slider for a price range filter, a zoom level or an audio volume, where a thumb on a track is quicker than typing; pair it with a visible value when the exact number matters. For a dual range slider in Tailwind, pass two values and the component draws two thumbs on one track.",
      "Use two values for a price range filter on a product list, with minStepsBetweenValues keeping the thumbs from crossing and the bubble showing the value above the thumb while dragging.",
      "Use onValueCommitted to save a setting once when the drag or key press ends, rather than firing a request on every step of onValueChange.",
      "Skip it when people must enter an exact figure, where NumberField fits, or when there are three or four named choices, where SegmentedControl or RadioGroup is clearer.",
      "Pair it with NumberField for a typed fallback, Field to describe the range, and Button to apply the filter after the range is chosen.",
    ],
    faq: [
      {
        q: "How do I build a React range slider with two thumbs?",
        a: "Pass an array of two numbers as value or defaultValue, and one thumb appears per entry. The thumbs are named Minimum and Maximum unless you set your own labels. Use minStepsBetweenValues to enforce a gap between them, and min, max and step to set the scale.",
      },
      {
        q: "Which keyboard keys move the slider?",
        a: "Tab focuses each thumb. The arrow keys change the value by one step, PageUp and PageDown by 10 (the value, not ten steps) by default, which largeStep can change, and Home and End jump to the ends. Each thumb is a native input type range, so it reports value, min and max.",
      },
      {
        q: "How do I stop saving on every drag step?",
        a: "Use onValueCommitted. onValueChange fires on every change while dragging or pressing keys, while onValueCommitted fires once when the pointer is released or a key press is done. Saving there avoids a flood of requests while the value moves under the thumb.",
      },
      {
        q: "Does the slider work on touch screens?",
        a: "Yes. The track is 44px tall on touch, and showBubble, on by default, shows the value above the thumb during a drag so a finger does not hide it. Thumb scaling and the bubble spring are gated by motion preferences; reduced motion keeps only color and opacity changes.",
      },
    ],
  },

  "/components/switch": {
    when: [
      "Use Switch as an animated switch in React for settings that apply the moment they change, such as dark mode, push notifications or a public profile toggle in an account page. Use it as a Framer Motion switch: the thumb moves with Motion, the library formerly called Framer Motion, on the shared SheenUI spring.",
      "Use label and description together for a preferences row, so the text and the helper line sit in one label element and clicking the words flips the switch.",
      "Use the error prop when a toggle can fail to save, for example a server rejection, so the message shows under the control and is announced to screen readers.",
      "Skip it when the choice is only applied after a form is submitted. Use Checkbox for that, and use RadioGroup or SegmentedControl when the choice is between named options.",
      "Pair it with GlassCard for a settings panel, Toast to confirm that a change was saved, and Field or the settings-page block for grouped preference rows.",
    ],
    faq: [
      {
        q: "How do I make a react toggle switch with SheenUI?",
        a: "Render Switch with label and either checked plus onCheckedChange, or defaultChecked for uncontrolled use. It takes every Base UI Switch.Root prop, so name, value, disabled, readOnly and required work. className goes on the switch track, not on the wrapper around the label.",
      },
      {
        q: "Which keys toggle the switch?",
        a: "Tab focuses it, and Space toggles it. Enter toggles it too, since it is a button, and Enter from the switch never submits a surrounding form. It exposes role switch with aria-checked, and the off-state track keeps a 3:1 border for WCAG 1.4.11.",
      },
      {
        q: "How does the thumb animate?",
        a: "The accent fill fades in on its own layer and the thumb springs across, stretching toward its destination while pressed and carrying its velocity if toggled again mid-slide. With reduced motion the thumb snaps into place and only the fill fades.",
      },
      {
        q: "Does a switch need a label?",
        a: "Yes, it needs an accessible name. Use the label prop, which wraps the control in a label element, or pass aria-label when the design shows no text. The description only renders together with a label. Touch screens get a 44px hit area around the track.",
      },
    ],
  },

  "/components/spinner": {
    when: [
      "Use Spinner next to a Saving label or inside a disabled button while a request runs and you cannot say how long it will take; switch to Progress once you can report how far along it is.",
      "Use showLabel to print the word Loading next to the ring in an empty state, and keep the default hidden label for places where the ring alone is clear.",
      "Use tone current to inherit the surrounding text color inside a button or a badge, and the xs or sm sizes to fit a line of text.",
      "Skip it when the task has a measurable end, where Progress fits, or when you know the shape of the incoming content, where Skeleton gives a calmer placeholder.",
      "Pair it with Button, which shows its own spinner through the loading prop, useOffscreenLoops near the app root to pause off-screen loops, and EmptyState for a loading panel.",
    ],
    faq: [
      {
        q: "How do I add a loading spinner in React with SheenUI?",
        a: "Render Spinner. Choose size from xs at 12px to xl at 48px, with md at 24px as the default, and tone from accent, current or muted. It is a role status live region with a hidden Loading label, so mounting it announces Loading politely. Remove it when the work finishes.",
      },
      {
        q: "How do I translate the spinner label?",
        a: 'Pass labels with a loading string, for example labels={{ loading: "Chargement" }}. That text is what a screen reader says and what showLabel prints. The default is Loading, and the partial object you pass is merged over the English defaults.',
      },
      {
        q: "What happens with reduced motion?",
        a: "The arc stops turning and shows as a static arc on its track, with the same Loading label for screen readers. Normally it turns once a second using a CSS rotation transform. The track keeps 3:1 contrast and forced colors draw it in CanvasText.",
      },
      {
        q: "Should the spinner go inside a button?",
        a: "Put it next to the content it replaces, or inside a button that has aria-busy. If you use SheenUI Button, set its loading prop instead, which shows the spinner, ignores clicks and sets aria-busy for you, so you do not need to compose the pieces by hand.",
      },
    ],
  },

  "/components/tabs": {
    when: [
      "Use Tabs as a React tabs component with a sliding indicator for a settings page with Profile, Billing and Security sections, where related panels share one place and the sliding glass pill shows the current section.",
      "Use it for a product page with Overview, Specs and Reviews, keeping a panel mounted through keepMounted when it holds state such as a half-filled form.",
      "Use activateOnFocus on TabsList when selection should follow keyboard focus, and the controlled value with onValueChange when the active tab should live in app state or the URL.",
      "Skip it when the choice changes a value, not a panel, where SegmentedControl is lighter, or when the links navigate to separate pages, where VerticalNav or Navbar fit better.",
      "Pair it with GlassCard for the panel content, Badge for counts inside a tab label, and Select on narrow screens when you have more sections than fit.",
    ],
    faq: [
      {
        q: "How do I build animated tabs in React with SheenUI?",
        a: "Compose Tabs with TabsList, TabsTab and TabsPanel. Give each TabsTab and TabsPanel the same value, and use defaultValue, or value with onValueChange, to control it. The pill slides through Base UI CSS variables, a translate transition on the glass track, and jumps instead of sliding under reduced motion.",
      },
      {
        q: "Which keys work on the tab list?",
        a: "Tab enters the list once, on the active tab, then moves on to the panel. Left and Right arrows move between tabs, Up and Down when vertical, Home and End jump to the ends, and Enter or Space activates the focused tab. The panel itself is focusable so scrollable content stays reachable.",
      },
      {
        q: "What happens when the tabs do not fit?",
        a: "The list scrolls sideways instead of clipping. The scrollbar is hidden, tabs snap into place, the edges fade where more is hidden, and the active tab scrolls into view whenever it changes. Name the list with aria-label when the page does not already name it.",
      },
      {
        q: "Are inactive panels kept in the DOM?",
        a: "No, inactive panels are hidden, and the leaving panel is removed at once so quick switching never shows two panels. Add keepMounted to a TabsPanel to keep it rendered. The entering panel rises 6px using a transform only; with reduced motion it simply appears.",
      },
    ],
  },

  "/components/toast": {
    compare: {
      title: "Choosing between SheenUI Toast and Sonner",
      text: "Sonner is a popular React toast library built around one global toast() call. SheenUI's toast is built on Base UI's Toast: you wrap the app in ToastProvider, render one Toaster and call useToast() for toast.success, toast.info, toast.error and toast.dismiss. Toasts stack, expand on hover or focus, can be swiped away, pause their timer while hovered or focused and fade under reduced motion. Choose Sonner if you want a global function and nothing to provide; choose this one if you want glass styling, Base UI's accessibility model and the source in your own repository.",
    },
    when: [
      "Use Toast as an animated toast in React for short, non-blocking feedback such as Saved, Copied to clipboard or Invite sent, where the person can keep working and the message needs no answer. If you are comparing a sonner alternative, SheenUI's Toast is called through the useToast hook and styled with the same glass tokens as the rest of the kit.",
      "Use toast.error for a failed background request, such as a sync that did not finish, with a description line explaining what to try next.",
      "Use position on Toaster for bottom-center on a mobile-first app or top-right on a desktop dashboard, remembering that on phones every position spans the screen width.",
      "Skip it when the message must stay visible next to a form or needs a decision. Use Alert for persistent inline messages and Dialog or AlertDialog when the person must answer.",
      "Pair it with Button actions that call useToast, Switch and Checkbox settings that save instantly, and DataTable bulk actions that finish in the background.",
    ],
    faq: [
      {
        q: "How do I show a toast notification in React with SheenUI?",
        a: "Wrap your app in ToastProvider and render one Toaster inside it. In any component below, call const toast = useToast(), then toast.success(title, description), toast.info or toast.error. Titles and descriptions are React nodes, and toast.dismiss(id) closes one toast, or all of them with no id.",
      },
      {
        q: "How does keyboard and screen reader support work?",
        a: "Toasts are announced politely through a live region and never steal focus. F6 moves focus to the viewport in Base UI, Tab reaches each Dismiss button, and Enter, Space or Escape closes the focused toast. The timer pauses while a toast is hovered or focused, giving time to read.",
      },
      {
        q: "Can I swipe a toast away?",
        a: "Yes. Swipe toward the nearest edge on touch; on phones either side dismisses. The exit speed follows the swipe velocity, clamped to a range of 60 to 400 ms. Under reduced motion toasts fade only and the stack rearranges without sliding, though swiping still tracks your finger.",
      },
      {
        q: "How do I translate the toast Dismiss button?",
        a: 'Pass labels to Toaster with a dismiss string, such as labels={{ dismiss: "Fermer" }}. The default is Dismiss. The region itself is named by the label prop, Toast notifications by default (so it never clashes with a Notifications panel), so give each stack its own name if a page renders more than one.',
      },
    ],
  },

  "/components/tooltip": {
    when: [
      "Use Tooltip to label icon-only buttons in an editor toolbar (Bold, Italic, Export) on hover and on keyboard focus, and put the shortcut, such as Ctrl+B, beside the name.",
      "Use it for short supplementary hints on a form, like why a field wants a particular format, where the hint is useful but nobody is blocked without it.",
      "Use TooltipProvider once near the app root so moving between neighboring triggers shows the next tip at once, and use delay to tune the 300ms default.",
      "Skip it when the content is essential, long or interactive. Use Popover for controls, HoverCard for a rich preview, and plain visible text when a label must always be readable.",
      "Pair it with Button using size icon, Kbd to show shortcuts inside the tip, and Avatar or Badge when a name or status needs a short explanation.",
    ],
    faq: [
      {
        q: "How do I add a react tooltip with SheenUI?",
        a: "Wrap a single element that accepts a ref in Tooltip and pass content as the text. Choose side, which defaults to top and flips near the viewport edge, align, and delay in ms, 300 by default. Use open with onOpenChange to control it, or disabled to switch it off.",
      },
      {
        q: "Does the tooltip work with the keyboard and touch?",
        a: "It shows when the trigger gets focus and hides on blur or Escape, and the trigger keeps its own tab stop. On touch, a long press of about half a second shows it for a couple of seconds, and lifting the finger does not activate the trigger.",
      },
      {
        q: "Is the tooltip text announced by screen readers?",
        a: "The bubble has role tooltip and, while open, the trigger points to it with aria-describedby, merged with any description the trigger already has. It describes but does not name, so an icon-only button still needs its own aria-label. Never hide a control's only label inside a tooltip.",
      },
      {
        q: "Why use TooltipProvider?",
        a: "It lets people move from one trigger to the next and see the next tooltip instantly instead of waiting out the delay again. Place it once near the app root. It renders no element and adds no tab stops, and each Tooltip inside keeps its own behavior.",
      },
    ],
  },
  "/components/table": {
    when: [
      "Use Table for a pricing comparison, a spec sheet or the rate limits of an API plan: a handful of rows read top to bottom, with no sorting or paging. It renders a real table element, so screen readers announce rows and columns, and on a narrow screen the glass region scrolls sideways.",
      "Give every table a TableCaption, visible or sr-only. It names the table, and the scrolling region takes the caption text as its own name unless you pass regionLabel.",
      'Use scope="col" or scope="row" on TableHead so a screen reader announces the right header for each cell.',
      "Skip it when people need to sort, filter, page or select rows. Use DataTable for that, and Pagination below a long list.",
      "Pair it with Badge in cells for status, Tooltip for column help, and ScrollArea only when you need a fixed height.",
    ],
    faq: [
      {
        q: "How do I build an accessible React table with glass styling?",
        a: "Compose Table, TableCaption, TableHeader, TableBody, TableRow, TableHead and TableCell like HTML. Table renders native table semantics inside one glass-2 region, so no ARIA roles are added by hand.",
      },
      {
        q: "What happens when the table is wider than its container?",
        a: "The region becomes a keyboard tab stop and scrolls sideways, so the page never overflows. A table that fits adds no tab stop.",
      },
      {
        q: "Where do className and ref go?",
        a: "To the outer scrolling region. Use tableClassName to style the table element itself; every other attribute lands on the table.",
      },
      {
        q: "Should I use Table or DataTable?",
        a: "Use Table for static content you write by hand. Use DataTable when the data is dynamic and needs sorting, filtering, paging, selection or column visibility.",
      },
      {
        q: "How does a screen reader name the table and its scrolling region?",
        a: 'The table is named by its TableCaption, visible or with className="sr-only". While the table overflows, the scrolling region becomes a named region that takes the caption text as its name, or the regionLabel prop if you pass one. TableHead with scope="col" or scope="row" tells assistive tech which header belongs to each cell.',
      },
      {
        q: "Can I add a totals row?",
        a: "Yes. TableFooter holds the summary rows and is written like TableBody. The full set is Table, TableCaption, TableHeader, TableBody, TableFooter, TableRow, TableHead and TableCell.",
      },
      {
        q: "Does the table animate?",
        a: "No. Rows tint on hover and nothing moves, so reduced motion has nothing to switch off.",
      },
    ],
  },
  "/components/button-group": {
    when: [
      "Use ButtonGroup for a Day, Week, Month switch above a chart, a split action with a dropdown caret, or the Cut, Copy and Paste buttons of an editor toolbar.",
      'Use orientation="vertical" for a stacked group, for example next to a sidebar; the arrow keys follow the direction.',
      'Give the group an aria-label so the role="group" has a name, and give toggle buttons aria-pressed so their state is announced.',
      "Skip it when the choice is exclusive and belongs to a form. Use SegmentedControl for one of a few values and Toggle or ToggleGroup for pressed states.",
      "Pair it with Tooltip on icon-only buttons and DropdownMenu for a split button's menu.",
    ],
    faq: [
      {
        q: "How do I group buttons in React with SheenUI?",
        a: "Wrap Button elements in ButtonGroup. It adds no surface of its own: the buttons keep their variant, hover and press motion, and the group only joins their edges and handles the keys.",
      },
      {
        q: "How does keyboard navigation work?",
        a: "Tab focuses the group once. The arrow keys move between the buttons, Home and End jump to the ends, and Enter or Space presses the focused one. Disabled buttons are skipped.",
      },
      {
        q: "Can I mix links and buttons?",
        a: "Yes. Any Button, including one rendered as a link through the render prop, can sit in the group.",
      },
      {
        q: "Is ButtonGroup the same as SegmentedControl?",
        a: "No. ButtonGroup arranges independent actions. SegmentedControl is a form control that holds one selected value.",
      },
      {
        q: "Why does the group have one tab stop?",
        a: "The group uses roving focus: Tab lands on one button and the arrow keys move between the rest. A toolbar of ten buttons then costs a keyboard user one Tab press instead of ten, and focus returns to the button that was last used.",
      },
      {
        q: "What do I pass for a vertical group, and does it work right to left?",
        a: 'Pass orientation="vertical". The arrow keys then move with up and down. On a right-to-left page the left and right arrows follow the reading direction.',
      },
    ],
    compare: {
      title: "Button group, toggle group or segmented control?",
      text: "The three look alike and answer different questions. ButtonGroup joins buttons that each run their own action (Copy, Paste, Cut). ToggleGroup keeps a pressed state for each button, for formatting such as bold and italic. SegmentedControl holds exactly one selected value and belongs in a form. Pick by what the control remembers: nothing, a set of pressed buttons, or one value.",
    },
  },
  "/navigation/sidebar": {
    when: [
      "Use Sidebar for the left navigation of an admin or dashboard app, where groups of links collapse, badges show unread counts and the whole column folds down to an icon rail.",
      "Use collapsed to turn it into an icon rail on a narrow layout. Labels stay available as accessible names and title tooltips.",
      'Give the nav an aria-label such as Workspace and mark the current page with the active prop, which sets aria-current="page".',
      "Skip it for a short flat list of sections. VerticalNav is shorter, and Navbar suits a top bar on a marketing site.",
      "Pair it with Drawer for a phone menu, Badge in SidebarItem for counts, and Breadcrumb inside the page header.",
    ],
    faq: [
      {
        q: "How do I build a collapsible sidebar in React?",
        a: "Compose SidebarHeader, SidebarGroup (a section with a label and defaultOpen), SidebarItem and SidebarFooter inside Sidebar. Groups fold open and shut with the shared height animation.",
      },
      {
        q: "How does the keyboard work?",
        a: "Tab moves through group headings and items in order. Enter or Space opens or closes a group and activates an item. Group headings are real buttons with aria-expanded.",
      },
      {
        q: "What does collapsed do?",
        a: "It turns the sidebar into an icon rail: labels become accessible names, groups lose their headings, and the width shrinks. Control it from your own button.",
      },
      {
        q: "Sidebar or VerticalNav?",
        a: "Use VerticalNav for a flat list with one selected value. Use Sidebar when you need collapsible groups or your own header and footer content.",
      },
      {
        q: "Do toggle buttons inside a group keep their pressed state?",
        a: "Yes. The group adds no state of its own: each button keeps its own name and state, so a toggle keeps aria-pressed, and disabled buttons are skipped by the arrow keys. Name the group with aria-label when the buttons share one meaning.",
      },
      {
        q: "Which variant and size should the buttons use?",
        a: "Any variant, but the same size, so the joined edges line up. The group squares the corners where buttons touch, overlaps their edges by a pixel and lifts the focused button above its neighbours; the buttons keep their own hover and press motion.",
      },
    ],
  },
  "/layout/aspect-ratio": {
    when: [
      "Use AspectRatio for a 16:9 video poster, a square product photo or a map tile in a card grid, so every cell keeps its shape and nothing moves while the images load.",
      "Pass ratio as width divided by height: 16 / 9 for video, 4 / 3 for photos, 1 for avatars and product tiles. The box keeps that ratio at any width.",
      "Fill the box with size-full object-cover on the image, and give the box rounded corners: it clips its children.",
      "Skip it for content whose height should follow its text. A card with copy should size itself, not hold a ratio.",
      "Pair it with Skeleton as the loading state, with Carousel slides that must share one height, and with figure and figcaption through the render prop.",
    ],
    faq: [
      {
        q: "How do I keep an image from shifting the layout while it loads?",
        a: "Wrap it in AspectRatio with the image's width-to-height ratio. The box takes its height from the ratio right away, so nothing below it moves when the image arrives.",
      },
      {
        q: "How do I use another element, such as a figure?",
        a: "Pass render with the element you want, for example render={<figure />}. The ratio, className and ref still go on that element.",
      },
      {
        q: "Does AspectRatio add any accessibility semantics?",
        a: "No. It is a plain container with no role. Give the media inside it text: alt on an image, a title on a video or map.",
      },
      { q: "What is the default ratio?", a: "1, a square. Pass 16 / 9, 4 / 3 or any number you need." },
    ],
  },
  "/forms/input-group": {
    when: [
      "Use InputGroup for a URL field with an https:// prefix, a price with a currency symbol and a unit, or a search box with an Apply button on its right edge, all sharing one focus ring.",
      "Compose InputGroupAddon and InputGroupInput in reading order. Use align end on an addon that follows the input, and put it after the input in the markup.",
      "Wrap the input in Field with FieldControl when it needs a label, a description or an error message, and set invalid on the Field and the group together.",
      "Skip it for a single icon inside a plain field. Input has leading and trailing slots for that.",
      "Pair it with Button for an inline action, Tooltip on an icon-only addon, and Select when the addon is a currency or unit picker.",
    ],
    faq: [
      {
        q: "How do I put a prefix or a suffix on a React input?",
        a: "Wrap InputGroupAddon with InputGroupText around the prefix, put InputGroupInput next, and add a second InputGroupAddon with align end for the suffix. All of it shares one glass edge and one focus ring.",
      },
      {
        q: "How does the invalid state work?",
        a: "invalid on the group draws the danger edge. Also set aria-invalid on the input, or put the group inside a Field with invalid, so the state is not carried by color alone.",
      },
      {
        q: "How tall is the group?",
        a: "It follows the shared control scale: sm 32px, md 40px, lg 48px, and 44px for sm and md on touch screens.",
      },
      {
        q: "Is the addon text part of the input's name?",
        a: "No. Name the input with aria-label or a Field label. Addon text such as https:// is read in page order but is not the input's accessible name.",
      },
    ],
  },
  "/layout/resizable": {
    when: [
      "Use Resizable for an IDE-style workspace, an email client or a log viewer, where people drag a handle (or press the arrow keys) to choose how much room each area gets.",
      "Put ResizablePanel children in a ResizablePanelGroup with a ResizableHandle between each pair. Set minSize and maxSize so a panel never collapses past usefulness.",
      "Own the sizes with layout and onLayoutChange when you want to save them in localStorage or a user setting and restore them later.",
      "Skip it for a fixed two-column layout. CSS grid is lighter when nobody needs to resize.",
      "Pair it with ScrollArea inside each panel, with a vertical group nested in a horizontal one for editor layouts, and with Drawer for the phone version.",
    ],
    faq: [
      {
        q: "How do I build a resizable split pane in React?",
        a: "Render ResizablePanelGroup with a ResizableHandle between each pair of ResizablePanels. Panels register themselves, so they may sit inside your own components. Sizes are percentages that add up to 100; defaultLayout sets the start and onLayoutChange reports every move.",
      },
      {
        q: "Can the handles be moved with the keyboard or without dragging?",
        a: "Yes. Each handle is a role=separator: focus it and use the arrow keys (Shift for bigger steps) and Home or End to jump to the limit of its range. Two step buttons on the handle make the panel before it larger or smaller with a single pointer press (the non-drag alternative), and a double click or double tap puts the divider back where it started.",
      },
      {
        q: "How do I save the layout?",
        a: "Pass layout and onLayoutChange, store the array in localStorage in the handler, and read it back as the initial state. The page's second example shows it.",
      },
      {
        q: "Does it work in right-to-left pages?",
        a: "Yes. The arrow keys and the drag follow the reading direction.",
      },
    ],
  },
};
