import type { HeadingLevelOption } from "../../lib/heading";
import { type ReactNode } from "react";

import { type ConfirmDialogLabels } from "../../components/alert-dialog/alert-dialog";

/** A section of the settings page: profile, notifications, appearance or the danger zone. */
export type SettingsSection = "profile" | "notifications" | "appearance" | "danger";

/** The editable settings: name, username, email, bio, avatar URL (`null` = initials) and the on/off state of each notification switch by id. */
export type SettingsValues = {
  name: string;
  username: string;
  email: string;
  bio: string;
  /** URL of the profile photo (an object URL right after picking a file); null = initials. */
  avatar: string | null;
  /** Switch id → on/off. */
  notifications: Record<string, boolean>;
};

/** A notification switch: id, label, optional description, the group heading it sits under, and whether it is `locked` on. */
export type SettingsNotificationOption = {
  id: string;
  label: string;
  description?: string;
  /** Heading the switch is listed under, e.g. "Email" or "Push". */
  group?: string;
  /** Always on and can't be turned off (e.g. security alerts). */
  locked?: boolean;
};

/** Every user-facing string (i18n). */
export type SettingsPageLabels = {
  title: string;
  description: string;
  /** Name of the section navigation landmark. */
  nav: string;
  profile: string;
  profileDescription: string;
  notifications: string;
  notificationsDescription: string;
  appearance: string;
  appearanceDescription: string;
  danger: string;
  dangerDescription: string;
  photo: string;
  changePhoto: string;
  uploadPhoto: string;
  removePhoto: string;
  photoHint: string;
  photoNotImage: string;
  photoTooBig: (maxMb: number) => string;
  name: string;
  namePlaceholder: string;
  nameRequired: string;
  username: string;
  usernameHint: string;
  usernameInvalid: string;
  email: string;
  emailHint: string;
  emailInvalid: string;
  bio: string;
  bioPlaceholder: string;
  bioHint: string;
  alwaysOn: string;
  theme: string;
  themeHint: string;
  light: string;
  dark: string;
  system: string;
  reduceMotion: string;
  reduceMotionHint: string;
  reduceTransparency: string;
  reduceTransparencyHint: string;
  appliesInstantly: string;
  exportTitle: string;
  exportDescription: string;
  exportAction: string;
  /** Announced when `onExportData` rejects. */
  exportError: string;
  deleteTitle: string;
  deleteDescription: string;
  deleteAction: string;
  deleteConfirmTitle: string;
  deleteConfirmDescription: string;
  deleteConfirm: string;
  /** The delete dialog's own strings: cancel, pending, error, "Type … to confirm". */
  deleteDialog: Partial<ConfirmDialogLabels>;
  /** Save bar, wide: "3 unsaved changes". */
  unsaved: (count: number) => string;
  /** Save bar, narrow: "3 unsaved". */
  unsavedShort: (count: number) => string;
  discard: string;
  save: string;
  /** Save button when the block is narrow. */
  saveShort: string;
  saving: string;
  saved: string;
  saveError: string;
  /** Shown when Save is pressed while fields are invalid. */
  fixErrors: (count: number) => string;
  announceDirty: string;
  announceSaved: string;
  announceDiscarded: string;
};

/** The English `SettingsPageLabels` used when `labels` is omitted; a partial `labels` prop is merged over them. */
export const defaultSettingsPageLabels: SettingsPageLabels = {
  title: "Settings",
  description: "Manage your profile, notifications and how SheenUI looks for you.",
  nav: "Settings sections",
  profile: "Profile",
  profileDescription: "This is how others see you across the workspace.",
  notifications: "Notifications",
  notificationsDescription: "Choose what reaches you, and where.",
  appearance: "Appearance",
  appearanceDescription: "Saved on this device and applied right away.",
  danger: "Danger zone",
  dangerDescription: "Irreversible actions. Take a breath first.",
  photo: "Profile photo",
  changePhoto: "Change profile photo",
  uploadPhoto: "Upload photo",
  removePhoto: "Remove",
  photoHint: "PNG, JPG or WebP, square works best. Or drop an image on the circle.",
  photoNotImage: "That file isn't an image. Pick a PNG, JPG or WebP.",
  photoTooBig: (mb) => `Images up to ${mb} MB, please.`,
  name: "Display name",
  namePlaceholder: "Ada Lovelace",
  nameRequired: "Enter the name people should see.",
  username: "Username",
  usernameHint: "Your profile link. Lowercase letters, numbers and dashes.",
  usernameInvalid: "Use 3–30 lowercase letters, numbers or dashes.",
  email: "Email",
  emailHint: "Used for sign-in and notifications. Never shown publicly.",
  emailInvalid: "Enter a valid email address.",
  bio: "Bio",
  bioPlaceholder: "A sentence or two about you",
  bioHint: "Shown on your public profile.",
  alwaysOn: "Always on",
  theme: "Theme",
  themeHint: "System follows your device's light or dark setting.",
  light: "Light",
  dark: "Dark",
  system: "System",
  reduceMotion: "Reduce motion",
  reduceMotionHint: "Swap slides, springs and parallax for simple fades.",
  reduceTransparency: "Reduce transparency",
  reduceTransparencyHint: "Solid surfaces instead of frosted glass.",
  appliesInstantly: "Applies instantly",
  exportTitle: "Export your data",
  exportDescription: "Download everything you've created as a ZIP of JSON and CSV files.",
  exportAction: "Export data",
  exportError: "Couldn't export your data. Try again.",
  deleteTitle: "Delete account",
  deleteDescription: "Permanently remove your account, workspaces and files. This can't be undone.",
  deleteAction: "Delete account",
  deleteConfirmTitle: "Delete your account?",
  deleteConfirmDescription:
    "Your profile, workspaces and every file in them will be erased for good. Members of shared workspaces lose access too.",
  deleteConfirm: "Delete forever",
  deleteDialog: {},
  unsaved: (n) => (n === 1 ? "1 unsaved change" : `${n} unsaved changes`),
  unsavedShort: (n) => `${n} unsaved`,
  discard: "Discard",
  save: "Save changes",
  saveShort: "Save",
  saving: "Saving…",
  saved: "Changes saved",
  saveError: "Couldn't save. Check your connection and try again.",
  fixErrors: (n) => (n === 1 ? "Fix 1 field to save" : `Fix ${n} fields to save`),
  announceDirty: "You have unsaved changes",
  announceSaved: "Changes saved",
  announceDiscarded: "Changes discarded",
};

