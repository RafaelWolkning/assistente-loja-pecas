import type { ReactElement } from "react";

/**
 * Cena vetorial da home: um setup gamer completo (monitor, gabinete, teclado,
 * mouse e peças flutuando) desenhado em SVG, sem imagens externas.
 */
export function IlustracaoSetup(): ReactElement {
  return (
    <svg
      className="setup"
      viewBox="0 0 560 430"
      role="img"
      aria-label="Ilustração de um computador gamer com monitor, gabinete, teclado e componentes flutuando"
    >
      <defs>
        <linearGradient id="setup-mesa" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1d294d" />
          <stop offset="1" stopColor="#0b1224" />
        </linearGradient>
        <linearGradient id="setup-tela" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0f3a56" />
          <stop offset="1" stopColor="#081427" />
        </linearGradient>
        <linearGradient id="setup-gabinete" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2b3a68" />
          <stop offset="1" stopColor="#141c34" />
        </linearGradient>
        <linearGradient id="setup-rgb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#23d5e0" />
          <stop offset="0.5" stopColor="#8b7bff" />
          <stop offset="1" stopColor="#ff6f61" />
        </linearGradient>
        <radialGradient id="setup-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#23d5e0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#23d5e0" stopOpacity="0" />
        </radialGradient>
        <filter id="setup-brilho" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="8" result="borrado" />
          <feMerge>
            <feMergeNode in="borrado" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="285" cy="214" rx="240" ry="160" fill="url(#setup-halo)" />

      {/* mesa */}
      <rect x="35" y="347" width="490" height="12" rx="6" fill="url(#setup-mesa)" />
      <path d="M78 359v42M482 359v42" stroke="#1e2a4c" strokeWidth="8" strokeLinecap="round" />

      {/* monitor */}
      <rect x="92" y="58" width="316" height="196" rx="18" fill="#111a31" stroke="#2c3d69" strokeWidth="2" />
      <rect x="106" y="72" width="288" height="162" rx="12" fill="url(#setup-tela)" stroke="#23d5e0" strokeOpacity="0.35" />
      <path d="M212 254h76l10 52h-96z" fill="#1a2543" />
      <rect x="178" y="306" width="144" height="12" rx="6" fill="#26345a" />

      {/* conteúdo da tela: mini loja */}
      <g opacity="0.95">
        <rect x="122" y="88" width="74" height="10" rx="5" fill="#23d5e0" />
        <rect x="122" y="106" width="122" height="7" rx="3.5" fill="#4c628f" />
        <rect x="122" y="132" width="74" height="54" rx="8" fill="#162d4e" stroke="#23d5e0" strokeOpacity="0.4" />
        <rect x="206" y="132" width="74" height="54" rx="8" fill="#162d4e" stroke="#8b7bff" strokeOpacity="0.45" />
        <rect x="290" y="132" width="74" height="54" rx="8" fill="#162d4e" stroke="#ff6f61" strokeOpacity="0.4" />
        <path d="M140 158h38M224 158h38M308 158h38" stroke="#23d5e0" strokeWidth="5" strokeLinecap="round" />
        <rect x="122" y="200" width="242" height="20" rx="10" fill="#0b1a2e" stroke="#2b3d66" />
        <circle cx="138" cy="210" r="4" fill="#37e0a0" />
        <circle cx="152" cy="210" r="4" fill="#ffd166" />
        <circle cx="166" cy="210" r="4" fill="#ff6f61" />
      </g>

      {/* gabinete */}
      <g>
        <rect x="422" y="104" width="96" height="244" rx="14" fill="url(#setup-gabinete)" stroke="#334677" strokeWidth="2" />
        <rect x="432" y="116" width="76" height="220" rx="10" fill="#0d1730" stroke="#23d5e0" strokeOpacity="0.3" />
        <circle cx="470" cy="154" r="21" fill="#111f3c" stroke="url(#setup-rgb)" strokeWidth="3" />
        <circle cx="470" cy="154" r="6" fill="#23d5e0" />
        <path d="M470 133v42M449 154h42M455 139l30 30M485 139l-30 30" stroke="#23d5e0" strokeWidth="2" strokeOpacity="0.8" />
        <circle cx="470" cy="210" r="17" fill="#111f3c" stroke="url(#setup-rgb)" strokeWidth="3" />
        <circle cx="470" cy="210" r="5" fill="#8b7bff" />
        <rect x="444" y="252" width="52" height="7" rx="3.5" fill="url(#setup-rgb)" filter="url(#setup-brilho)" />
        <rect x="444" y="270" width="38" height="5" rx="2.5" fill="#4c628f" />
        <rect x="444" y="286" width="46" height="5" rx="2.5" fill="#4c628f" />
        <circle cx="470" cy="316" r="5" fill="#37e0a0" />
      </g>

      {/* teclado */}
      <g>
        <rect x="116" y="308" width="212" height="34" rx="8" fill="#141f3a" stroke="#2b3d66" strokeWidth="2" />
        {[0, 1, 2, 3].map((linha) => (
          <path
            key={linha}
            d={`M128 ${315 + linha * 7}h188`}
            stroke={linha === 0 ? "#23d5e0" : "#4c628f"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="9 6"
            opacity={linha === 0 ? 0.9 : 0.7}
          />
        ))}
      </g>

      {/* mouse */}
      <ellipse cx="372" cy="324" rx="21" ry="17" fill="#162340" stroke="#334677" strokeWidth="2" />
      <path d="M372 310v10" stroke="#23d5e0" strokeWidth="3" strokeLinecap="round" />

      {/* peças flutuando */}
      <g className="setup__peca setup__peca--cpu">
        <rect x="20" y="112" width="58" height="58" rx="10" fill="#2a2347" stroke="#ffd166" strokeWidth="2.5" />
        <rect x="36" y="128" width="26" height="26" rx="4" fill="#ffd166" opacity="0.85" />
        <path d="M29 112v-9M42 112v-9M55 112v-9M29 170v9M42 170v9M55 170v9M20 121h-9M20 134h-9M20 147h-9M78 121h9M78 134h9M78 147h9" stroke="#ffd166" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      <g className="setup__peca setup__peca--gpu">
        <rect x="18" y="222" width="86" height="42" rx="8" fill="#241f3d" stroke="#8b7bff" strokeWidth="2.5" />
        <circle cx="41" cy="243" r="12" fill="#11152b" stroke="#8b7bff" strokeWidth="2" />
        <circle cx="76" cy="243" r="9" fill="#11152b" stroke="#8b7bff" strokeWidth="2" />
        <path d="M41 234v18M32 243h18M76 236v14" stroke="#8b7bff" strokeWidth="2" />
      </g>

      <g className="setup__peca setup__peca--ram">
        <rect x="484" y="42" width="64" height="24" rx="5" fill="#173529" stroke="#37e0a0" strokeWidth="2.5" />
        <path d="M493 66v6M503 66v6M513 66v6M523 66v6M533 66v6" stroke="#37e0a0" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="493" y="48" width="8" height="12" rx="2" fill="#37e0a0" />
        <rect x="506" y="48" width="8" height="12" rx="2" fill="#37e0a0" />
        <rect x="519" y="48" width="8" height="12" rx="2" fill="#37e0a0" />
      </g>

      <g className="setup__peca setup__peca--ssd">
        <rect x="480" y="250" width="66" height="34" rx="6" fill="#1c2747" stroke="#23d5e0" strokeWidth="2.5" />
        <circle cx="531" cy="267" r="4" fill="#23d5e0" />
        <path d="M491 267h24" stroke="#23d5e0" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* partículas de luz */}
      <circle cx="76" cy="58" r="3" fill="#ffd166" opacity="0.85" />
      <circle cx="390" cy="44" r="3.5" fill="#23d5e0" opacity="0.8" />
      <circle cx="532" cy="178" r="3" fill="#ff6f61" opacity="0.8" />
      <circle cx="38" cy="306" r="2.5" fill="#8b7bff" opacity="0.9" />
    </svg>
  );
}