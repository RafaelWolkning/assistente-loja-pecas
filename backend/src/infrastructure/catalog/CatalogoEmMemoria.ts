import type { Produto } from "../../domain/entities/Produto.js";
import type { CatalogoProdutos } from "../../domain/ports/CatalogoProdutos.js";

/**
 * Catálogo estático (em memória) da loja fictícia BytePeças.
 * Fica na camada de infraestrutura: é um detalhe de dados, não uma regra de
 * negócio. Trocar por um banco real não afeta os casos de uso.
 */
export const PRODUTOS_PADRAO: readonly Produto[] = [
  // Processadores
  {
    id: "cpu-ryzen-7-7800x3d",
    nome: "Processador AMD Ryzen 7 7800X3D",
    categoria: "Processadores",
    preco: 2499.9,
    descricao: "8 núcleos, 16 threads, cache 3D, excelente para jogos.",
    estoque: 12,
  },
  {
    id: "cpu-i5-14600k",
    nome: "Processador Intel Core i5-14600K",
    categoria: "Processadores",
    preco: 1799.0,
    descricao: "14 núcleos, ótimo custo-benefício para jogos e produtividade.",
    estoque: 8,
  },
  // Placas de vídeo
  {
    id: "gpu-rtx-4070-super",
    nome: "Placa de vídeo NVIDIA RTX 4070 Super 12GB",
    categoria: "Placas de vídeo",
    preco: 4299.0,
    descricao: "Ray tracing e DLSS 3 para jogos em 1440p com alta taxa de quadros.",
    estoque: 5,
  },
  {
    id: "gpu-rx-7800-xt",
    nome: "Placa de vídeo AMD Radeon RX 7800 XT 16GB",
    categoria: "Placas de vídeo",
    preco: 3699.0,
    descricao: "16GB de VRAM, forte em 1440p e ideal para texturas pesadas.",
    estoque: 7,
  },
  // Memórias
  {
    id: "ram-ddr5-32gb",
    nome: "Memória Kingston Fury DDR5 32GB (2x16GB) 6000MHz",
    categoria: "Memórias",
    preco: 899.9,
    descricao: "Kit dual-channel com perfil EXPO/XMP para alto desempenho.",
    estoque: 20,
  },
  // Armazenamento
  {
    id: "ssd-nvme-1tb",
    nome: "SSD NVMe Kingston NV3 1TB",
    categoria: "Armazenamento",
    preco: 449.9,
    descricao: "Leitura de até 6000MB/s, PCIe 4.0.",
    estoque: 30,
  },
  // Placas-mãe
  {
    id: "mb-b650",
    nome: "Placa-mãe ASUS TUF Gaming B650-Plus",
    categoria: "Placas-mãe",
    preco: 1399.0,
    descricao: "Socket AM5, DDR5, PCIe 4.0, VRM robusto.",
    estoque: 9,
  },
  // Fontes
  {
    id: "psu-750w",
    nome: "Fonte Corsair RM750e 750W 80 Plus Gold",
    categoria: "Fontes",
    preco: 649.9,
    descricao: "Full modular, certificação Gold, garantia de 7 anos.",
    estoque: 15,
  },
  // Refrigeração
  {
    id: "cooler-aio-240",
    nome: "Water Cooler DeepCool LE520 240mm",
    categoria: "Refrigeração",
    preco: 399.9,
    descricao: "Radiador de 240mm com iluminação ARGB.",
    estoque: 11,
  },
  // Gabinetes
  {
    id: "gabinete-atx",
    nome: "Gabinete NZXT H5 Flow ATX",
    categoria: "Gabinetes",
    preco: 549.0,
    descricao: "Fluxo de ar otimizado e lateral em vidro temperado.",
    estoque: 6,
  },
  // Monitores
  {
    id: "monitor-lg-ultrawide-29",
    nome: 'Monitor Gamer LG UltraWide 29" 29WP500 Full HD IPS',
    categoria: "Monitores",
    preco: 1149.0,
    descricao: "Ultrawide 21:9, painel IPS, 75Hz, ideal para multitarefa.",
    estoque: 10,
  },
  {
    id: "monitor-samsung-odyssey-g5",
    nome: 'Monitor Gamer Samsung Odyssey G5 27" 165Hz QHD',
    categoria: "Monitores",
    preco: 1699.0,
    descricao: "Curvo 1000R, QHD 1440p, 165Hz, FreeSync Premium.",
    estoque: 4,
  },
  // Periféricos
  {
    id: "teclado-redragon-kumara",
    nome: "Teclado Mecânico Gamer Redragon Kumara RGB",
    categoria: "Periféricos",
    preco: 249.9,
    descricao: "Switches mecânicos Outemu, ABNT2, diálogo LED RGB.",
    estoque: 25,
  },
  {
    id: "mouse-logitech-g502",
    nome: "Mouse Gamer Logitech G502 Hero 25K",
    categoria: "Periféricos",
    preco: 329.9,
    descricao: "Sensor HERO 25K, 11 botões programáveis, peso ajustável.",
    estoque: 18,
  },
  {
    id: "headset-hyperx-cloud",
    nome: "Headset Gamer HyperX Cloud Stinger 2",
    categoria: "Periféricos",
    preco: 399.9,
    descricao: "Áudio 7.1 surround e microfone com cancelamento de ruído.",
    estoque: 14,
  },
  // Redes
  {
    id: "roteador-ax3000",
    nome: "Roteador Wi-Fi 6 TP-Link Archer AX3000",
    categoria: "Redes",
    preco: 449.9,
    descricao: "Wi-Fi 6 dual-band, 3000Mbps, 4 antenas e suporte a mesh.",
    estoque: 8,
  },
  // Notebooks
  {
    id: "notebook-acer-nitro-v15",
    nome: "Notebook Gamer Acer Nitro V15 RTX 3050",
    categoria: "Notebooks",
    preco: 4299.0,
    descricao: 'Core i5, 16GB RAM, SSD 512GB, tela 15,6" 144Hz.',
    estoque: 3,
  },
];

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function tokens(texto: string): string[] {
  return normalizar(texto)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
}

export class CatalogoEmMemoria implements CatalogoProdutos {
  constructor(private readonly produtos: readonly Produto[] = PRODUTOS_PADRAO) {}

  listar(): readonly Produto[] {
    return this.produtos;
  }

  /**
   * Busca por correspondência tolerante: conta tokens significativos em comum
   * (nome do produto vs. busca) e retorna o melhor candidato com ao menos 2
   * coincidências. Assim "Monitor LG UltraWide 29" encontra o item do catálogo.
   */
  buscarPorNome(nome: string): Produto | undefined {
    const alvo = tokens(nome);
    if (alvo.length === 0) {
      return undefined;
    }

    let melhor: Produto | undefined;
    let melhorPontuacao = 0;

    for (const produto of this.produtos) {
      const tokensProduto = new Set(tokens(produto.nome));
      const pontuacao = alvo.filter((token) => tokensProduto.has(token)).length;
      if (pontuacao > melhorPontuacao) {
        melhorPontuacao = pontuacao;
        melhor = produto;
      }
    }

    return melhorPontuacao >= 2 ? melhor : undefined;
  }
}
