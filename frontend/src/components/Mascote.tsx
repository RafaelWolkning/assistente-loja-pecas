import type { ReactElement } from "react";

export type EstadoMascote = "ocioso" | "pensando" | "falando" | "erro";

const ROTULOS: Record<EstadoMascote, string> = {
  ocioso: "Byte, o computadorzinho atendente, está disponível",
  pensando: "Byte está pensando",
  falando: "Byte está falando",
  erro: "Byte não conseguiu responder",
};

interface Props {
  estado: EstadoMascote;
}

/**
 * Mascote da BytePeças: um monitorzinho com olhos que pisca, olha e "fala".
 * É um SVG puro animado por CSS; o estado controla as animações.
 */
export function Mascote({ estado }: Props): ReactElement {
  return (
    <svg
      className={`mascote mascote--${estado}`}
      viewBox="0 0 220 190"
      role="img"
      aria-label={ROTULOS[estado]}
    >
      <defs>
        <linearGradient id="corpo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#33406b" />
          <stop offset="1" stopColor="#1a2240" />
        </linearGradient>
        <linearGradient id="tela" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#12314f" />
          <stop offset="1" stopColor="#0a1830" />
        </linearGradient>
        <radialGradient id="brilho" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#23d5e0" stopOpacity="0.35" />
          <stop offset="1" stopColor="#23d5e0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* antena */}
      <line className="mascote__antena" x1="110" y1="16" x2="110" y2="36" />
      <circle className="mascote__antena-ponta" cx="110" cy="13" r="6" />

      {/* olhos pensativos */}
      <g className="mascote__pensando" aria-hidden="true">
        <circle className="mascote__pensando-bolinha" cx="176" cy="54" r="4" />
        <circle className="mascote__pensando-bolinha" cx="191" cy="43" r="5" />
        <circle className="mascote__pensando-bolinha" cx="208" cy="30" r="7" />
      </g>

      {/* corpo / monitor */}
      <rect className="mascote__corpo" x="30" y="36" width="160" height="106" rx="18" />
      <rect className="mascote__tela" x="43" y="49" width="134" height="80" rx="12" />
      <ellipse className="mascote__brilho" cx="82" cy="70" rx="34" ry="20" />

      {/* olhos */}
      <g className="mascote__olho mascote__olho--esq">
        <ellipse className="mascote__branco" cx="84" cy="86" rx="16" ry="17" />
        <circle className="mascote__pupila" cx="84" cy="88" r="8" />
        <circle className="mascote__cintila" cx="87" cy="84" r="3" />
      </g>
      <g className="mascote__olho mascote__olho--dir">
        <ellipse className="mascote__branco" cx="136" cy="86" rx="16" ry="17" />
        <circle className="mascote__pupila" cx="136" cy="88" r="8" />
        <circle className="mascote__cintila" cx="139" cy="84" r="3" />
      </g>

      {/* sobrancelhas */}
      <line className="mascote__sobrancelha mascote__sobrancelha--esq" x1="70" y1="66" x2="98" y2="63" />
      <line className="mascote__sobrancelha mascote__sobrancelha--dir" x1="122" y1="63" x2="150" y2="66" />

      {/* boca */}
      {estado === "erro" ? (
        <path className="mascote__boca mascote__boca--triste" d="M97 114 Q110 105 123 114" />
      ) : (
        <path className="mascote__boca" d="M97 110 Q110 121 123 110" />
      )}

      {/* ondas de fala */}
      <g className="mascote__onda" aria-hidden="true">
        <rect x="196" y="92" width="4" height="16" rx="2" />
        <rect x="205" y="84" width="4" height="32" rx="2" />
        <rect x="214" y="94" width="4" height="12" rx="2" />
      </g>

      {/* suporte */}
      <rect className="mascote__pescoco" x="99" y="140" width="22" height="14" />
      <rect className="mascote__base" x="68" y="152" width="84" height="13" rx="6" />
    </svg>
  );
}
