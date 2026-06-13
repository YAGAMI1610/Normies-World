export declare const erc721TransferAbi: readonly [{
    readonly type: "event";
    readonly name: "Transfer";
    readonly inputs: readonly [{
        readonly name: "from";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "to";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "tokenId";
        readonly type: "uint256";
        readonly indexed: true;
    }];
}];
export declare const normiesCanvasAbi: readonly [{
    readonly type: "event";
    readonly name: "TransformApplied";
    readonly inputs: readonly [{
        readonly name: "tokenId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "transformer";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "version";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}, {
    readonly type: "event";
    readonly name: "BurnCommitted";
    readonly inputs: readonly [{
        readonly name: "commitId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "receiverTokenId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "tokenCount";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}];
export declare const NORMIES_CONTRACT_ADDRESS: "0x9Eb6E2025B64f340691e424b7fe7022fFDE12438";
export declare const NORMIES_CANVAS_ADDRESS: "0x64951d92e345C50381267380e2975f66810E869c";
