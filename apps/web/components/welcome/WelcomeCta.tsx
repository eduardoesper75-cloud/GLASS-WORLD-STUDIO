'use client';

interface Props {
  visible: boolean;
  label: string;
  onClick: () => void;
}

export function WelcomeCta({ visible, label, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label="Ingresar al Umbral"
      className="rounded-xl px-10 py-4 text-[#FFD700] transition-all duration-150 ease-out hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFD700]"
      style={{
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,215,0,0.30)',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '1rem',
        fontWeight: 500,
        letterSpacing: '0.15em',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {label}
    </button>
  );
}