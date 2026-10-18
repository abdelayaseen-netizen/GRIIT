// Native iOS 26 tab bar (Liquid Glass). Default path is the solid fallback bar; native tabs only after the SDK 54 + iOS 26 device check passes.
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs'; // verify on Expo SDK 54
import { useReducedMotion } from 'react-native-reanimated';
import { DS_COLORS_V2 } from '@/ds/colors';

// Lucide icons the app already ships, exported as template PNGs (@2x/@3x) from lucide-static.
// If NativeTabs.Icon can't take an image source on iOS, use the SF Symbol on the tab bar only:
//   house (lucide)        -> house
//   compass (lucide)      -> safari
//   circle-plus (lucide)  -> plus.circle
//   flame (GRIIT flame)   -> flame
//   user (lucide)         -> person
const ICON = {
  home:     { src: require('@/assets/tabs/house.png'),       sf: 'house' },
  discover: { src: require('@/assets/tabs/compass.png'),     sf: 'safari' },
  create:   { src: require('@/assets/tabs/circle-plus.png'), sf: 'plus.circle' },
  activity: { src: require('@/assets/tabs/flame.png'),       sf: 'flame' },  // the app's custom flame SVG, exported as a template PNG
  profile:  { src: require('@/assets/tabs/user.png'),        sf: 'person' },
} as const;
const USE_IMAGE_ICONS = true; // set false if image sources don't render in native tabs

const TabIcon = ({ k }: { k: keyof typeof ICON }) => (USE_IMAGE_ICONS ? <Icon src={ICON[k].src} /> : <Icon sf={ICON[k].sf} />);

export default function TabsLayout() {
  const reduceMotion = useReducedMotion();
  return (
    <NativeTabs minimizeBehavior={reduceMotion ? 'never' : 'onScrollDown'} tintColor={DS_COLORS_V2.brand} labelStyle={{ color: DS_COLORS_V2.textPrimary, fontWeight: '500' }}>
      <NativeTabs.Trigger name="index"><TabIcon k="home" /><Label>Home</Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="discover"><TabIcon k="discover" /><Label>Discover</Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="create"><TabIcon k="create" /><Label>Create</Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="activity"><TabIcon k="activity" /><Label>Activity</Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile"><TabIcon k="profile" /><Label>Profile</Label></NativeTabs.Trigger>
    </NativeTabs>
  );
}
// create.tsx: on focus, open the Create chooser sheet (router.push('/create-chooser')) and return to the previous tab.
//   "Log today's task" -> the next open task; "Create a challenge" -> /create. Never the post sheet.
// Shrunk bar: "+ Create" is the bottom accessory, inline only (P0-02), and opens the same chooser.
// Reduce Motion: minimizeBehavior 'never'; the bar stays at full size.
