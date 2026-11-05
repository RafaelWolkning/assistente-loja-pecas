import type { ReactElement } from "react";

type Chave =
  | "cpu"
  | "gpu"
  | "memoria"
  | "armazenamento"
  | "monitor"
  | "periferico"
  | "notebook"
  | "placa"
  | "fonte"
  | "cooler"
  | "gabinete"
  | "rede"
  | "generico";

/** Descobre a ilustração a partir da categoria/nome do produto. */
export function chaveCategoria(categoria: string, nome: string): Chave {
  const texto = `${categoria} ${nome}`.toLowerCase();
  if (/monitor|tela/.test(texto)) return "monitor";
  if (/processador|\bcpu\b|ryzen|core i|intel core/.test(texto)) return "cpu";
  if (/placa de v|\bgpu\b|radeon|geforce|rtx|gtx/.test(texto)) return "gpu";
  if (/mem[oó]ria|\bram\b|ddr/.test(texto)) return "memoria";
  if (/ssd|\bhd\b|armazen|nvme/.test(texto)) return "armazenamento";
  if (/note|lap|ultrabook/.test(texto)) return "notebook";
  if (/teclado|mouse|perif|headset|fone|webcam|gamepad/.test(texto)) return "periferico";
  if (/placa-?m[aã]e|motherboard/.test(texto)) return "placa";
  if (/fonte|\bpsu\b/.test(texto)) return "fonte";
  if (/cooler|refrigera|water|fan/.test(texto)) return "cooler";
  if (/gabinete|\bcase\b/.test(texto)) return "gabinete";
  if (/roteador|rede|wi-?fi|switch/.test(texto)) return "rede";
  return "generico";
}

const ICONES: Record<Chave, ReactElement> = {
  cpu: (
    <>
      <rect x="18" y="18" width="28" height="28" rx="4" />
      <rect x="26" y="26" width="12" height="12" rx="2" />
      <path d="M24 18V11M32 18V11M40 18V11M24 46v7M32 46v7M40 46v7M18 24h-7M18 32h-7M18 40h-7M46 24h7M46 32h7M46 40h7" />
    </>
  ),
  gpu: (
    <>
      <rect x="8" y="18" width="48" height="26" rx="4" />
      <circle cx="24" cy="31" r="7" />
      <circle cx="43" cy="31" r="5" />
      <path d="M8 44v8h56" />
    </>
  ),
  memoria: (
    <>
      <rect x="9" y="22" width="46" height="20" rx="3" />
      <path d="M18 42v6M32 42v6M46 42v6M18 22v-5M28 22v-5M38 22v-5M48 22v-5" />
    </>
  ),
  armazenamento: (
    <>
      <rect x="11" y="20" width="42" height="24" rx="4" />
      <circle cx="44" cy="32" r="3" />
      <path d="M20 32h13" />
    </>
  ),
  monitor: (
    <>
      <rect x="8" y="12" width="48" height="32" rx="4" />
      <path d="M24 54h16M32 44v10" />
    </>
  ),
  periferico: (
    <>
      <rect x="8" y="22" width="48" height="20" rx="4" />
      <path d="M16 30h2M24 30h2M32 30h2M40 30h2M48 30h2M20 38h24" />
    </>
  ),
  notebook: (
    <>
      <rect x="12" y="14" width="40" height="27" rx="3" />
      <path d="M7 49h50l-4-8H11z" />
    </>
  ),
  placa: (
    <>
      <rect x="9" y="9" width="46" height="46" rx="4" />
      <rect x="17" y="17" width="13" height="13" rx="2" />
      <path d="M39 17h9v9h-9zM17 39h16M40 35v13" />
    </>
  ),
  fonte: (
    <>
      <rect x="9" y="18" width="46" height="28" rx="4" />
      <circle cx="45" cy="32" r="6" />
      <path d="M17 29h15M17 36h11" />
    </>
  ),
  cooler: (
    <>
      <circle cx="32" cy="32" r="16" />
      <circle cx="32" cy="32" r="3" />
      <path d="M32 16v10M32 38v10M16 32h10M38 32h10" />
    </>
  ),
  gabinete: (
    <>
      <rect x="18" y="7" width="28" height="50" rx="4" />
      <circle cx="32" cy="19" r="3" />
      <path d="M24 34h16M24 43h16" />
    </>
  ),
  rede: (
    <>
      <rect x="9" y="30" width="46" height="18" rx="4" />
      <path d="M20 30v-7M32 30v-12M44 30v-7" />
      <circle cx="20" cy="39" r="2" />
      <circle cx="29" cy="39" r="2" />
    </>
  ),
  generico: (
    <>
      <rect x="15" y="15" width="34" height="34" rx="6" />
      <rect x="26" y="26" width="12" height="12" rx="2" />
      <path d="M32 9v6M32 49v6M9 32h6M49 32h6" />
    </>
  ),
};

interface Props {
  categoria: string;
  nome: string;
}

/** Ilustração vetorial do produto, escolhida pela categoria (sem imagens externas). */
export function ImagemProduto({ categoria, nome }: Props): ReactElement {
  const chave = chaveCategoria(categoria, nome);

  return (
    <div className={`produto__imagem produto__imagem--${chave}`} aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {ICONES[chave]}
      </svg>
    </div>
  );
}
