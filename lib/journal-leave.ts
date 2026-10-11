/**
 * A long journal dies in the TextInput destructor if the field unmounts while
 * it still holds the entry. Clear, let that empty value paint, then remove the
 * field, and only then leave the screen.
 */

export function waitForNativeTextClear(): Promise<void> {
  return new Promise((resolve) => {
    const raf = globalThis.requestAnimationFrame;
    if (typeof raf !== "function") {
      setTimeout(resolve, 0);
      return;
    }
    raf(() => {
      raf(() => resolve());
    });
  });
}

export async function prepareJournalUnmount(actions: {
  clear: () => void;
  unmountField: () => void;
  wait?: () => Promise<void>;
}): Promise<void> {
  const wait = actions.wait ?? waitForNativeTextClear;
  actions.clear();
  await wait();
  actions.unmountField();
  await wait();
}
