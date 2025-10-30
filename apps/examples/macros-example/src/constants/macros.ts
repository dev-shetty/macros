import type { Macro } from "macros"

export const MACROS: Macro[] = [
  {
    key: "baseSalary",
    display_name: "Base Salary",
    description: "The base annual salary in the offer",
    data_type: "currency",
    example: "$100,000",
    currency: "baseSalaryCurrency",
  },
  {
    key: "annualTargetBonusPercentage",
    display_name: "Annual Bonus Percentage",
    description: "The annual bonus percentage in the offer",
    data_type: "percentage",
    example: "10%",
    currency: "bonusCurrency",
  },
  {
    key: "annualTargetBonusValue",
    display_name: "Annual Bonus Value",
    description: "The annual bonus value in the offer",
    data_type: "currency",
    example: "$10,000",
    currency: "bonusCurrency",
  },
  {
    key: "sign-on",
    display_name: "Sign-on Bonus",
    description: "The sign-on bonus in the offer",
    data_type: "currency",
    example: "$10,000",
  },
  {
    key: "relocation",
    display_name: "Relocation Bonus",
    description: "The relocation bonus in the offer",
    data_type: "currency",
    example: "$10,000",
  },
  {
    key: "totalStockGrantValue",
    display_name: "Total Stock Grant Value",
    description: "The total stock grant value in the offer",
    data_type: "currency",
    example: "$10,000",
    currency: ["stockGrantCurrency", "rsuSharePriceCurrency"],
  },
  {
    key: "rsuShares",
    display_name: "RSU Shares Count",
    description: "The RSU shares count for this offer",
    data_type: "number",
    example: "1000",
  },
  {
    key: "totalOptionsGranted",
    display_name: "Total Options Granted",
    description: "The total number of options granted for this offer",
    data_type: "number",
    example: "1000",
  },
]
