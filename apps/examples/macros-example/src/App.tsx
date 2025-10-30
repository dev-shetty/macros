import { useState } from "react"

import { MacroInput, parseMacros } from "macros"
import { MACROS } from "./constants"

import "./App.css"

function App() {
  const [value, setValue] = useState("")

  const parsedMacro = parseMacros({
    raw: value,
    parserMap: MACROS,
  })

  return (
    <div>
      <h1>Macros Example</h1>
      <MacroInput value={value} onChange={setValue} availableMacros={MACROS} />
      <h2>Evaluated Macro</h2>
      <p>{parsedMacro.value}</p>
    </div>
  )
}

export default App
