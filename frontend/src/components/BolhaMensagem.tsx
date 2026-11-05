import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";

import type { Papel, ProdutoComPrecos } from "../api/client.js";
import { CartaoProduto } from "./CartaoProduto.js";

interface MensagemExibida {
  papel: Papel;
  conteudo: string;
  produtos?: ProdutoComPrecos[];
}

interface Props {
  mensagem: MensagemExibida;
  animar?: boolean;
  aoTerminarFala?: () => void;
}

const INTERVALO_MS = 16;
const DURACAO_MAXIMA_MS = 2400;

/**
 * Converte um subconjunto mínimo de markdown (apenas `**negrito**`) em nós do
 * React. É seguro por construção: não injeta HTML, apenas cria <strong>.
 */
export function formatarInline(texto: string): ReactNode {
  return texto.split(/(\*\*[^*\n]+\*\*)/g).map((parte, indice) => {
    const negrito = /^\*\*([^*\n]+)\*\*$/.exec(parte);
    if (negrito) {
      return <strong key={indice}>{negrito[1]}</strong>;
    }
    return <Fragment key={indice}>{parte}</Fragment>;
  });
}

/**
 * Renderiza a mensagem separando os parágrafos (linhas em branco criam
 * respiro); linhas dentro do parágrafo são preservadas (white-space: pre-wrap).
 */
function Paragrafos({ texto, cursor }: { texto: string; cursor: boolean }) {
  const blocos = texto.split(/\n{2,}/);

  return (
    <>
      {blocos.map((bloco, indice) => {
        const ultimo = indice === blocos.length - 1;
        return (
          <p key={indice} className="bolha__paragrafo">
            {formatarInline(bloco)}
            {cursor && ultimo && <span className="cursor" aria-hidden="true" />}
          </p>
        );
      })}
    </>
  );
}

/**
 * Uma bolha de mensagem. Quando `animar` é verdadeiro, o texto é "datilografado"
 * letra a letra (efeito de fala do mascote); os produtos e a tabela de preços
 * aparecem ao terminar. O texto completo permanece acessível a leitores de tela.
 */
export function BolhaMensagem({ mensagem, animar = false, aoTerminarFala }: Props) {
  const [visivel, setVisivel] = useState(animar ? "" : mensagem.conteudo);
  const avisouRef = useRef(false);

  useEffect(() => {
    if (!animar) {
      setVisivel(mensagem.conteudo);
      return;
    }

    avisouRef.current = false;
    const total = mensagem.conteudo.length;
    const passo = Math.max(1, Math.ceil((total / DURACAO_MAXIMA_MS) * INTERVALO_MS));
    let indice = 0;

    const timer = window.setInterval(() => {
      indice = Math.min(total, indice + passo);
      setVisivel(mensagem.conteudo.slice(0, indice));
      if (indice >= total) {
        window.clearInterval(timer);
        if (!avisouRef.current) {
          avisouRef.current = true;
          aoTerminarFala?.();
        }
      }
    }, INTERVALO_MS);

    return () => window.clearInterval(timer);
  }, [animar, mensagem.conteudo, aoTerminarFala]);

  const ehCliente = mensagem.papel === "cliente";
  const digitando = animar && visivel.length < mensagem.conteudo.length;
  const exibido = digitando ? visivel : mensagem.conteudo;
  const temProdutos = !ehCliente && !digitando && (mensagem.produtos?.length ?? 0) > 0;

  return (
    <div className={`bolha ${ehCliente ? "bolha--cliente" : "bolha--atendente"} ${temProdutos ? "bolha--rica" : ""}`}>
      <span className="bolha__autor">{ehCliente ? "Você" : "Byte"}</span>

      <div className="bolha__corpo">
        <Paragrafos texto={exibido} cursor={digitando} />
      </div>

      {temProdutos && (
        <div className="produtos">
          {mensagem.produtos?.map((produto, indice) => (
            <CartaoProduto key={`${produto.nome}-${indice}`} produto={produto} />
          ))}
        </div>
      )}
    </div>
  );
}
