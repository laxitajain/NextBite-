function Button({
  children,
  type = "button",
  onClick = null,
  className = "",
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`${
        type === "submit" ? "w-full " : ""
      }inline-flex items-center justify-center gap-1 text-lg bg-secondary text-primary rounded-full p-2 px-4 font-extrabold hover:bg-secondary/80 tracking-wide transition-colors duration-300 focus:bg-secondary focus:outline-none focus:ring focus:ring-secondary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
