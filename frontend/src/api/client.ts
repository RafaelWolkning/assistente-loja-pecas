export type Papel = "cliente" | "atendente";

export interface Mensagem {
  papel: Papel;
  conteudo: string;
}

export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  descricao: string;
  estoque: number;
}

export interface Saude {
  status: string;
  versao: string;
  modelo: string;
  uptimeSegundos: number;
  dataHora: string;
}

export type OrigemPreco = "catalogo" | "estimativa";

export interface PrecoLoja {
  loja: string;
  preco: number;
}

export interface ProdutoComPrecos {
  nome: string;
  categoria: string;
  descricao: string;
  precoReferencia: number;
  origemPreco: OrigemPreco;
  precos: PrecoLoja[];
}

export interface RespostaAtendimento {
  mensagem: string;
  produtos: ProdutoComPrecos[];
}

/** URL base da API (Render). Sem barra no final. */
export const URL_API = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);

async function requisitar<T>(caminho: string, init?: RequestInit): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${URL_API}${caminho}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new Error(
      "Não foi possível falar com o servidor. Ele pode estar acordando (deploy gratuito) — aguarde alguns segundos e tente de novo.",
    );
  }

  if (!resposta.ok) {
    let mensagem = `O servidor respondeu com erro ${resposta.status}.`;
    try {
      const corpo = (await resposta.json()) as { erro?: string };
      if (corpo.erro) {
        mensagem = corpo.erro;
      }
    } catch {
      // corpo não-JSON: mantém a mensagem padrão
    }
    throw new Error(mensagem);
  }

  return (await resposta.json()) as T;
}

export function obterSaude(): Promise<Saude> {
  return requisitar<Saude>("/saude");
}

export function listarProdutos(): Promise<{ produtos: Produto[] }> {
  return requisitar<{ produtos: Produto[] }>("/produtos");
}

interface RespostaBruta {
  mensagem?: unknown;
  resposta?: unknown;
  produtos?: unknown;
}

export async function perguntar(
  pergunta: string,
  historico: Mensagem[],
): Promise<RespostaAtendimento> {
  const dados = await requisitar<RespostaBruta>("/perguntar", {
    method: "POST",
    body: JSON.stringify({ pergunta, historico }),
  });

  // Tolera versões anteriores da API (que devolviam apenas `resposta`).
  const mensagem =
    typeof dados.mensagem === "string"
      ? dados.mensagem
      : typeof dados.resposta === "string"
        ? dados.resposta
        : "";

  const produtos = Array.isArray(dados.produtos)
    ? (dados.produtos as ProdutoComPrecos[])
    : [];

  return { mensagem, produtos };
}
