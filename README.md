# Conversor de Imagens AVIF-WebP

Um aplicativo desktop para converter e redimensionar imagens para os formatos modernos AVIF e WebP com interface gráfica intuitiva.

## Sobre o Projeto

Este conversor de imagens é uma ferramenta simples e eficiente desenvolvida com Electron que permite:

- Converter imagens para os formatos AVIF e WebP
- Redimensionar imagens para 700x400 pixels
- Manter proporção da imagem original (opcional)
- Recortar centralizado para melhor enquadramento (opcional)
- Ajustar qualidade da compressão
- Visualizar redução de tamanho em tempo real

## Requisitos do Sistema

- Windows 10/11 (64 bits)
- 4GB RAM mínimo recomendado
- 100MB de espaço em disco

## Instalação

### Método 1: Instalador

1. Execute o arquivo de instalação `Conversor de Imagens AVIF-WebP Setup.exe`
2. Siga as instruções do assistente de instalação
3. O programa será instalado e estará disponível no menu iniciar

### Método 2: Para Desenvolvedores (Instalação manual)

1. Certifique-se de ter o Node.js instalado (versão 14 ou superior)
2. Clone ou baixe este repositório
3. Abra um terminal na pasta do projeto
4. Execute os comandos:

```
npm install
npm start
```

Para criar o instalador:

```
npm run build
```

## Como Usar

1. Abra o aplicativo
2. Clique no botão "Selecionar Imagem" para escolher uma imagem no seu computador
3. Ajuste as configurações conforme necessário:
   - Formato de saída (AVIF ou WebP)
   - Qualidade da compressão (1-100)
   - Manter proporção original
   - Recorte centralizado
4. Clique no botão "Converter"
5. A imagem será processada e salva no mesmo diretório da imagem original
6. Use o botão "Abrir Pasta" para acessar o local onde a imagem foi salva

## Tecnologias Utilizadas

- Electron: Framework para desenvolvimento de aplicativos desktop
- Sharp: Biblioteca para processamento de imagens
- Node.js: Ambiente de execução JavaScript

## Detalhes Técnicos

- As imagens são redimensionadas para 700x400 pixels
- Processamento realizado em diretório temporário seguro
- Suporta formatos de entrada: JPG, JPEG, PNG, BMP, GIF, WebP, AVIF

## Solução de Problemas

- **Erro ao converter**: Verifique se você tem permissão para salvar arquivos no diretório da imagem original
- **Imagem não aparece**: Verifique se o formato da imagem é suportado
- **Aplicativo não abre**: Certifique-se de que sua versão do Windows é compatível (64 bits)

## Licença

ISC
