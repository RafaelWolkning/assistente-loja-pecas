import type { ProdutoComPrecos } from "../api/client.js";
import { ImagemProduto } from "./ImagemProduto.js";

const FORMATADOR_BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarBRL(valor: number): string {
  return FORMATADOR_BRL.format(valor);
}

/** Card de um produto: ilustração, descrição e tabela de preços por loja. */
export function CartaoProduto({ produto }: { produto: ProdutoComPrecos }) {
  const precos = produto.precos ?? [];
  const menorPreco = precos.length > 0 ? Math.min(...precos.map((p) => p.preco)) : 0;

  return (
    <article className="produto">
      <div className="produto__topo">
        <ImagemProduto categoria={produto.categoria} nome={produto.nome} />
        <div className="produto__info">
          <span className="produto__categoria">{produto.categoria}</span>
          <h3 className="produto__nome">{produto.nome}</h3>
          {produto.descricao && <p className="produto__descricao">{produto.descricao}</p>}
          <span className={`produto__origem produto__origem--${produto.origemPreco}`}>
            {produto.origemPreco === "catalogo"
              ? "Preço de catálogo BytePeças"
              : "Preço estimado pela IA"}
          </span>
        </div>
      </div>

      {precos.length > 0 && (
        <div className="produto__tabela-wrap">
          <table className="tabela">
            <caption>Comparação de preços · valores simulados</caption>
            <thead>
              <tr>
                <th scope="col">Loja</th>
                <th scope="col">Preço</th>
              </tr>
            </thead>
            <tbody>
              {precos.map((preco) => {
                const melhor = preco.preco === menorPreco;
                return (
                  <tr key={preco.loja} className={melhor ? "tabela__linha--melhor" : undefined}>
                    <th scope="row">{preco.loja}</th>
                    <td>
                      {formatarBRL(preco.preco)}
                      {melhor && <span className="selo">melhor preço</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
