import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

// Glass is on only on iOS 26+ with Reduce Transparency off.
export function useGlassEnabled() {
  const ios26 = Platform.OS === 'ios' && parseInt(String(Platform.Version), 10) >= 26;
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceTransparencyEnabled().then(setReduce);
    const sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduce);
    return () => sub.remove();
  }, []);
  return ios26 && !reduce;
}
