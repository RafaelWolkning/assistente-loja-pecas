export interface Saude {
  status: "ok";
  uptimeSegundos: number;
  versao: string;
  modelo: string;
  dataHora: string;
}

export interface DependenciasSaude {
  modelo: string;
  versao: string;
  obterUptime: () => number;
  agora: () => Date;
}

/**
 * Caso de uso: reportar a saúde da aplicação (endpoint GET /saude).
 * O tempo e o relógio são injetados para manter o caso de uso determinístico
 * e testável.
 */
export class ObterSaudeUseCase {
  constructor(private readonly deps: DependenciasSaude) {}

  executar(): Saude {
    return {
      status: "ok",
      uptimeSegundos: Math.round(this.deps.obterUptime()),
      versao: this.deps.versao,
      modelo: this.deps.modelo,
      dataHora: this.deps.agora().toISOString(),
    };
  }
}
