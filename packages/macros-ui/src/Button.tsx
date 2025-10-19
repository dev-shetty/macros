import React from "react"

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      style={{
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        padding: "8px 16px",
        borderRadius: "4px",
      }}
    >
      {children}
    </button>
  )
}
