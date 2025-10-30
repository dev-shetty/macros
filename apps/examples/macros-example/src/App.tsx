import { useState } from "react"

import { MacroInput, parseMacros, type MacroSubstitutionMap } from "macros"
import { MACROS } from "./constants"

import "./App.css"

function numberFormatter(value: number, locale = "en-US"): string {
  const formatter = Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  return formatter.format(value)
}

const macroSub: MacroSubstitutionMap = [
  {
    key: "baseSalary",
    value: 199999,
    formatter: (v) => numberFormatter(Number(v)),
  },
  {
    key: "annualTargetBonusValue",
    value: 2568,
    formatter: (v) => numberFormatter(Number(v)),
  },
]

function App() {
  const [caption, setCaption] = useState("")

  const parsedMacro = parseMacros({
    raw: caption,
    macroSubstituionMap: macroSub,
  })

  return (
    <div>
      <h1>Macros Example</h1>
      <MacroInput
        value={caption}
        onChange={setCaption}
        availableMacros={MACROS}
      />
      <h2>Evaluated Macro</h2>
      <p>{parsedMacro.value}</p>
    </div>
  )
}

export default App
