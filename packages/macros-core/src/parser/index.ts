import { DEFAULT_MACRO_PREFIX } from "../constants"

import {
  Macro,
  MacroResultValue,
  MacroStatus,
  MacroToValueMap,
  MacroValue,
} from "@macros/types"

/**
 * Evaluates a single offer caption by replacing macros with actual values
 * Mainly used for settings preview
 */

type ParserMap = Record<string, any>

type EvaluateOfferCaptionProps = {
  raw: string
  parserMap: ParserMap
  isExample?: boolean
}

/*
 * @param raw: String with macros (PREFIX + variable) which needs to be resolved
 * @param isExample: To show a preview with example values which gets replaced
 * @param parserMap: An object which has resolved values for the macro variable
 */
export const parseMacros = ({
  raw,
  parserMap,
  isExample = true,
}: EvaluateOfferCaptionProps): MacroResultValue => {
  const macroKeyToValueMap = createMacroToValueMap(parserMap, isExample)

  return evaluateMacro(raw, macroKeyToValueMap)
}

/**
 * Evaluates offer captions by replacing macros with actual values
 */
// export const evaluateOfferCaptions = (
//   offer: FinalInteractiveOffer
// ): EvaluatedCaptions | null => {
//   const { offerCaptions } = offer || {}
//   if (!offerCaptions) return null

//   const macroKeyToValueMap = createMacroToValueMap(offer)
//   const evaluatedCaptions: EvaluatedCaptions = {}

//   Object.keys(offerCaptions).forEach((key) => {
//     evaluatedCaptions[key] = evaluateMacro(
//       offerCaptions[key],
//       macroKeyToValueMap
//     )
//   })

//   return evaluatedCaptions
// }

/**
 * Evaluates a single macro string by replacing macro placeholders with values
 */
const evaluateMacro = (
  rawString: string | undefined,
  macroKeyValueMap: MacroToValueMap,
  macroPrefix: string = DEFAULT_MACRO_PREFIX
): MacroResultValue => {
  if (!rawString) {
    return {
      isMacroMissing: false,
      value: "",
    }
  }

  // Regex to match macros like @macroKey, possibly followed by punctuation
  const macroRegex = new RegExp(`${macroPrefix}([a-zA-Z0-9_\\-]+)`, "g")
  const captionMacrosMap = new Map<string, MacroValue | undefined>()

  // Replace all macros in the caption with their corresponding values from the map
  const evaluatedCaption = rawString.replace(macroRegex, (match, macroKey) => {
    if (
      macroKeyValueMap.has(macroKey) &&
      macroKeyValueMap.get(macroKey) !== undefined
    ) {
      const macroValue = macroKeyValueMap.get(macroKey) as string
      captionMacrosMap.set(macroKey, macroValue)
      return macroValue
    }
    // If macroKey is not found, return the original match
    return match
  })

  const isMacroMissing = Array.from(captionMacrosMap.values()).some(
    (value) => value === MacroStatus.NOT_FOUND
  )

  const missingMacros = Array.from(captionMacrosMap.entries())
    .filter(([, value]) => value === MacroStatus.NOT_FOUND)
    .map(([key]) => `${macroPrefix}${key}`)

  // isMacroMissing flag is used to show the warning in the offer preview
  if (isMacroMissing) {
    return {
      isMacroMissing: true,
      missingMacros,
      value: "",
    }
  }

  return {
    isMacroMissing: false,
    value: evaluatedCaption,
  }
}

/**
 * Creates a mapping of macro keys to their corresponding values from the offer
 */
const createMacroToValueMap = (
  parserMap: ParserMap,
  isExample?: boolean
): MacroToValueMap => {
  const availableMacros = new Map<string, Macro>()
  parserMap.forEach((macro: Macro) => {
    availableMacros.set(macro.key, macro)
  })

  const macroToValueMap: MacroToValueMap = new Map()

  if (isExample) {
    availableMacros.forEach((macro, key) => {
      macroToValueMap.set(key, macro.example ?? "")
    })
    return macroToValueMap
  }

  if (!parserMap) return macroToValueMap

  availableMacros.forEach((macro) => {
    macroToValueMap.set(macro.key, getMacroValue(macro, parserMap).value)
  })

  return macroToValueMap
}

