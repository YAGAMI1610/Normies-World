// packages/contracts/src/abis.ts
// Minimal ABIs needed for the indexer. We only need the standard ERC-721
// Transfer event for ownership/holder tracking, plus the Canvas events
// for level/customization tracking (NormiesCanvas).

export const erc721TransferAbi = [
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
    ],
  },
] as const;

// NormiesCanvas — events relevant to the burn-to-edit / transform system.
// Names/signatures are best-effort based on the documented behavior
// (commit-reveal burns, setTransformBitmap, action points). If the live
// contract's actual event signatures differ, adjust here — the indexer
// isolates all chain reads behind this ABI so it's a single-file change.
export const normiesCanvasAbi = [
  {
    type: "event",
    name: "TransformApplied",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "transformer", type: "address", indexed: true },
      { name: "version", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "BurnCommitted",
    inputs: [
      { name: "commitId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "receiverTokenId", type: "uint256", indexed: true },
      { name: "tokenCount", type: "uint256", indexed: false },
    ],
  },
] as const;

export const NORMIES_CONTRACT_ADDRESS =
  "0x9Eb6E2025B64f340691e424b7fe7022fFDE12438" as const;

export const NORMIES_CANVAS_ADDRESS =
  "0x64951d92e345C50381267380e2975f66810E869c" as const;