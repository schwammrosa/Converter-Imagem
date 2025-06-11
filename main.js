const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Mantenha uma referência global do objeto da janela, se você não fizer isso, a janela será
// fechada automaticamente quando o objeto JavaScript for coletado pelo garbage collector.
let mainWindow;

function createWindow() {
  // Criar a janela do navegador.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true, // Habilita a integração Node.js
      contextIsolation: false, // Desativa isolamento de contexto para permitir uso do Node.js
      enableRemoteModule: true, // Permite uso do módulo remote
      preload: path.join(__dirname, 'preload.js') // Carrega script de preload
    },
    icon: path.join(__dirname, 'assets/icon.ico')
  });

  // Carregar o index.html do aplicativo.
  mainWindow.loadFile('index.html');

  // Remova o menu da janela para uma aparência mais limpa
  // mainWindow.setMenu(null);

  // Abra o DevTools apenas durante o desenvolvimento
  // mainWindow.webContents.openDevTools();

  // Emitido quando a janela é fechada.
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Este método será chamado quando o Electron terminar a inicialização
// e estiver pronto para criar janelas do navegador.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // No macOS é comum recriar uma janela no aplicativo quando o
    // ícone do dock é clicado e não há outras janelas abertas.
    if (mainWindow === null) createWindow();
  });
});

