import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  ImagemProduto,
  chaveCategoria,
} from "../src/components/ImagemProduto.js";

describe("Ilustrações de peças", () => {
  it("escolhe a ilustração certa a partir da categoria e do nome", () => {
    expect(chaveCategoria("Processadores", "Ryzen 7")).toBe("cpu");
    expect(chaveCategoria("Placas de vídeo", "RTX 4070 Super")).toBe("gpu");
    expect(chaveCategoria("Memórias", "DDR5 32GB")).toBe("memoria");
    expect(chaveCategoria("Armazenamento", "SSD NVMe 1TB")).toBe("armazenamento");
    expect(chaveCategoria("Monitores", 'Monitor 27"')).toBe("monitor");
    expect(chaveCategoria("Periféricos", "Teclado mecânico")).toBe("periferico");
    expect(chaveCategoria("Notebooks", "Acer Nitro")).toBe("notebook");
    expect(chaveCategoria("Placas-mãe", "ASUS TUF B650")).toBe("placa");
    expect(chaveCategoria("Fontes", "Corsair 750W")).toBe("fonte");
    expect(chaveCategoria("Refrigeração", "Water cooler 240mm")).toBe("cooler");
    expect(chaveCategoria("Gabinetes", "NZXT H5 Flow")).toBe("gabinete");
    expect(chaveCategoria("Redes", "Roteador Wi-Fi 6")).toBe("rede");
    expect(chaveCategoria("Categoria estranha", "Peça qualquer")).toBe("generico");
  });

  it("renderiza a variante grande usada na vitrine", () => {
    const html = renderToStaticMarkup(
      <ImagemProduto categoria="Placas de vídeo" nome="RTX 4070" variante="vitrine" />,
    );

    expect(html).toContain("produto__imagem--gpu");
    expect(html).toContain("produto__imagem--vitrine");
    expect(html).toContain("<svg");
  });
});