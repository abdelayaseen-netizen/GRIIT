/** Settings → About. The build and commit are whatever the binary was cut from. */
export function aboutVersionLine(args: {
  version: string | null | undefined;
  build: string | null | undefined;
  commit: string | null | undefined;
}): string {
  const version = args.version?.trim() || "1.0.0";
  const build = args.build?.trim() ?? "";
  const commit = (args.commit?.trim() ?? "").slice(0, 7);
  const buildPart = build ? ` (build ${build})` : "";
  const commitPart = commit ? ` · commit ${commit}` : "";
  return `Version ${version}${buildPart}${commitPart}`;
}