// Sair quando todas as janelas estiverem fechadas, exceto no macOS.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Função para criar um diretório temporário seguro
function getTempDir() {
  const tempDir = path.join(app.getPath('temp'), 'image-converter-temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
}

// Função para processar a imagem
async function processImage(filePath, quality, maintainAspectRatio, centerCrop, outputFormat = 'avif') {
  try {
    // Obter o diretório final para salvar o arquivo
    const targetDirectory = path.dirname(filePath);
    // Nome do arquivo final
    const finalOutputPath = path.join(targetDirectory, `convertida.${outputFormat}`);
    
    // Usar diretório temporário para processamento
    const tempDir = getTempDir();
    const tempOutputPath = path.join(tempDir, `temp_${Date.now()}.${outputFormat}`);
    
    console.log(`Processando em diretório temporário: ${tempDir}`);
    console.log(`Caminho temporário: ${tempOutputPath}`);
    console.log(`Destino final: ${finalOutputPath}`);


    // Carregar a imagem
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Defina as dimensões finais desejadas
    const targetWidth = 700;
    const targetHeight = 400;

    let processedImage;

    if (maintainAspectRatio && centerCrop) {
      // Abordagem simplificada que garante que funcione em todos os casos
      // Primeiro, redimensionamos a imagem para cobrir a área de destino preservando a proporção
      const aspectRatio = metadata.width / metadata.height;
      const targetRatio = targetWidth / targetHeight;

      if (aspectRatio > targetRatio) {
        // Imagem mais larga - ajustar altura
        processedImage = image.resize({
          width: Math.round(targetHeight * aspectRatio),
          height: targetHeight,
          fit: sharp.fit.cover
        });
      } else {
        // Imagem mais alta - ajustar largura
        processedImage = image.resize({
          width: targetWidth, 
          height: Math.round(targetWidth / aspectRatio),
          fit: sharp.fit.cover
        });
      }

      // Usar o método crop para centralizar automaticamente
      processedImage = processedImage.resize({
        width: targetWidth,
        height: targetHeight,
        fit: sharp.fit.cover,
        position: sharp.strategy.centre
      });
    } else {
      // Sem manter proporção ou sem recorte centralizado
      processedImage = image.resize({
        width: targetWidth,
        height: targetHeight,
        fit: maintainAspectRatio ? sharp.fit.contain : sharp.fit.fill,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      });
    }

    // Converter para o formato escolhido com a qualidade especificada
    try {
      const quality_int = parseInt(quality, 10);
      
      if (outputFormat === 'webp') {
        console.log(`Salvando WebP em temporário: ${tempOutputPath} com qualidade: ${quality_int}`);
        await processedImage
          .webp({
            quality: quality_int,
            effort: 4, // Reduzindo o esforço para evitar possíveis problemas
            alphaQuality: 80
          })
          .toFile(tempOutputPath);
      } else {
        console.log(`Salvando AVIF em temporário: ${tempOutputPath} com qualidade: ${quality_int}`);
        await processedImage
          .avif({
            quality: quality_int,
            effort: 9 // Esforço máximo de compressão
          })
          .toFile(tempOutputPath);
      }
      
      // Verificar se o arquivo foi criado no diretório temporário
      if (!fs.existsSync(tempOutputPath)) {
        throw new Error(`Arquivo temporário não foi criado: ${tempOutputPath}`);
      }
      
      // Copiar o arquivo do diretório temporário para o destino final
      try {
        // Verificar se o diretório de destino tem permissão de escrita
        fs.accessSync(targetDirectory, fs.constants.W_OK);
        
        // Copiar o arquivo para o destino final
        fs.copyFileSync(tempOutputPath, finalOutputPath);
        console.log(`Arquivo copiado com sucesso para: ${finalOutputPath}`);
        
        // Remover o arquivo temporário
        fs.unlinkSync(tempOutputPath);
        console.log(`Arquivo temporário removido: ${tempOutputPath}`);
      } catch (copyError) {
        console.error(`Erro ao copiar arquivo para destino final: ${copyError.message}`);
        throw new Error(`Não foi possível salvar a imagem no destino final: ${copyError.message}`);
      }
    } catch (error) {
      console.error(`Falha ao processar imagem em formato ${outputFormat}:`, error);
      throw new Error(`Não foi possível processar a imagem em ${outputFormat}: ${error.message}`);
    }

    // Obter tamanhos dos arquivos
    const originalSize = fs.statSync(filePath).size;
    const convertedSize = fs.statSync(finalOutputPath).size;

    return {
      outputPath: finalOutputPath,
      originalSize,
      convertedSize,
      outputFormat,
      reductionPercentage: Math.round((1 - (convertedSize / originalSize)) * 100)
    };
  } catch (error) {
    console.error('Erro no processamento da imagem:', error);
    throw error;
  }
}

// Configurar IPC (Inter-Process Communication) para comunicação com o renderer
ipcMain.handle('select-file', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Imagens', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp', 'avif'] }
      ]
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const stats = fs.statSync(filePath);
      let imageInfo = null;
      
      try {
        // Tentar obter informações da imagem
        const image = sharp(filePath);
        const metadata = await image.metadata();
        
        imageInfo = {
          path: filePath,
          name: path.basename(filePath),
          size: stats.size,
          width: metadata.width,
          height: metadata.height,
          type: 'image/' + metadata.format
        };
      } catch (err) {
        console.error('Erro ao processar imagem com sharp:', err);
        // Retornar informações básicas se não conseguir processar com sharp
        imageInfo = {
          path: filePath,
          name: path.basename(filePath),
          size: stats.size,
          width: 0,
          height: 0,
          type: 'image/' + path.extname(filePath).substring(1)
        };
      }
      
      return imageInfo;
    }
    return null;
  } catch (error) {
    console.error('Erro ao selecionar arquivo:', error);
    throw error;
  }
});

ipcMain.handle('convert-image', async (event, filePath, quality, maintainAspectRatio, centerCrop, outputFormat) => {
  try {
    console.log(`Convertendo imagem para ${outputFormat}...`);
    return await processImage(filePath, quality, maintainAspectRatio, centerCrop, outputFormat);
  } catch (error) {
    console.error('Erro ao converter imagem:', error);
    throw error;
  }
});

ipcMain.handle('open-folder', (event, folderPath) => {
  try {
    shell.showItemInFolder(folderPath);
    return true;
  } catch (error) {
    console.error('Erro ao abrir pasta:', error);
    return false;
  }
});
