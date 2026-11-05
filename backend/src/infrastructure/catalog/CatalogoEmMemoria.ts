import type { Produto } from "../../domain/entities/Produto.js";
import type { CatalogoProdutos } from "../../domain/ports/CatalogoProdutos.js";

/**
 * Catálogo estático (em memória) da loja fictícia BytePeças.
 * Fica na camada de infraestrutura: é um detalhe de dados, não uma regra
 * de negócio. Trocar por um banco real não afeta os casos de uso.
 */
export const PRODUTOS_PADRAO: readonly Produto[] = [
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
  {
    id: "ram-ddr5-32gb",
    nome: "Memória Kingston Fury DDR5 32GB (2x16GB) 6000MHz",
    categoria: "Memórias",
    preco: 899.9,
    descricao: "Kit dual-channel com perfil EXPO/XMP para alto desempenho.",
    estoque: 20,
  },
  {
    id: "ssd-nvme-1tb",
    nome: "SSD NVMe Kingston NV3 1TB",
    categoria: "Armazenamento",
    preco: 449.9,
    descricao: "Leitura de até 6000MB/s, PCIe 4.0.",
    estoque: 30,
  },
  {
    id: "mb-b650",
    nome: "Placa-mãe ASUS TUF Gaming B650-Plus",
    categoria: "Placas-mãe",
    preco: 1399.0,
    descricao: "Socket AM5, DDR5, PCIe 4.0, VRM robusto.",
    estoque: 9,
  },
  {
    id: "psu-750w",
    nome: "Fonte Corsair RM750e 750W 80 Plus Gold",
    categoria: "Fontes",
    preco: 649.9,
    descricao: "Full modular, certificação Gold, garantia de 7 anos.",
    estoque: 15,
  },
  {
    id: "cooler-aio-240",
    nome: "Water Cooler DeepCool LE520 240mm",
    categoria: "Refrigeração",
    preco: 399.9,
    descricao: "Radiador de 240mm com iluminação ARGB.",
    estoque: 11,
  },
  {
    id: "gabinete-atx",
    nome: "Gabinete NZXT H5 Flow ATX",
    categoria: "Gabinetes",
    preco: 549.0,
    descricao: "Fluxo de ar otimizado e lateral em vidro temperado.",
    estoque: 6,
  },
];

export class CatalogoEmMemoria implements CatalogoProdutos {
  constructor(private readonly produtos: readonly Produto[] = PRODUTOS_PADRAO) {}

  listar(): readonly Produto[] {
    return this.produtos;
  }
}
