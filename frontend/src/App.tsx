import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { obterSaude, perguntar, type Mensagem } from "./api/client.js";
import { BolhaMensagem } from "./components/BolhaMensagem.js";
import { Sugestoes } from "./components/Sugestoes.js";

const MENSAGEM_INICIAL: Mensagem = {
  papel: "atendente",
  conteudo:
    "Olá! Eu sou o Byte, atendente da BytePeças. Posso ajudar você a escolher peças de computador, tirar dúvidas de compatibilidade e comparar produtos. O que você procura?",
};

const SUGESTOES: readonly string[] = [
  "Quero montar um PC gamer para 1440p até R$ 8000. O que você recomenda?",
  "Qual processador combina com uma RTX 4070 Super?",
  "Vocês têm SSD NVMe de 1TB? Qual o preço?",
  "Preciso de uma fonte para um Ryzen 7 com uma RX 7800 XT.",
];

type StatusServidor = "verificando" | "online" | "offline";

const ROTULO_STATUS: Record<StatusServidor, string> = {
  verificando: "Conectando…",
  online: "Atendente online",
  offline: "Servidor indisponível",
};

export function App() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([MENSAGEM_INICIAL]);
  const [entrada, setEntrada] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusServidor>("verificando");
  const [detalheStatus, setDetalheStatus] = useState("");
  const fimDaLista = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ativo = true;
    obterSaude()
      .then((saude) => {
        if (!ativo) return;
        setStatus("online");
        setDetalheStatus(`v${saude.versao} · ${saude.modelo}`);
      })
      .catch(() => {
        if (ativo) setStatus("offline");
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    fimDaLista.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensagens, carregando, erro]);

  const enviar = useCallback(
    async (texto: string) => {
      const pergunta = texto.trim();
      if (pergunta.length === 0 || carregando) return;

      const historico = mensagens.filter((mensagem) => mensagem !== MENSAGEM_INICIAL);

      setErro(null);
      setEntrada("");
      setMensagens((atual) => [...atual, { papel: "cliente", conteudo: pergunta }]);
      setCarregando(true);

      try {
        const { resposta } = await perguntar(pergunta, historico);
        setMensagens((atual) => [...atual, { papel: "atendente", conteudo: resposta }]);
      } catch (falha) {
        setErro(falha instanceof Error ? falha.message : "Erro inesperado.");
      } finally {
        setCarregando(false);
      }
    },
    [carregando, mensagens],
  );

  function aoSubmeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    void enviar(entrada);
  }

  return (
    <div className="app">
      <header className="topo">
        <div className="marca">
          <span className="logo" aria-hidden="true">
            BP
          </span>
          <div>
            <h1>BytePeças</h1>
            <p>Atendimento com IA · peças de computador</p>
          </div>
        </div>
        <div className={`status status--${status}`} title={detalheStatus}>
          <span className="ponto" aria-hidden="true" />
          {ROTULO_STATUS[status]}
        </div>
      </header>

      <main className="chat" aria-live="polite">
        {mensagens.map((mensagem, indice) => (
          <BolhaMensagem key={indice} mensagem={mensagem} />
        ))}

        {carregando && (
          <div className="digitando" aria-label="O atendente está digitando">
            <span />
            <span />
            <span />
          </div>
        )}

        {erro && (
          <div className="alerta" role="alert">
            {erro}
          </div>
        )}

        <div ref={fimDaLista} />
      </main>

      <Sugestoes sugestoes={SUGESTOES} aoEscolher={enviar} desabilitado={carregando} />

      <form className="entrada" onSubmit={aoSubmeter}>
        <label className="sr-only" htmlFor="pergunta">
          Sua pergunta
        </label>
        <input
          id="pergunta"
          value={entrada}
          onChange={(evento) => setEntrada(evento.target.value)}
          placeholder="Digite sua pergunta sobre peças de computador…"
          maxLength={1000}
          disabled={carregando}
          autoComplete="off"
        />
        <button type="submit" disabled={carregando || entrada.trim().length === 0}>
          {carregando ? "Enviando…" : "Enviar"}
        </button>
      </form>

      <footer className="rodape">
        Projeto acadêmico · dados fictícios · respostas geradas por IA (Google Gemini)
      </footer>
    </div>
  );
}
