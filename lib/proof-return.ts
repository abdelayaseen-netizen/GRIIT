/** The proof tile to outline for one second after the scroll closes. */
let tileId: string | null = null;

export function rememberProofTile(id: string): void {
  tileId = id;
}

export function consumeProofTile(): string | null {
  const id = tileId;
  tileId = null;
  return id;
}
