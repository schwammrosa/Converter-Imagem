const { ipcRenderer } = require('electron');

// Define APIs exposta para o processo de renderização
process.once('loaded', () => {
  // Expõe funções seguras para o processo de renderização acessar
  window.electronAPI = {
    // Função para selecionar arquivo
    selectFile: async () => {
      try {
        const result = await ipcRenderer.invoke('select-file');
        console.log('Resultado da seleção de arquivo:', result);
        return result;
      } catch (error) {
        console.error('Erro ao selecionar arquivo:', error);
        throw error;
      }
    },
    
    // Função para obter informações do arquivo
    getFileInfo: async (filePath) => {
      try {
        const result = await ipcRenderer.invoke('get-file-info', filePath);
        console.log('Informações do arquivo obtidas:', result);
        return result;
      } catch (error) {
        console.error('Erro ao obter informações do arquivo:', error);
        throw error;
      }
    },
    
    // Função para obter o caminho do arquivo
    getFilePath: (file) => {
      return file && file.path ? file.path : null;
    },
    
    // Função para converter imagem
    convertImage: async (filePath, quality, maintainAspectRatio, centerCrop, outputFormat) => {
      try {
        console.log('Convertendo imagem com parâmetros:', {
          filePath, quality, maintainAspectRatio, centerCrop, outputFormat
        });
        const result = await ipcRenderer.invoke('convert-image', filePath, quality, maintainAspectRatio, centerCrop, outputFormat);
        console.log('Resultado da conversão:', result);
        return result;
      } catch (error) {
        console.error('Erro ao converter imagem:', error);
        throw error;
      }
    },
    
    // Função para abrir pasta
    openFolder: (folderPath) => {
      console.log('Abrindo pasta:', folderPath);
      return ipcRenderer.invoke('open-folder', folderPath);
    }
  };
});
