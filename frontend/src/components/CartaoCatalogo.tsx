import type { Produto } from "../api/client.js";
import { formatarBRL } from "../utils/formato.js";
import { ImagemProduto } from "./ImagemProduto.js";

interface Props {
  produto: Produto;
  aoPerguntar: (produto: Produto) => void;
}

/** Card da vitrine: ilustração grande, descrição, preço e atalho para a IA. */
export function CartaoCatalogo({ produto, aoPerguntar }: Props) {
  const estoqueBaixo = produto.estoque > 0 && produto.estoque <= 5;
  const esgotado = produto.estoque === 0;

  return (
    <article className={`vitrine ${esgotado ? "vitrine--esgotado" : ""}`}>
      <div className="vitrine__midia">
        <ImagemProduto categoria={produto.categoria} nome={produto.nome} variante="vitrine" />
        <span className="vitrine__categoria">{produto.categoria}</span>
        {estoqueBaixo && <span className="vitrine__tag">Últimas {produto.estoque} un.</span>}
        {esgotado && <span className="vitrine__tag vitrine__tag--esgotado">Esgotado</span>}
      </div>

      <div className="vitrine__corpo">
        <h3 className="vitrine__nome">{produto.nome}</h3>
        <p className="vitrine__descricao">{produto.descricao}</p>

        <div className="vitrine__preco">
          <span>a partir de</span>
          <strong>{formatarBRL(produto.preco)}</strong>
          <small>ou 12x de {formatarBRL(produto.preco / 12)} sem juros</small>
        </div>

        <button
          type="button"
          className="botao botao--card"
          onClick={() => aoPerguntar(produto)}
          disabled={esgotado}
        >
          {esgotado ? "Indisponível" : "Perguntar ao Byte"}
        </button>
      </div>
    </article>
  );
}