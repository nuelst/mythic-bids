import type { Wallet } from './wallet-api'

export function applyOptimisticDeposit(
  wallet: Wallet,
  amountCents: number,
): Wallet {
  return {
    balanceCents: wallet.balanceCents + amountCents,
    committedCents: wallet.committedCents,
    availableCents: wallet.availableCents + amountCents,
  }
}
