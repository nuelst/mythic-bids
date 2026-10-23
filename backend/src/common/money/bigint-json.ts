// Money is stored as BIGINT cents; values stay far below 2^53, so JSON numbers are exact.
declare global {
  interface BigInt {
    toJSON(): number;
  }
}

BigInt.prototype.toJSON = function (this: bigint) {
  return Number(this);
};

export {};
