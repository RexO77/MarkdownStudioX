/**
 * The chrome kit — the terminal half of the Bell Labs pipeline.
 *
 * Every bar, button, label and rule in the app's chrome comes from here, so
 * a spacing or ink decision is made once. DESIGN.md is the authority for
 * what these values mean; `tokens.ts` is that document in class form.
 *
 * The galley (STIX Two Text, the 24px ruling) is deliberately not part of
 * this kit — it is the other material.
 */

export { Bar, BarDivider } from './Bar';
export { Label } from './Label';
export { IconButton } from './IconButton';
export { LabelButton } from './LabelButton';
export { SectionRule } from './SectionRule';
export { Segmented, type SegmentedItem } from './Segmented';
export {
  BAR,
  GUTTER,
  ROW_GUTTER,
  ROW_ACTION_INSET,
  LABEL,
  LABEL_STRONG,
  BODY,
  INK,
  HOVER,
  PRESS,
  SELECTED,
  TOGGLED,
  STRIP,
  ICON,
  ICON_BUTTON_SIZE,
  ROW_BUTTON_SIZE,
  EASE,
  DURATION,
  type BarTrack,
} from './tokens';
