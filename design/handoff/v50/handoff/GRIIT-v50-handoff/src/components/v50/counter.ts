// v50 · CountStep
export const completeLabel = (target: number, unit: string, camera: boolean) => camera ? 'Complete · take photo' : `Complete · ${target} ${unit}`;
export const showLogPartial = (n: number, target: number) => n > 0 && n < target;
export const step = (n: number, by: number, target: number) => Math.min(n + by, target);
