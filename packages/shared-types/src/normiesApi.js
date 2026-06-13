"use strict";
// packages/shared-types/src/normiesApi.ts
// Type definitions mirroring the live api.normies.art responses.
// Source: https://api.normies.art (inspected June 2026)
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOTAL_SUPPLY = exports.NORMIES_CONTRACTS = exports.TRAIT_CATEGORIES = void 0;
// Trait category map (byte index -> category name)
exports.TRAIT_CATEGORIES = [
    "Type",
    "Gender",
    "Age",
    "Hair Style",
    "Facial Feature",
    "Eyes",
    "Expression",
    "Accessory",
];
exports.NORMIES_CONTRACTS = {
    Normies: "0x9Eb6E2025B64f340691e424b7fe7022fFDE12438",
    NormiesStorage: "0x1B976bAf51cF51F0e369C070d47FBc47A706e602",
    NormiesRenderer: "0xBe57fC4D0c729b8e8d33b638Dd441F57365e4c25",
    NormiesRendererV2: "0x7818f24d3239c945510e0a1a523dd9971812c6c0",
    NormiesRendererV3: "0x1af01b902256d77cf9499a14ef4e494897380b05",
    NormiesMinter: "0xC74994dD70FFb621CC514cE18a4F6F52124e296d",
    NormiesMinterV2: "0xc513272597d3022D77b3d7EEBA92cea5D7fb2808",
    NormiesCanvas: "0x64951d92e345C50381267380e2975f66810E869c",
    NormiesCanvasStorage: "0xC255BE0983776BAB027a156681b6925cde47B2D1",
    NormiesRendererV4: "0x8eC46Cc1f306652868a4dfbAAae87CBa2715A0eB",
};
exports.TOTAL_SUPPLY = 10000;
