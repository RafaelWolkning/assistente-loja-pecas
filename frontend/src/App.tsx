import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  listarProdutos,
  obterSaude,
  perguntar,
  type FonteWeb,
  type Mensagem,
  type Produto,
  type ProdutoComPrecos,
} from "./api/client.js";
import { BolhaMensagem } from "./components/BolhaMensagem.js";
import { Catalogo } from "./components/Catalogo.js";
import { IlustracaoSetup } from "./components/IlustracaoSetup.js";
import { Mascote, type EstadoMascote } from "./components/Mascote.js";
import { Sugestoes } from "./components/Sugestoes.js";

interface ItemChat extends Mensagem {
  id: number;
  animar?: boolean;
  produtos?: ProdutoComPrecos[];
  fontesWeb?: FonteWeb[];
  conhecimento?: string[];
  foraDeEscopo?: boolean;
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

const DIFERENCIAIS = [
  {
    icone: "pc",
    titulo: "Peças de verdade",
    texto: "Catálogo organizado por categoria, com especificações e disponibilidade.",
  },
  {
    icone: "preco",
    titulo: "Preço comparado",
    texto: "Cada peça mostra a comparação entre as lojas parceiras da BytePeças.",
  },
  {
    icone: "ia",
    titulo: "IA especialista",
    texto: "O Byte responde dúvidas de compatibilidade e sugere a montagem ideal.",
  },
] as const;

function IconeDiferencial({ tipo }: { tipo: (typeof DIFERENCIAIS)[number]["icone"] }) {
  if (tipo === "pc") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </svg>
    );
  }
  if (tipo === "preco") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h10" />
        <circle cx="18" cy="18" r="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="12" rx="3" />
      <circle cx="9.5" cy="11" r="1.4" />
      <circle cx="14.5" cy="11" r="1.4" />
      <path d="M9 20h6M12 17v3" />
    </svg>
  );
}

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
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  const [erroProdutos, setErroProdutos] = useState<string | null>(null);
  const proximoId = useRef(1);
  const fimDaLista = useRef<HTMLDivElement>(null);
  const campoPergunta = useRef<HTMLInputElement>(null);

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

  const carregarProdutos = useCallback(async () => {
    setCarregandoProdutos(true);
    setErroProdutos(null);
    try {
      const resposta = await listarProdutos();
      setProdutos(resposta.produtos);
    } catch (falha) {
      setErroProdutos(
        falha instanceof Error
          ? falha.message
          : "Não foi possível carregar o catálogo agora.",
      );
    } finally {
      setCarregandoProdutos(false);
    }
  }, []);

  useEffect(() => {
    void carregarProdutos();
  }, [carregarProdutos]);

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
        const { mensagem, produtos, foraDeEscopo, fontesWeb, conhecimento } = await perguntar(
          pergunta,
          historico,
        );
        setMensagens((atuais) => [
          ...atuais,
          {
            id: proximoId.current++,
            papel: "atendente",
            conteudo: mensagem,
            produtos,
            fontesWeb,
            conhecimento,
            foraDeEscopo,
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

  const irParaAssistente = useCallback(() => {
    document.getElementById("assistente")?.scrollIntoView({
      behavior: reduzirMovimento ? "auto" : "smooth",
      block: "start",
    });
    window.setTimeout(() => campoPergunta.current?.focus(), reduzirMovimento ? 0 : 400);
  }, [reduzirMovimento]);

  const perguntarSobreProduto = useCallback(
    (produto: Produto) => {
      document.getElementById("assistente")?.scrollIntoView({
        behavior: reduzirMovimento ? "auto" : "smooth",
        block: "start",
      });
      void enviar(
        `Tenho interesse no ${produto.nome}. Ele está disponível? Qual o preço e o que preciso para usá-lo?`,
      );
    },
    [enviar, reduzirMovimento],
  );

  return (
    <div className="app">
      <header className="navegacao entrar">
        <a className="marca" href="#inicio" aria-label="BytePeças — voltar ao início">
          <span className="marca__icone" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="5" width="24" height="17" rx="4" />
              <circle cx="11" cy="13.5" r="1.8" />
              <circle cx="21" cy="13.5" r="1.8" />
              <path d="M12 18h8M13 27h6M16 22v5" />
            </svg>
          </span>
          <span className="marca__texto">
            BytePeças
            <small>peças de PC &amp; IA</small>
          </span>
        </a>

        <nav className="navegacao__links" aria-label="Navegação principal">
          <a href="#catalogo">Catálogo</a>
          <a href="#assistente">Assistente</a>
          <a href="#sobre">Diferenciais</a>
        </nav>

        <div className={`status status--${status}`} title={detalheStatus}>
          <span className="ponto" aria-hidden="true" />
          {ROTULO_STATUS[status]}
        </div>
      </header>

      <main>
        <section id="inicio" className="hero entrar" aria-labelledby="titulo-hero">
          <div className="hero__conteudo">
            <span className="hero__selo">Loja de peças + atendimento com IA</span>
            <h1 id="titulo-hero">
              Monte o PC certo, <span>peça por peça.</span>
            </h1>
            <p className="hero__texto">
              Explore processadores, placas de vídeo, memórias e periféricos.
              Compare preços entre lojas parceiras e tire dúvidas com o Byte,
              o atendente de IA que entende de hardware.
            </p>
            <div className="hero__acoes">
              <a className="botao botao--primario" href="#catalogo">
                Explorar catálogo
              </a>
              <button type="button" className="botao botao--fantasma" onClick={irParaAssistente}>
                Falar com o Byte
              </button>
            </div>
            <dl className="hero__metricas">
              <div>
                <dt>Peças</dt>
                <dd>{produtos.length > 0 ? produtos.length : "17"}</dd>
              </div>
              <div>
                <dt>Lojas comparadas</dt>
                <dd>5</dd>
              </div>
              <div>
                <dt>Atendimento</dt>
                <dd>24/7</dd>
              </div>
            </dl>
          </div>
          <div className="hero__visual">
            <IlustracaoSetup />
          </div>
        </section>

        <section id="sobre" className="diferenciais entrar" aria-label="Diferenciais da BytePeças">
          {DIFERENCIAIS.map((item) => (
            <article className="diferencial" key={item.titulo}>
              <span className="diferencial__icone">
                <IconeDiferencial tipo={item.icone} />
              </span>
              <h2>{item.titulo}</h2>
              <p>{item.texto}</p>
            </article>
          ))}
        </section>

        <Catalogo
          produtos={produtos}
          carregando={carregandoProdutos}
          erro={erroProdutos}
          aoRecarregar={() => void carregarProdutos()}
          aoPerguntar={perguntarSobreProduto}
        />

        <section id="assistente" className="assistente entrar" aria-labelledby="titulo-assistente">
          <div className="assistente__lado">
            <div className="assistente__mascote">
              <Mascote estado={estadoMascote} />
            </div>
            <span className="secao__olho">Atendimento</span>
            <h2 id="titulo-assistente">Não sabe se as peças combinam?</h2>
            <p className="assistente__texto">
              Converse com o Byte. Ele usa o catálogo, uma base de conhecimento de
              hardware e pode até consultar a web para montar a melhor configuração.
            </p>
            <ul className="assistente__lista">
              <li>Compatibilidade entre CPU, placa-mãe e memória</li>
              <li>Montagem de PC por orçamento</li>
              <li>Preços e comparação entre lojas</li>
            </ul>
            <p className="assistente__legenda" key={estadoMascote}>
              {LEGENDA[estadoMascote]}
            </p>
          </div>

          <div className="assistente__painel">
            <div className="painel__topo">
              <div>
                <strong>Byte</strong>
                <span>Atendente de IA</span>
              </div>
              <div className={`status status--${status}`} title={detalheStatus}>
                <span className="ponto" aria-hidden="true" />
                {ROTULO_STATUS[status]}
              </div>
            </div>

            <div className="chat" aria-live="polite" aria-label="Conversa com o atendente Byte">
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
            </div>

            <Sugestoes sugestoes={SUGESTOES} aoEscolher={enviar} desabilitado={carregando} />

            <form className="entrada" onSubmit={aoSubmeter}>
              <label className="sr-only" htmlFor="pergunta">
                Sua pergunta
              </label>
              <input
                id="pergunta"
                ref={campoPergunta}
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
          </div>
        </section>
      </main>

      <footer className="rodape entrar">
        <strong>BytePeças</strong> · projeto acadêmico · peças, preços e lojas fictícios ·
        respostas geradas por IA (Google Gemini)
      </footer>
    </div>
  );
}