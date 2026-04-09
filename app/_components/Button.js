function Button({ children, type = "button", onClick = null }) {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`${
        type === "submit" ? "w-full " : " "
      } inline-block text-lg bg-secondary rounded-full p-2 px-4 font-extrabold hover:bg-secondary/80 tracking-wide transition-colors duration-300 focus:bg-secondary focus:outline-none focus:ring focus:ring-secondary focus:ring-offset-2 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export default Button;
