export interface Config {
  porta: number;
  geminiApiKey: string;
  geminiModelo: string;
  corsOrigem: string | string[];
  logLevel: string;
  versao: string;
  tentativasIA: number;
  atrasoBaseMs: number;
  usarBuscaWeb: boolean;
  ragHabilitado: boolean;
  ragTopK: number;
  embedModelo: string;
}

export const VERSAO_PADRAO = "1.0.0";
export const MODELO_PADRAO = "gemini-3.5-flash-lite";
export const PORTA_PADRAO = 3000;
export const TENTATIVAS_PADRAO = 3;
export const ATRASO_BASE_PADRAO_MS = 800;
export const RAG_TOP_K_PADRAO = 4;
export const EMBED_MODELO_PADRAO = "gemini-embedding-001";

/**
 * Carrega e valida a configuração a partir do ambiente.
 * Falha cedo (throwing) se uma variável obrigatória estiver ausente, para
 * evitar subir um servidor sem chave de API.
 */
export function carregarConfig(
  env: NodeJS.ProcessEnv = process.env,
): Config {
  const geminiApiKey = env.GEMINI_API_KEY?.trim();
  if (!geminiApiKey) {
    throw new Error(
      "Variável de ambiente GEMINI_API_KEY é obrigatória. Copie .env.example para .env e preencha.",
    );
  }

  const portaBruta = env.PORT?.trim() ?? String(PORTA_PADRAO);
  const porta = Number.parseInt(portaBruta, 10);
  if (!Number.isInteger(porta) || porta <= 0 || porta > 65535) {
    throw new Error(`PORT inválido: "${portaBruta}". Use um inteiro entre 1 e 65535.`);
  }

  const corsBruto = env.CORS_ORIGIN?.trim() || "*";
  const corsOrigem =
    corsBruto === "*"
      ? "*"
      : corsBruto
          .split(",")
          .map((origem) => origem.trim())
          .filter((origem) => origem.length > 0);

  const tentativasIA = inteiroPositivo(
    env.IA_TENTATIVAS,
    TENTATIVAS_PADRAO,
    "IA_TENTATIVAS",
  );
  const atrasoBaseMs = inteiroPositivo(
    env.IA_ATRASO_BASE_MS,
    ATRASO_BASE_PADRAO_MS,
    "IA_ATRASO_BASE_MS",
  );

  return {
    porta,
    geminiApiKey,
    geminiModelo: env.GEMINI_MODEL?.trim() || MODELO_PADRAO,
    corsOrigem,
    logLevel: env.LOG_LEVEL?.trim() || "info",
    versao: env.APP_VERSION?.trim() || VERSAO_PADRAO,
    tentativasIA,
    atrasoBaseMs,
    usarBuscaWeb: booleano(env.USAR_BUSCA_WEB, true),
    ragHabilitado: booleano(env.RAG_HABILITADO, true),
    ragTopK: inteiroPositivo(env.RAG_TOP_K, RAG_TOP_K_PADRAO, "RAG_TOP_K"),
    embedModelo: env.EMBED_MODEL?.trim() || EMBED_MODELO_PADRAO,
  };
}

function booleano(valor: string | undefined, padrao: boolean): boolean {
  if (valor === undefined || valor.trim() === "") {
    return padrao;
  }
  return /^(1|true|sim|yes|on)$/i.test(valor.trim());
}

function inteiroPositivo(
  valor: string | undefined,
  padrao: number,
  nome: string,
): number {
  if (valor === undefined || valor.trim() === "") {
    return padrao;
  }
  const numero = Number.parseInt(valor, 10);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new Error(`${nome} inválido: "${valor}". Use um inteiro positivo.`);
  }
  return numero;
}
