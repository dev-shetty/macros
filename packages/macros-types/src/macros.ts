export type MacroDataType =
  | "currency"
  | "percentage"
  | "number"
  | "string"
  | "url"

export interface Macro {
  key: string
  display_name: string
  description: string
  data_type: MacroDataType
  example: string
  currency?: string | string[]
}
export type MacroValue = string | number
export type MacroToValueMap = Map<string, MacroValue>

export type MacroResultValue =
  | {
      value: string
      isMacroMissing: true
      missingMacros: string[]
    }
  | {
      value: string
      isMacroMissing: false
    }
export type EvaluatedCaptions<T> = {
  [K in keyof T]?: MacroResultValue
}

export const MacroStatus = {
  NOT_FOUND: "N/A",
} as const
