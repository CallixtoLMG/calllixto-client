export function getBillsTotal(bills) {
  return bills.reduce(
    (sum, b) => sum + (Number(b.denomination) * Number(b.quantity)),
    0
  )
}