// const getOfferCurrency = (
//   offer: FinalInteractiveOffer,
//   macroCurrency: string | string[]
// ): SalaryCurrencyCode => {
//   if (!macroCurrency) return SalaryCurrencyCode.USD
//   if (typeof macroCurrency === "string") return offer[macroCurrency]

//   // Get the first non-undefined currency from the array
//   const currency = macroCurrency.find((currencyKey) => offer[currencyKey])
//   if (currency) return offer[currency]

//   return SalaryCurrencyCode.USD
// }

// const formatMacroValue = (
//   value: MacroValue,
//   macro: Macro,
//   parserMap: ParserMap,
//   currency?: CurrencyOption | SalaryCurrencyCode
// ): string => {
//   if (!value) return MacroStatus.NOT_FOUND

//   const formatter = new Intl.NumberFormat("en-US", {
//     style: "decimal",
//     maximumFractionDigits: 2,
//     minimumFractionDigits: 0,
//   })

//   switch (macro.data_type) {
//     case "string":
//     case "url":
//       return String(value)
//     case "currency": {
//       const offerCurrency =
//         currency ?? getOfferCurrency(parserMap, macro.currency!)
//       const exchangeRate = offer.exchangeRates?.rates[offerCurrency]
//       const exchangeValue = Number(value) * (exchangeRate ?? 1)
//       return formatCash(exchangeValue, offerCurrency)
//     }
//     case "number":
//       return formatter.format(Number(value))
//     case "percentage":
//       return `${formatter.format(Number(value))}%`
//     default:
//       return String(value)
//   }
// }

/**
 * Gets the value for a specific macro key from the offer data
 */
type GetMacroValueReturnType = {
  value: MacroValue
  macro?: Macro
}

const getMacroValue = (
  macro: Macro,
  parserMap: ParserMap
): GetMacroValueReturnType => {
  // Find value in system fields
  if (macro.key in parserMap) {
    return {
      value: parserMap[macro.key],
      macro: macro,
    }
  }

  return {
    value: MacroStatus.NOT_FOUND,
  }
}

// type CustomOfferFieldValue = {
//   value: string | number
//   currency: SalaryCurrencyCode
//   interval: string
// }

// const getMacroValueFromCustomOfferFields = (
//   macroKey: string,
//   customFieldValues?: CustomFieldValueInterface[]
// ): CustomOfferFieldValue | undefined => {
//   if (customFieldValues) {
//     const customOfferFieldValue = customFieldValues.find(
//       (field) => field.customFieldTemplateId === macroKey
//     )

//     if (customOfferFieldValue?.value)
//       return {
//         value: customOfferFieldValue.value,
//         currency: customOfferFieldValue.currency,
//         interval: customOfferFieldValue.frequency, // Might be used in the future
//       }
//   }

//   return undefined
// }

// const getMacroValueFromCustomInfoFields = (
//   macroKey: string,
//   customInfoFieldValues?: CustomInfoFieldValueInterface[]
// ): string | undefined => {
//   if (customInfoFieldValues) {
//     const customInfoFieldValue = customInfoFieldValues.find(
//       (field) => field.customInfoFieldTemplateId === macroKey
//     )
//     if (customInfoFieldValue?.value) return customInfoFieldValue.value
//   }

//   return undefined
// }

// export const getFieldNameFromId = (
//   key: string,
//   companySettings: Partial<CompanyInfo>
// ): string => {
//   const systemMacro = SYSTEM_MACROS.find((macro) => macro.key === key)
//   if (systemMacro) return systemMacro.display_name

//   const customFieldTemplate = companySettings.customFieldTemplates?.find(
//     (field) => field.id === key
//   )
//   if (customFieldTemplate) return customFieldTemplate.fieldName

//   const customInfoFieldTemplate =
//     companySettings.customInfoFieldTemplates?.find((field) => field.id === key)
//   if (customInfoFieldTemplate)
//     return `${customInfoFieldTemplate.name} ${getCustomInfoSubText(
//       customInfoFieldTemplate.infoFieldType
//     )}`

//   return key
// }
