# Conversor de Imagens para AVIF

## Etapas de Desenvolvimento

### 1. Estrutura da Interface
- Interface moderna e responsiva
- Área de drag-and-drop para seleção de arquivos
- Botão para seleção manual de arquivos
- Área de preview da imagem
- Exibição de informações da imagem
- Painel de configurações de conversão

### 2. Processo de Conversão
- Carregamento da imagem original
- Exibição de preview e informações
- Redimensionamento proporcional para se ajustar a 700x400
- Recorte centralizado para dimensões exatas de 700x400
- Conversão para formato AVIF
- Salvamento no mesmo diretório da imagem original

### 3. Tecnologias Utilizadas
- HTML5 para estrutura
- CSS3 para estilização
- JavaScript para lógica de processamento
- Bibliotecas:
  - Sharp ou canvas para manipulação de imagens
  - Avif.js para conversão para formato AVIF

### 4. Empacotamento do Aplicativo
- Utilização de Electron para criar aplicação desktop
- Empacotamento em arquivo .exe para distribuição
- Configuração de ícones e metadados

### 5. Fluxo de Usuário
1. Usuário seleciona imagem (arrastar/soltar ou botão)
2. Aplicativo exibe preview e informações da imagem
3. Usuário confirma a conversão
4. Aplicativo processa a imagem (redimensiona, recorta e converte)
5. Arquivo AVIF é salvo no mesmo local da imagem original
6. Notificação de sucesso é exibida ao usuário
