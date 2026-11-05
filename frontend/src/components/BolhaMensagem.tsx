import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";

import type { Mensagem } from "../api/client.js";

interface Props {
  mensagem: Mensagem;
  animar?: boolean;
  aoTerminarFala?: () => void;
}

const INTERVALO_MS = 16;
const DURACAO_MAXIMA_MS = 2400;

/**
 * Converte um subconjunto mínimo de markdown (apenas `**negrito**`) em nós do
 * React. É seguro por construção: não injeta HTML, apenas cria <strong>.
 * Rede de proteção caso a IA ignore a instrução de responder em texto simples.
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
 * Uma bolha de mensagem. Quando `animar` é verdadeiro, o texto é "datilografado"
 * letra a letra (efeito de fala do mascote) e `aoTerminarFala` é chamado no fim.
 * O texto completo permanece acessível a leitores de tela.
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

  return (
    <div className={`bolha ${ehCliente ? "bolha--cliente" : "bolha--atendente"}`}>
      <span className="bolha__autor">{ehCliente ? "Você" : "Byte"}</span>
      <p className="bolha__texto">
        <span aria-hidden={digitando}>{formatarInline(exibido)}</span>
        {digitando && <span className="cursor" aria-hidden="true" />}
      </p>
    </div>
  );
}
