/**
 * Base de conhecimento (RAG) sobre hardware de computadores.
 * Conteúdo curado e fictício/educacional, usado para fundamentar as respostas
 * técnicas do atendente. Cada documento vira um "trecho" recuperável.
 */
export interface DocumentoConhecimento {
  id: string;
  titulo: string;
  conteudo: string;
}

export const DOCUMENTOS_CONHECIMENTO: readonly DocumentoConhecimento[] = [
  {
    id: "guia-montagem",
    titulo: "Guia geral para montar um PC",
    conteudo:
      "Para montar um PC, comece definindo o uso (jogos, trabalho, edição) e o orçamento. A ordem típica de escolha é: processador (CPU), placa-mãe compatível com o socket, memória RAM, armazenamento (SSD), placa de vídeo (GPU), fonte (PSU) com folga de potência, gabinete com bom fluxo de ar e, por fim, refrigeração. Equilibre os componentes para evitar gargalos (bottleneck): uma GPU muito forte com uma CPU fraca desperdiça desempenho. Verifique sempre a compatibilidade de socket, tipo de memória e dimensões físicas.",
  },
  {
    id: "compat-cpu-placamae",
    titulo: "Compatibilidade entre processador e placa-mãe",
    conteudo:
      "O processador precisa ser compatível com o socket da placa-mãe. Exemplos atuais: AMD Ryzen usa AM5 (DDR5) ou AM4 (DDR4); Intel Core usa LGA1700 (12ª a 14ª geração, DDR4 ou DDR5). Além do socket, confira o chipset (B650, X670, B760, Z790), que define recursos como overclock e número de conexões. Atualizar a BIOS pode ser necessário para CPUs mais novas em placas antigas. Não é possível montar uma CPU AMD em placa Intel, nem vice-versa.",
  },
  {
    id: "gpu-escolha",
    titulo: "Como escolher uma placa de vídeo (GPU)",
    conteudo:
      "Para jogos: 1080p exige GPUs de entrada/média (ex.: RTX 4060), 1440p pede modelos intermediários (RTX 4070 / RX 7800 XT) e 4K exige topo de linha (RTX 4080/4090). A quantidade de VRAM importa: 8GB para 1080p, 12-16GB para 1440p. Recursos como DLSS (NVIDIA) e FSR (AMD) aumentam a taxa de quadros. Considere o consumo (watts) e o tamanho físico do cooler, que pode não caber no gabinete. Para trabalho com IA/3D, priorize VRAM e suporte a CUDA.",
  },
  {
    id: "fonte-psu",
    titulo: "Como dimensionar a fonte (PSU)",
    conteudo:
      "A fonte deve entregar potência suficiente com folga. Some o consumo da CPU e da GPU e acrescente ~30%. Configurações com GPU intermediária pedem 550-650W; GPUs de topo, 750-850W. Prefira certificação 80 Plus Bronze, Gold ou superior, de marcas confiáveis. Fontes modulares facilitam a organização dos cabos. Nunca economize demais na fonte: uma PSU de má qualidade pode danificar todo o sistema. Verifique os conectores necessários (ex.: PCIe 12VHPWR para GPUs novas).",
  },
  {
    id: "memoria-ram",
    titulo: "Memória RAM: quantidade e tipo",
    conteudo:
      "Para uso geral e jogos, 16GB de RAM são o mínimo recomendado; 32GB atendem jogos pesados, multitarefa e edição. O tipo depende da placa-mãe: DDR4 ou DDR5. Dual-channel (dois pentes) oferece mais desempenho que um único pente. Frequências altas (ex.: 6000MHz em DDR5) ajudam CPUs Ryzen. Ative o perfil EXPO (AMD) ou XMP (Intel) na BIOS para rodar na velocidade nominal. Mais RAM não torna o PC mais rápido se o gargalo for outro componente.",
  },
  {
    id: "armazenamento-ssd",
    titulo: "Armazenamento: SSD NVMe, SATA e HD",
    conteudo:
      "SSD NVMe (PCIe) é muito mais rápido que SSD SATA e infinitamente mais que HD mecânico. Para o sistema operacional e jogos, use SSD NVMe de 1TB ou mais. NVMe PCIe 4.0 atinge ~5000-7000MB/s. O HD ainda pode ser usado para arquivos grandes e backups. Mantenha ~15% do SSD livre para preservar o desempenho. Verifique se a placa-mãe possui slot M.2 disponível e a geração de PCIe suportada.",
  },
  {
    id: "monitores",
    titulo: "Monitores: resolução, taxa de atualização e painéis",
    conteudo:
      "Resolução: Full HD (1080p), QHD (1440p) e 4K (2160p). Taxa de atualização: 60Hz para uso geral; 144Hz ou mais para jogos competitivos (melhora a fluidez). Painéis: IPS (cores e ângulos bons), VA (contraste alto, bom para filmes), TN (resposta rápida, cores piores), OLED (preto perfeito, mais caro). Ultrawide 21:9 aumenta o campo de visão. Recursos úteis: FreeSync/G-Sync (evita tearing), HDR e ajuste de altura. Tempo de resposta baixo (1ms) ajuda em jogos.",
  },
  {
    id: "perifericos",
    titulo: "Periféricos: teclados, mouses e headsets",
    conteudo:
      "Teclados mecânicos usam switches (Outemu, Cherry MX, etc.): lineares (mais suaves, bons para jogos), táteis e clicky (com som). Layout ABNT2 é o padrão brasileiro com 'ç'. Mouses gamers: sensor de alta precisão (DPI), baixa latência e peso ajustável. Headsets: som surround 7.1 e microfone com cancelamento de ruído ajudam em jogos e chamadas. Conexão com ou sem fio (2.4GHz tem menos atraso que Bluetooth). Considere também webcam e mousepad.",
  },
  {
    id: "refrigeracao",
    titulo: "Refrigeração: air cooler vs water cooler",
    conteudo:
      "CPUs modernas esquentam e precisam de refrigeração adequada. Air coolers são baratos, confiáveis e suficientes para a maioria dos casos. Water coolers (AIO) de 240mm ou 360mm oferecem melhor desempenho térmico e visual, especialmente com CPUs de alto consumo. Aplique pasta térmica corretamente e monte o radiador com fluxo de ar coerente. Gabinetes com bom airflow (entrada frontal, saída traseira/topo) reduzem temperaturas de todos os componentes.",
  },
  {
    id: "redes",
    titulo: "Redes: Wi-Fi 5, 6, 6E e 7",
    conteudo:
      "Roteadores Wi-Fi 6 (802.11ax) oferecem mais velocidade e eficiência que Wi-Fi 5, sobretudo com muitos dispositivos. Wi-Fi 6E adiciona a faixa de 6GHz, menos congestionada. Wi-Fi 7 é o mais recente, com maior largura de banda. Para jogos, o cabo Ethernet é sempre mais estável e com menor latência. Recursos úteis: bandas dual/tri-band, suporte a mesh para casas grandes e portas Gigabit. A posição do roteador afeta bastante o sinal.",
  },
  {
    id: "notebooks",
    titulo: "O que avaliar em um notebook",
    conteudo:
      "Em notebooks, observe o processador (ex.: Core i5/i7, Ryzen 5/7), a memória RAM (mínimo 8GB, ideal 16GB), o armazenamento (SSD) e a placa de vídeo (integrada para uso básico; dedicada para jogos e edição). A tela importa: resolução, taxa de atualização e tipo de painel. Notebooks gamers esquentam mais e têm menos autonomia. Verifique a possibilidade de upgrade (RAM e SSD) e a qualidade da refrigeração. Para mobilidade, priorize peso e bateria.",
  },
  {
    id: "custo-beneficio",
    titulo: "Faixas de preço e custo-benefício",
    conteudo:
      "PC de entrada (uso básico/estudos): CPU com vídeo integrado, 16GB RAM, SSD 500GB — dispensa GPU dedicada. PC gamer intermediário (1080p): GPU de entrada/média + CPU de 6 núcleos + 16GB + SSD 1TB. PC gamer avançado (1440p): GPU intermediária e CPU de 8 núcleos + 32GB. Trabalho com IA/3D: priorize VRAM, RAM (32GB+) e SSD rápido. Regra geral: invista mais na GPU para jogos e na CPU/RAM para produtividade. Compre peças compatíveis e evite gargalos.",
  },
  {
    id: "glossario",
    titulo: "Glossário de hardware",
    conteudo:
      "CPU: processador. GPU: placa de vídeo. RAM: memória volátil. SSD/HD: armazenamento. PSU: fonte. Motherboard: placa-mãe. VRAM: memória dedicada da GPU. TDP: consumo térmico. Socket: encaixe da CPU. Chipset: controlador da placa-mãe. DDR4/DDR5: gerações de memória. PCIe: barramento de expansão. NVMe: protocolo de SSD. RGB: iluminação colorida. Bottleneck: gargalo. Overclock: elevar frequência. Airflow: fluxo de ar. BIOS/UEFI: firmware da placa-mãe.",
  },
  {
    id: "compat-gpu-gabinete",
    titulo: "Compatibilidade física: GPU, cooler e gabinete",
    conteudo:
      "Placas de vídeo modernas são longas (30cm+ em modelos topo) e ocupam 2 a 3 slots. Confira o comprimento máximo suportado pelo gabinete e o espaço para o cooler da CPU (altura máxima). Water coolers de 360mm exigem suporte no topo ou na frente do gabinete. Verifique também o número de baias/ventoinhas e o painel frontal (mesh melhora o airflow). Antes de comprar, valide as dimensões das peças entre si para evitar surpresas na montagem.",
  },
  {
    id: "gpu-para-ia",
    titulo: "GPU para inteligência artificial e edição",
    conteudo:
      "Para treinar modelos de IA e renderização 3D, a VRAM é decisiva: 8GB para modelos pequenos, 12-16GB para intermediários e 24GB+ para modelos grandes. GPUs NVIDIA (arquitetura CUDA) têm melhor suporte a frameworks como PyTorch e TensorFlow. Para edição de vídeo, aceleração por hardware (NVENC) agiliza exportações. Equilibre GPU, CPU e RAM: edição pesada pede 32GB+ de RAM e SSD rápido. Para inferência local de LLMs, VRAM e largura de banda da memória importam muito.",
  },
];
