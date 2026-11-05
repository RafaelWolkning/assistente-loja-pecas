import type { Mensagem } from "../api/client.js";

interface Props {
  mensagem: Mensagem;
}

export function BolhaMensagem({ mensagem }: Props) {
  const ehCliente = mensagem.papel === "cliente";

  return (
    <div className={`bolha ${ehCliente ? "bolha--cliente" : "bolha--atendente"}`}>
      <span className="bolha__autor">{ehCliente ? "Você" : "Byte"}</span>
      <p className="bolha__texto">{mensagem.conteudo}</p>
    </div>
  );
}
