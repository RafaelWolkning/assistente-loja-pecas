import { useMemo, useState } from "react";

import type { Produto } from "../api/client.js";
import { CartaoCatalogo } from "./CartaoCatalogo.js";

const TODAS = "Todas";

/** Remove acentos e normaliza a caixa para buscas tolerantes. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** Filtra o catálogo por categoria e por busca livre (nome, categoria e descrição). */
export function filtrarProdutos(
  produtos: readonly Produto[],
  categoria: string,
  busca: string,
): Produto[] {
  const termo = normalizar(busca.trim());
  const tokens = termo.split(/\s+/).filter((token) => token.length > 0);

  return produtos.filter((produto) => {
    if (categoria !== TODAS && produto.categoria !== categoria) {
      return false;
    }
    if (tokens.length === 0) {
      return true;
    }

    const alvo = normalizar(`${produto.nome} ${produto.categoria} ${produto.descricao}`);
    return tokens.every((token) => alvo.includes(token));
  });
}

/** Categorias na ordem em que aparecem, com a quantidade de peças. */
export function categoriasDisponiveis(
  produtos: readonly Produto[],
): { nome: string; total: number }[] {
  const contagem = new Map<string, number>();
  for (const produto of produtos) {
    contagem.set(produto.categoria, (contagem.get(produto.categoria) ?? 0) + 1);
  }
  return [...contagem.entries()].map(([nome, total]) => ({ nome, total }));
}

interface Props {
  produtos: readonly Produto[];
  carregando: boolean;
  erro: string | null;
  aoRecarregar: () => void;
  aoPerguntar: (produto: Produto) => void;
}

/** Vitrine de peças: busca, filtros por categoria e grade de produtos. */
export function Catalogo({ produtos, carregando, erro, aoRecarregar, aoPerguntar }: Props) {
  const [categoria, setCategoria] = useState(TODAS);
  const [busca, setBusca] = useState("");

  const categorias = useMemo(() => categoriasDisponiveis(produtos), [produtos]);
  const filtrados = useMemo(
    () => filtrarProdutos(produtos, categoria, busca),
    [produtos, categoria, busca],
  );

  return (
    <section id="catalogo" className="secao entrar" aria-labelledby="titulo-catalogo">
      <div className="secao__cabecalho">
        <div>
          <span className="secao__olho">Catálogo</span>
          <h2 id="titulo-catalogo">Peças para montar do zero</h2>
          <p className="secao__descricao">
            Processadores, placas de vídeo, memórias e tudo o que o seu PC precisa.
            Preços fictícios para demonstração acadêmica.
          </p>
        </div>

        <label className="busca">
          <span className="sr-only">Buscar peça</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m16.5 16.5 4 4" />
          </svg>
          <input
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Buscar por nome ou categoria…"
            autoComplete="off"
          />
        </label>
      </div>

      <div className="filtros" role="group" aria-label="Filtrar por categoria">
        <button
          type="button"
          className={`filtro ${categoria === TODAS ? "filtro--ativo" : ""}`}
          onClick={() => setCategoria(TODAS)}
          aria-pressed={categoria === TODAS}
        >
          {TODAS}
          <span className="filtro__contagem">{produtos.length}</span>
        </button>
        {categorias.map((item) => (
          <button
            key={item.nome}
            type="button"
            className={`filtro ${categoria === item.nome ? "filtro--ativo" : ""}`}
            onClick={() => setCategoria(item.nome)}
            aria-pressed={categoria === item.nome}
          >
            {item.nome}
            <span className="filtro__contagem">{item.total}</span>
          </button>
        ))}
      </div>

      {carregando && (
        <div className="grade-produtos" role="status" aria-label="Carregando catálogo">
          {Array.from({ length: 6 }, (_, indice) => (
            <div className="vitrine esqueleto" key={indice}>
              <div className="esqueleto__midia" />
              <div className="esqueleto__linha" />
              <div className="esqueleto__linha esqueleto__linha--curta" />
              <div className="esqueleto__linha esqueleto__linha--preco" />
            </div>
          ))}
        </div>
      )}

      {!carregando && erro && (
        <div className="catalogo__aviso" role="alert">
          <p>{erro}</p>
          <button type="button" className="botao botao--fantasma" onClick={aoRecarregar}>
            Tentar novamente
          </button>
        </div>
      )}

      {!carregando && !erro && (
        <>
          <p className="catalogo__resultado">
            {filtrados.length} {filtrados.length === 1 ? "peça encontrada" : "peças encontradas"}
          </p>

          {filtrados.length > 0 ? (
            <div className="grade-produtos">
              {filtrados.map((produto) => (
                <CartaoCatalogo key={produto.id} produto={produto} aoPerguntar={aoPerguntar} />
              ))}
            </div>
          ) : (
            <div className="catalogo__vazio">
              <p>Nenhuma peça encontrada para essa busca.</p>
              <button
                type="button"
                className="botao botao--fantasma"
                onClick={() => {
                  setBusca("");
                  setCategoria(TODAS);
                }}
              >
                Limpar filtros
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}