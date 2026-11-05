interface Props {
  sugestoes: readonly string[];
  aoEscolher: (texto: string) => void;
  desabilitado: boolean;
}

export function Sugestoes({ sugestoes, aoEscolher, desabilitado }: Props) {
  return (
    <div className="sugestoes" aria-label="Perguntas sugeridas">
      {sugestoes.map((sugestao) => (
        <button
          key={sugestao}
          type="button"
          className="chip"
          onClick={() => aoEscolher(sugestao)}
          disabled={desabilitado}
        >
          {sugestao}
        </button>
      ))}
    </div>
  );
}
