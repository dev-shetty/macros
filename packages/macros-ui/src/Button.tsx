import React from "react"

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <div>
      <button
        {...props}
        style={{
          backgroundColor: "red",
          color: "#fff",
          border: "none",
          padding: "8px 16px",
          borderRadius: "4px",
        }}
      >
        {children}
      </button>
    </div>
  )
}
