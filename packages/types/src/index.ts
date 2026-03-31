export type BackpackDataType = {
  A: string;   // ask size
  B: string;   // bid size
  E: number;   // event time
  T: number;   // trade time
  a: string;   // ask price (string from exchange)
  b: string;   // bid price (string from exchange)
  e: string;   // event type
  s: string;   // symbol e.g. "BTC_USDC_PERP"
  u: number;   // update id
};

export type FilteredDataType = {
  ask_price: number;
  bid_price: number;
  decimal: number;
};

export type UserBalance = {
  balance: number;   // fixed-point e.g. 100000000 = $10,000.0000
  decimal: number;   // always 4
};

export enum OrderType {
  long = "long",
  short = "short",
}

export type OpenOrders = {
  id: string;
  openPrice: number;
  leverage: number;
  asset: string;
  margin: number;
  quantity: number;
  type: OrderType;
};

export type AssetBalance = Record<
  string,
  {
    balance: number;
    decimal: number;
  }
>;

export type EngineResponseType = {
  type: string;
  reqId: string;
  payload: unknown;
};
export * from "./index.js";
export * from "./zodSchema.js";