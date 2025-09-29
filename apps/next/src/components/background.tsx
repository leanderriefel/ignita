export const Background = () => {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage: `
          linear-gradient(45deg, transparent 49%, #9090a066 49%, #9090a066 51%, transparent 51%),
          linear-gradient(-45deg, transparent 49%, #9090a066 49%, #9090a066 51%, transparent 51%)
        `,
        backgroundSize: "40px 40px",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 70%)",
        maskImage:
          "radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 70%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 40% at 25% 25%, var(--color-primary), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 50% 35% at 70% 70%, var(--color-primary), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-75 blur-2xl"
        style={{
          backgroundSize: "100px 100px",
          backgroundImage:
            "radial-gradient(circle at 50% 50%, var(--color-indigo-500), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
          mixBlendMode: "overlay",
          zIndex: 1,
        }}
      />
    </div>
  )
}
