import { type Component } from "solid-js";

export interface FormatBalanceProps {
  balance: bigint;
}

const ASSET_DECIMALS = 1_000_000_000_000n;
const precision = 100;

export const formatBalance = (balance: bigint): number => {
  return Number(balance * BigInt(precision) / ASSET_DECIMALS) / precision
}

export const FormatBalance: Component<FormatBalanceProps> = (props) => {
  return <p>Balance: {formatBalance(props.balance)}</p>;
}