/**
 * The former name of `defaultSettingsPageLabels`, kept as an alias for one release.
 *
 * @deprecated Renamed `defaultSettingsPageLabels`; this alias is removed after one release.
 */
export const defaultSettingsLabels = defaultSettingsPageLabels;

/** The sample Push and Email notification switches shown when `notificationOptions` is omitted; replace them with your own.
 *
 * @see /blocks/settings-page
 */
export const defaultSettingsNotificationOptions: SettingsNotificationOption[] = [
  {
    id: "mentions",
    group: "Push",
    label: "Mentions",
    description: "When someone @mentions you in a comment or a doc.",
  },
  {
    id: "comments",
    group: "Push",
    label: "Comments on your work",
    description: "Replies and comments on things you created.",
  },
  {
    id: "reminders",
    group: "Push",
    label: "Reminders",
    description: "Due dates and anything you asked to be reminded about.",
  },
  {
    id: "digest",
    group: "Email",
    label: "Weekly digest",
    description: "A Monday summary of what happened in your workspaces.",
  },
  {
    id: "product",
    group: "Email",
    label: "Product updates",
    description: "New features and improvements, about once a month.",
  },
  {
    id: "security",
    group: "Email",
    label: "Security alerts",
    description: "New sign-ins and password changes.",
    locked: true,
  },
];

/** Props of `SettingsPage`. Everything is optional: with none it shows a sample account. */
export type SettingsPageProps = {
  /** Saved values to start from (and to compare against for the unsaved count). */
  defaultValues?: Partial<SettingsValues>;
  /** Rows of the notifications section (`SettingsNotificationOption[]`, default `defaultSettingsNotificationOptions`). */
  notificationOptions?: SettingsNotificationOption[];
  /** Called with all values and the keys that changed. Return a promise for the saving state; throw to show an error. */
  onSave?: (values: SettingsValues, changed: string[]) => void | Promise<void>;
  /** Called after the type-to-confirm dialog. Return a promise for its loading state; throw to show the error in the dialog. */
  onDeleteAccount?: () => void | Promise<void>;
  /** Shows the "Export data" row. Return a promise for a loading state. */
  onExportData?: () => void | Promise<void>;
  /** Called with the picked photo file (null when removed). Upload it and put the URL in `avatar` on save. */
  onAvatarChange?: (file: File | null) => void;
  /** Sets the largest photo accepted, in MB (`number`, default 5). */
  maxAvatarMb?: number;
  /** Which sections to show, in order (`SettingsSection[]`, default all four: profile, notifications, appearance, danger). */
  sections?: SettingsSection[];
  /** Text before the username field, e.g. your domain (`string`, default `"example.com/"`). */
  usernamePrefix?: string;
  /** Distance from the top of the scroller for the sticky navigation (any CSS length, default `"1rem"`), e.g. under your app bar. */
  stickyTop?: string;
  /** Ask before leaving the page with unsaved changes (`boolean`, default `true`). */
  warnOnLeave?: boolean;
  /** Level of the page title; sections are one level below (`1 | 2 | 3`, default 1). `"none"` renders every heading as a paragraph with no heading role, for a page shown as an example. */
  headingLevel?: HeadingLevelOption;
  /** Page title. Pass null to leave it out. */
  title?: ReactNode;
  /** Shows text under the page title (`ReactNode`). */
  description?: ReactNode;
  /** Overrides for the built-in English strings (`Partial<SettingsPageLabels>`). */
  labels?: Partial<SettingsPageLabels>;
  /** Adds extra classes to the outer element (`string`). */
  className?: string;
};
