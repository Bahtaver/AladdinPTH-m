/** Alt menüdeki sepet ile aynı silüet; “Sepete ekle” gibi düğmelerde kullanım. */
export function CartBag24({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        className="opacity-[0.14]"
        d="M5.4 8.8h13.2l-1.05 7.9a1.85 1.85 0 0 1-1.85 1.65H8.3a1.85 1.85 0 0 1-1.85-1.65l-1.05-7.9Z"
        fill="currentColor"
      />
      <path
        d="M9 8V6a3 3 0 0 1 6 0v2M5 8h14l-1.2 9.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Zm3 0V6a3 3 0 0 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
