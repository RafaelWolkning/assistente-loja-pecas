import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { obterSaude, perguntar, type Mensagem } from "./api/client.js";
import { BolhaMensagem } from "./components/BolhaMensagem.js";
import { Mascote, type EstadoMascote } from "./components/Mascote.js";
import { Sugestoes } from "./components/Sugestoes.js";

interface ItemChat extends Mensagem {
  id: number;
  animar?: boolean;
}

const MENSAGEM_INICIAL: ItemChat = {
  id: 0,
  papel: "atendente",
  conteudo:
    "Oi! Eu sou o Byte, atendente da BytePeças. Posso te ajudar a montar um PC, comparar peças e tirar dúvidas de compatibilidade. O que você procura?",
};

const SUGESTOES: readonly string[] = [
  "Quero montar um PC gamer para 1440p até R$ 8000.",
  "Qual processador combina com uma RTX 4070 Super?",
  "Vocês têm SSD NVMe de 1TB? Qual o preço?",
  "Preciso de uma fonte para um Ryzen 7 com uma RX 7800 XT.",
];

const LEGENDA: Record<EstadoMascote, string> = {
  ocioso: "Estou online e pronto para ajudar.",
  pensando: "Deixa eu pensar…",
  falando: "Olha só o que encontrei:",
  erro: "Não consegui responder agora.",
};

type StatusServidor = "verificando" | "online" | "offline";

const ROTULO_STATUS: Record<StatusServidor, string> = {
  verificando: "Conectando…",
  online: "Atendente online",
  offline: "Servidor indisponível",
};

export function App() {
  const reduzirMovimento = useMemo(
    () =>
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false,
    [],
  );

  const [mensagens, setMensagens] = useState<ItemChat[]>(() => [
    { ...MENSAGEM_INICIAL, animar: !reduzirMovimento },
  ]);
  const [entrada, setEntrada] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [estadoMascote, setEstadoMascote] = useState<EstadoMascote>(
    reduzirMovimento ? "ocioso" : "falando",
  );
  const [status, setStatus] = useState<StatusServidor>("verificando");
  const [detalheStatus, setDetalheStatus] = useState("");
  const proximoId = useRef(1);
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
    fimDaLista.current?.scrollIntoView({ behavior: reduzirMovimento ? "auto" : "smooth", block: "end" });
  }, [mensagens, carregando, erro, reduzirMovimento]);

  const aoTerminarFala = useCallback(() => {
    setEstadoMascote("ocioso");
    setMensagens((atuais) => atuais.map((item) => (item.animar ? { ...item, animar: false } : item)));
  }, []);

  const enviar = useCallback(
    async (texto: string) => {
      const pergunta = texto.trim();
      if (pergunta.length === 0 || carregando) return;

      const historico: Mensagem[] = mensagens
        .filter((item) => item.id !== MENSAGEM_INICIAL.id)
        .map((item) => ({ papel: item.papel, conteudo: item.conteudo }));

      setErro(null);
      setEntrada("");
      setEstadoMascote("pensando");
      setMensagens((atuais) => [
        ...atuais,
        { id: proximoId.current++, papel: "cliente", conteudo: pergunta },
      ]);
      setCarregando(true);

      try {
        const { resposta } = await perguntar(pergunta, historico);
        setMensagens((atuais) => [
          ...atuais,
          {
            id: proximoId.current++,
            papel: "atendente",
            conteudo: resposta,
            animar: !reduzirMovimento,
          },
        ]);
        setEstadoMascote(reduzirMovimento ? "ocioso" : "falando");
      } catch (falha) {
        setErro(falha instanceof Error ? falha.message : "Erro inesperado.");
        setEstadoMascote("erro");
      } finally {
        setCarregando(false);
      }
    },
    [carregando, mensagens, reduzirMovimento],
  );

  function aoSubmeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    void enviar(entrada);
  }

  return (
    <div className="app">
      <header className="topo entrar" style={{ animationDelay: "0.05s" }}>
        <div className="mascote-wrap">
          <Mascote estado={estadoMascote} />
        </div>
        <div className="topo__texto">
          <p className="saudacao">Olá! Eu sou o Byte</p>
          <h1>BytePeças</h1>
          <p className="legenda" key={estadoMascote}>
            {LEGENDA[estadoMascote]}
          </p>
        </div>
        <div className={`status status--${status}`} title={detalheStatus}>
          <span className="ponto" aria-hidden="true" />
          {ROTULO_STATUS[status]}
        </div>
      </header>

      <main className="chat entrar" style={{ animationDelay: "0.18s" }} aria-live="polite">
        {mensagens.map((item) => (
          <BolhaMensagem
            key={item.id}
            mensagem={item}
            animar={item.animar}
            aoTerminarFala={aoTerminarFala}
          />
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

      <div className="entrar" style={{ animationDelay: "0.3s" }}>
        <Sugestoes sugestoes={SUGESTOES} aoEscolher={enviar} desabilitado={carregando} />
      </div>

      <form className="entrada entrar" style={{ animationDelay: "0.36s" }} onSubmit={aoSubmeter}>
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

      <footer className="rodape entrar" style={{ animationDelay: "0.42s" }}>
        Projeto acadêmico · dados fictícios · respostas geradas por IA (Google Gemini)
      </footer>
    </div>
  );
}
