import { useRef, useState, useEffect, useCallback } from "react"
import { DEFAULT_MACRO_PREFIX } from "@macros/core"
import { Macro } from "@macros/types"
import "../index.css"

interface MacroInputProps {
  value: string
  onChange: (value: string) => void
  availableMacros: Macro[]
  placeholder?: string
  disabled?: boolean
  macroPrefix?: string
}

const BADGE_CLASS = "macro-badge"
const BADGE_DATA_ATTR = "data-macro-key"

export function MacroInput({
  value,
  onChange,
  macroPrefix = DEFAULT_MACRO_PREFIX,
  placeholder,
  disabled = false,
  availableMacros,
}: MacroInputProps) {
  const textRef = useRef<HTMLDivElement>(null)
  const isInternalUpdate = useRef(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredMacros, setFilteredMacros] = useState<Macro[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  // Convert @ syntax to HTML badges
  const convertMacrosToBadges = useCallback(
    (text: string): string => {
      const macroRegex = new RegExp(`${macroPrefix}([a-zA-Z0-9_\\-]+)`, "g")
      return text.replace(macroRegex, (match, macroKey) => {
        const macro = availableMacros.find((m) => m.key === macroKey)
        if (macro) {
          const sanitizedDisplayName = macro.display_name
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
          return `<span class="${BADGE_CLASS}" ${BADGE_DATA_ATTR}="${macroKey}" contenteditable="false">${sanitizedDisplayName}</span>`
        }
        return match
      })
    },
    [availableMacros]
  )

  // Convert HTML badges back to @ syntax
  const convertBadgesToMacros = useCallback((element: HTMLElement): string => {
    // We clone the node to avoid mutating the original DOM element while converting badges to @ syntax.
    const clonedElement = element.cloneNode(true) as HTMLElement
    const badges = clonedElement.querySelectorAll(`.${BADGE_CLASS}`)
    badges.forEach((badge) => {
      const macroKey = badge.getAttribute(BADGE_DATA_ATTR)
      if (macroKey) {
        const textNode = document.createTextNode(`${macroPrefix}${macroKey}`)
        badge.parentNode?.replaceChild(textNode, badge)
      }
    })
    return clonedElement.textContent || ""
  }, [])

  // Update content when value prop changes
  useEffect(() => {
    if (textRef.current && !isInternalUpdate.current) {
      const currentText = convertBadgesToMacros(textRef.current)
      if (currentText !== value) {
        const html = convertMacrosToBadges(value)
        textRef.current.innerHTML = html
      }
    }
    isInternalUpdate.current = false
  }, [value, convertMacrosToBadges, convertBadgesToMacros])

  // Gets the position of the cursor in the text
  const getCaretPosition = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return 0

    const range = selection.getRangeAt(0)
    // Clone the range to avoid modifying the original range
    const preCaretRange = range.cloneRange()
    if (!textRef.current) return 0
    preCaretRange.selectNodeContents(textRef.current)
    preCaretRange.setEnd(range.endContainer, range.endOffset)
    return preCaretRange.toString().length
  }, [])

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement
      const text = target.textContent || ""

      // Convert badges back to @ syntax for onChange
      const macroText = convertBadgesToMacros(target)
      isInternalUpdate.current = true
      onChange(macroText)

      // Check for @ symbol and show dropdown

      // Get the current cursor position
      // eg. 'Hello @name', index is 10 ('e')
      const cursorPos = getCaretPosition()

      // Get all the text before the cursor
      // eg. 'Hello @name', textBeforeCursor is 'Hello @name'
      const textBeforeCursor = text.substring(0, cursorPos)

      // Get the index of the last @ symbol
      // eg. 'Hello @name', lastAtIndex is 6 ('@')
      const lastAtIndex = textBeforeCursor.lastIndexOf(macroPrefix)

      // If there is an @ symbol, show the dropdown
      if (lastAtIndex !== -1) {
        // Get the text after the @ symbol
        // eg. 'Hello @name', textAfterAt is 'name'
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)

        // If there is a space after the @ symbol, don't show the dropdown
        const hasSpaceAfterAt = textAfterAt.includes(" ")

        if (!hasSpaceAfterAt) {
          setSearchQuery(textAfterAt)
          setShowDropdown(true)

          // Filter macros based on search query, filter on basis of key and display name
          const filtered = availableMacros.filter((macro) =>
            macro.display_name
              .replace(/\s/g, "")
              .toLowerCase()
              .includes(textAfterAt.toLowerCase())
          )
          setFilteredMacros(filtered)
          setSelectedIndex(0)
        } else {
          setShowDropdown(false)
        }
      } else {
        setShowDropdown(false)
      }
    },
    [availableMacros, onChange, convertBadgesToMacros, getCaretPosition]
  )

  const insertMacro = useCallback(
    (macro: Macro) => {
      if (!textRef.current) return
      // Guard: Exit if contentEditable div doesn't exist

      const selection = window.getSelection()
      // Get the current text selection/cursor position in the document

      if (!selection || selection.rangeCount === 0) return
      // Guard: Exit if no selection exists or cursor isn't positioned anywhere

      // Find and delete the @query text
      const range = selection.getRangeAt(0)
      // Get the Range object representing cursor position (or selected text)
      // Range has startContainer (DOM node), startOffset (character position in that node)

      const offsetInNode = range.startOffset
      // Character position where cursor is in the current text node
      // e.g., if text node is "Hello @nam" and cursor after 'm', offset = 10

      // Find the @ symbol position in the current text node
      const textNode = range.startContainer
      // The actual DOM node where cursor is (usually a Text node)

      if (textNode.nodeType === Node.TEXT_NODE && textNode.textContent) {
        // Verify we're in a text node (not an element node like <span>)

        // Calculate where @ starts relative to cursor
        const queryLength = searchQuery.length
        // e.g., if user typed "@nam", queryLength = 3

        const atSymbolOffset = offsetInNode - queryLength
        // Calculate position of @ symbol
        // e.g., if cursor at position 10, query "nam" length 3, @ is at position 7

        // Delete @query
        const deleteRange = document.createRange()
        // Create a new Range to select the text we want to delete

        deleteRange.setStart(textNode, Math.max(0, atSymbolOffset - 1))
        // Start selection at @ symbol (atSymbolOffset - 1 includes the @)
        // Math.max prevents negative index

        deleteRange.setEnd(textNode, offsetInNode)
        // End selection at current cursor position
        // Now deleteRange selects "@nam"

        deleteRange.deleteContents()
        // Actually remove "@nam" from the DOM
        // Cursor is now at position where @ was

        // Create badge element
        const badgeElement = document.createElement("span")
        badgeElement.className = BADGE_CLASS
        badgeElement.setAttribute(BADGE_DATA_ATTR, macro.key)
        badgeElement.contentEditable = "false"
        badgeElement.textContent = macro.display_name

        // Insert badge and space
        const spaceNode = document.createTextNode("\u00A0")
        // Create a non-breaking space character in memory
        // \u00A0 is &nbsp; - prevents badge from sticking to next word

        deleteRange.insertNode(spaceNode)
        // Insert space at cursor position (where @ was)

        deleteRange.insertNode(badgeElement)
        // Insert badge BEFORE the space (insertNode adds before existing content)
        // DOM now has: ...text[BADGE][SPACE]...

        // Move cursor after the space
        const newRange = document.createRange()
        // Create new Range to position cursor

        newRange.setStartAfter(spaceNode)
        // Position cursor after the space node

        newRange.collapse(true)
        // Collapse range to a single point (cursor, not selection)
        // true = collapse to start of range

        selection.removeAllRanges()
        // Clear current selection/cursor

        selection.addRange(newRange)
        // Set cursor to new position (after space, so user can keep typing)
      }

      // Convert to @ syntax for onChange
      const macroText = convertBadgesToMacros(textRef.current)
      // Walk DOM, find all badges, replace with @macro_key syntax
      // Returns: "Hello @base_salary world"

      isInternalUpdate.current = true
      // Set flag so useEffect doesn't re-render when value prop changes

      onChange(macroText)
      // Call parent's onChange with @ syntax string (for DB storage)

      setShowDropdown(false)
      setSearchQuery("")
    },
    [searchQuery, onChange, convertBadgesToMacros]
  )

  const scrollToSelectedItem = useCallback((index: number) => {
    const dropdown = document.querySelector(".macro-dropdown")
    if (!dropdown || !(dropdown instanceof HTMLElement)) return

    const selectedItem = dropdown.querySelector(
      `.macro-dropdown:nth-child(${index + 1})`
    )
    if (!selectedItem || !(selectedItem instanceof HTMLElement)) return

    const dropdownRect = dropdown.getBoundingClientRect()
    const itemRect = selectedItem.getBoundingClientRect()

    // Calculate scroll position within the dropdown
    const itemOffsetTop = selectedItem.offsetTop
    const dropdownHeight = dropdown.clientHeight
    const itemHeight = selectedItem.offsetHeight

    // Check if item is above visible area
    if (itemRect.top < dropdownRect.top) {
      dropdown.scrollTo({
        top: itemOffsetTop,
        behavior: "smooth",
      })
    }
    // Check if item is below visible area
    else if (itemRect.bottom > dropdownRect.bottom) {
      dropdown.scrollTo({
        top: itemOffsetTop - dropdownHeight + itemHeight,
        behavior: "smooth",
      })
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => {
            const newIndex = prev < filteredMacros.length - 1 ? prev + 1 : 0
            // Scroll to the new selected item
            scrollToSelectedItem(newIndex)
            return newIndex
          })
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => {
            const newIndex = prev > 0 ? prev - 1 : filteredMacros.length - 1
            // Scroll to the new selected item
            scrollToSelectedItem(newIndex)
            return newIndex
          })
          break
        case "Enter":
          e.preventDefault()
          if (filteredMacros[selectedIndex]) {
            insertMacro(filteredMacros[selectedIndex])
          }
          break
        case "Escape":
          setShowDropdown(false)
          break
      }
    },
    [
      showDropdown,
      filteredMacros,
      selectedIndex,
      insertMacro,
      scrollToSelectedItem,
    ]
  )

  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as Node
    const dropdown = document.querySelector(".macro-dropdown")

    // Don't close if clicking inside the input or dropdown
    if (
      (textRef.current && textRef.current.contains(target)) ||
      (dropdown && dropdown.contains(target))
    ) {
      return
    }

    setShowDropdown(false)
  }, [])

  const handleCopy = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      if (!textRef.current) return
      const macroText = convertBadgesToMacros(textRef.current)
      e.clipboardData.setData("text/plain", macroText)
    },
    [convertBadgesToMacros]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      if (!textRef.current) return
      const macroText = convertMacrosToBadges(
        e.clipboardData.getData("text/plain")
      )
      textRef.current.innerHTML = macroText
    },
    [convertMacrosToBadges]
  )

  const handleCut = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      if (!textRef.current) return
      handleCopy(e)
      textRef.current.innerHTML = ""
    },
    [handleCopy]
  )

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [handleClickOutside])

  // if (areMacrosLoading) return <></>

  return (
    <div className="macro-input-container">
      <div
        ref={textRef}
        contentEditable={!disabled}
        className="macroInput"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={
          placeholder || `Type ${macroPrefix} to insert macros...`
        }
        suppressContentEditableWarning
        onCopy={handleCopy}
        onPaste={handlePaste}
        onCut={handleCut}
      />

      {showDropdown && filteredMacros.length > 0 && (
        <div className="macro-dropdown">
          {filteredMacros.map((macro, index) => (
            <div
              key={macro.key}
              data-selected={index === selectedIndex}
              className="macro-dropdown-item"
              onMouseDown={(e) => {
                e.preventDefault()
                insertMacro(macro)
              }}
            >
              <div className="macro-content">
                {macro.display_name}
                <span className="macro-display-name">
                  <span className="macro-example">{macro.example}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
