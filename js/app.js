// Elementos DOM
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const imageName = document.getElementById('imageName');
const imageDimensions = document.getElementById('imageDimensions');
const imageSize = document.getElementById('imageSize');
const imageType = document.getElementById('imageType');
const changeImageBtn = document.getElementById('changeImageBtn');
const convertBtn = document.getElementById('convertBtn');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const maintainAspectRatio = document.getElementById('maintainAspectRatio');
const centerCrop = document.getElementById('centerCrop');
const formatAVIF = document.getElementById('formatAVIF');
const formatWEBP = document.getElementById('formatWEBP');
const conversionResult = document.getElementById('conversionResult');
const savedLocation = document.getElementById('savedLocation');
const originalSize = document.getElementById('originalSize');
const avifSize = document.getElementById('avifSize');
const sizeReduction = document.getElementById('sizeReduction');
const openFolderBtn = document.getElementById('openFolderBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

// Variáveis globais
let selectedFile = null;
let originalImagePath = '';
let isSelectingFile = false; // Controle para evitar seleções múltiplas

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando aplicação...');
    // Carregar configurações salvas
    loadSavedSettings();
    
    // Atualizar texto do botão de conversão conforme formato selecionado
    updateConvertButtonText();
    
    // Inicializar eventos de drag & drop
    initDragAndDrop();
    
    // Inicializar eventos de botões
    initButtonEvents();
    
    // Inicializar eventos de slider e checkboxes
    initControlEvents();
});

// Carregar configurações salvas do localStorage
function loadSavedSettings() {
    try {
        // Debug para verificar se o localStorage está disponível
        console.log('Verificando localStorage...', localStorage);
        
        // Recuperar formato de saída (AVIF ou WebP)
        const savedOutputFormat = localStorage.getItem('outputFormat');
        console.log('Formato de saída salvo:', savedOutputFormat);
        if (savedOutputFormat) {
            if (savedOutputFormat === 'webp') {
                formatWEBP.checked = true;
            } else {
                formatAVIF.checked = true;
            }
        } else {
            // Salvar o valor padrão (AVIF)
            localStorage.setItem('outputFormat', 'avif');
        }
        
        // Recuperar qualidade da imagem
        const savedQuality = localStorage.getItem('imageQuality');
        console.log('Qualidade salva:', savedQuality);
        if (savedQuality) {
            qualitySlider.value = savedQuality;
            qualityValue.textContent = savedQuality + '%';
        } else {
            // Garantir que o valor padrão de 50% seja aplicado
            qualitySlider.value = 50;
            qualityValue.textContent = '50%';
            // Salvar o valor padrão no localStorage
            localStorage.setItem('imageQuality', 50);
        }
        
        // Recuperar configuração de proporção
        const savedMaintainAspectRatio = localStorage.getItem('maintainAspectRatio');
        console.log('Manter proporção salvo:', savedMaintainAspectRatio);
        if (savedMaintainAspectRatio !== null) {
            maintainAspectRatio.checked = savedMaintainAspectRatio === 'true';
        } else {
            // Salvar o valor padrão
            localStorage.setItem('maintainAspectRatio', maintainAspectRatio.checked);
        }
        
        // Recuperar configuração de recorte centralizado
        const savedCenterCrop = localStorage.getItem('centerCrop');
        console.log('Recorte centralizado salvo:', savedCenterCrop);
        if (savedCenterCrop !== null) {
            centerCrop.checked = savedCenterCrop === 'true';
        } else {
            // Salvar o valor padrão
            localStorage.setItem('centerCrop', centerCrop.checked);
        }
        
        console.log('Configurações carregadas do localStorage');
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        // Garantir valores padrão em caso de erro
        qualitySlider.value = 50;
        qualityValue.textContent = '50%';
    }
}

// Salvar configurações no localStorage
function saveSettings() {
    try {
        const quality = qualitySlider.value;
        const keepRatio = maintainAspectRatio.checked;
        const crop = centerCrop.checked;
        const outputFormat = formatWEBP.checked ? 'webp' : 'avif';
        
        localStorage.setItem('imageQuality', quality);
        localStorage.setItem('maintainAspectRatio', keepRatio);
        localStorage.setItem('centerCrop', crop);
        localStorage.setItem('outputFormat', outputFormat);
        
        console.log('Configurações salvas:', {
            formato: outputFormat,
            qualidade: quality,
            manterProporcao: keepRatio,
            recorteCentralizado: crop
        });
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        alert('Não foi possível salvar suas configurações. Verifique o console para mais detalhes.');
    }
}

// Inicializar eventos de drag & drop
function initDragAndDrop() {
    // Evento para quando arrastar sobre a área de upload
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('active');
    });
    
    // Evento para quando sair da área de upload
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('active');
    });
    
    // Evento para quando soltar na área de upload
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('active');
        
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });
}

// Inicializar eventos de botões
function initButtonEvents() {
    // Evento para clicar no botão de selecionar arquivo
    selectFileBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Impede a propagação do evento
        selecionarArquivo();
    });
    
    // Evento para quando um arquivo for selecionado (usado apenas no ambiente web)
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
    
    // Evento para clicar na própria área de upload (apenas quando visível)
    uploadArea.addEventListener('click', (e) => {
        // Verifica se uploadArea está visível antes de permitir a seleção
        if (uploadArea.style.display !== 'none' && !isSelectingFile) {
            e.stopPropagation(); // Impede a propagação do evento
            selecionarArquivo();
        }
    });
    
    // Evento para botão de trocar imagem
    changeImageBtn.addEventListener('click', () => {
        resetUI();
    });
    
    // Evento para botão de converter
    convertBtn.addEventListener('click', () => {
        convertImage();
    });
    
    // Evento para botão de abrir pasta
    openFolderBtn.addEventListener('click', () => {
        openSavedLocation();
    });
}

// Função para selecionar arquivo separada para evitar duplicação
function selecionarArquivo() {
    // Evitar chamadas múltiplas simultâneas
    if (isSelectingFile) {
        console.log('Já existe um processo de seleção em andamento');
        return;
    }
    
    isSelectingFile = true;
    
    if (window.electronAPI) {
        // Mostrar overlay de carregamento enquanto seleciona
        loadingOverlay.style.display = 'flex';
        
        // Usar a API Electron para selecionar arquivo
        // Agora retorna diretamente o objeto com informações da imagem
        window.electronAPI.selectFile().then(fileInfo => {
            loadingOverlay.style.display = 'none';
            isSelectingFile = false;
            
            if (fileInfo) {
                console.log('Arquivo selecionado:', fileInfo);
                handleFileSelect(fileInfo);
            }
        }).catch(err => {
            loadingOverlay.style.display = 'none';
            isSelectingFile = false;
            console.error('Erro ao selecionar arquivo:', err);
            alert('Erro ao carregar a imagem. Tente novamente.');
        });
    } else {
        // Fallback para ambiente web
        fileInput.click();
        isSelectingFile = false;
    }
}

// Inicializar eventos do slider de qualidade e checkboxes
function initControlEvents() {
    // Evento para o slider de qualidade
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = qualitySlider.value + '%';
    });
    
    // Salvar configurações quando o valor do slider é alterado
    qualitySlider.addEventListener('change', () => {
        console.log('Slider alterado para:', qualitySlider.value);
        saveSettings();
    });
    
    // Salvar configurações quando as opções de checkbox são alteradas
    maintainAspectRatio.addEventListener('change', () => {
        console.log('Manter proporção alterado para:', maintainAspectRatio.checked);
        saveSettings();
    });
    
    centerCrop.addEventListener('change', () => {
        console.log('Recorte centralizado alterado para:', centerCrop.checked);
        saveSettings();
    });
    
    // Adicionar eventos para os botões de rádio de formato
    formatAVIF.addEventListener('change', () => {
        if (formatAVIF.checked) {
            console.log('Formato alterado para: AVIF');
            convertBtn.textContent = 'Converter para AVIF';
            saveSettings();
        }
    });
    
    formatWEBP.addEventListener('change', () => {
        if (formatWEBP.checked) {
            console.log('Formato alterado para: WebP');
            convertBtn.textContent = 'Converter para WebP';
            saveSettings();
        }
    });
    
    // Botão de conversão também salva configurações antes de converter
    convertBtn.addEventListener('click', () => {
        saveSettings();
        convertImage();
    });
}

// Função para lidar com a seleção de arquivos
function handleFileSelect(file) {
    // Verificar se é uma imagem
    if (!file.type || !file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem válido.');
        return;
    }
    
    selectedFile = file;
    originalImagePath = file.path || '';
    
    // Exibir as informações da imagem
    displayImageInfo(file);
    
    // Criar preview
    createImagePreview(file);
    
    // Mostrar container de preview
    previewContainer.style.display = 'block';
    
    // Esconder área de upload
    uploadArea.style.display = 'none';
}

// Função para exibir informações da imagem
function displayImageInfo(file) {
    // Nome do arquivo
    imageName.textContent = file.name;
    
    // Tamanho do arquivo
    imageSize.textContent = formatFileSize(file.size);
    
    // Tipo de arquivo
    imageType.textContent = file.type;
    
    // Dimensões da imagem (se disponível)
    if (file.width && file.height) {
        imageDimensions.textContent = `${file.width} x ${file.height} pixels`;
    } else {
        // Obter dimensões da imagem se não estiverem disponíveis
        const img = new Image();
        img.onload = () => {
            imageDimensions.textContent = `${img.width} x ${img.height} pixels`;
            URL.revokeObjectURL(img.src);
        };
        img.src = file.path ? `file://${file.path}` : URL.createObjectURL(file);
    }
}

// Função para criar preview da imagem
function createImagePreview(file) {
    if (file.path) {
        // Para Electron, usar caminho de arquivo diretamente
        previewImage.src = `file://${file.path}`;
    } else {
        // Para ambiente web, usar URL.createObjectURL
        const imageUrl = URL.createObjectURL(file);
        previewImage.src = imageUrl;
        previewImage.onload = () => {
            // Depois que a imagem carregar, remover o URL de objeto para liberar memória
            URL.revokeObjectURL(imageUrl);
        };
    }
}

// Função para converter a imagem
function convertImage() {
    if (!selectedFile || !originalImagePath) {
        alert('Nenhuma imagem selecionada para conversão.');
        return;
    }
    
    // Mostrar overlay de carregamento
    loadingOverlay.style.display = 'flex';
    
    // Obter a qualidade e o formato da conversão
    const quality = parseInt(qualitySlider.value, 10);
    const maintainRatio = maintainAspectRatio.checked;
    const cropCenter = centerCrop.checked;
    const outputFormat = formatWEBP.checked ? 'webp' : 'avif';
    
    console.log('Iniciando conversão com parâmetros:', {
        path: originalImagePath,
        quality: quality,
        maintainRatio: maintainRatio,
        cropCenter: cropCenter,
        formato: outputFormat
    });
    
    if (window.electronAPI) {
        // Usar API Electron para converter no processo principal
        window.electronAPI.convertImage(originalImagePath, quality, maintainRatio, cropCenter, outputFormat)
            .then(result => {
                console.log('Resultado da conversão:', result);
                // Esconder overlay de carregamento
                loadingOverlay.style.display = 'none';
                
                // Exibir resultado da conversão
                showConversionResult(result);
                
                // Mostrar preview da imagem convertida
                if (result && result.outputPath) {
                    const timestamp = new Date().getTime();
                    previewImage.src = `file://${result.outputPath}?t=${timestamp}`;
                }
            })
            .catch(error => {
                loadingOverlay.style.display = 'none';
                console.error('Erro na conversão:', error);
                alert('Erro ao converter imagem. Verifique o console para mais detalhes.');
            });
    } else {
        // Simulação para ambiente web
        setTimeout(() => {
            processImageForConversion()
                .then(result => {
                    // Esconder overlay de carregamento
                    loadingOverlay.style.display = 'none';
                    
                    // Exibir resultado da conversão
                    showConversionResult(result);
                })
                .catch(error => {
                    loadingOverlay.style.display = 'none';
                    alert('Erro ao converter imagem: ' + error.message);
                });
        }, 1500);
    }
}

// Função para processar a imagem para conversão
// Na aplicação final, essa função seria implementada usando módulos Node.js no Electron
function processImageForConversion() {
    return new Promise((resolve, reject) => {
        try {
            // Simulação de processar a imagem
            // Em produção, aqui usaríamos sharp ou outra biblioteca para:
            // 1. Redimensionar proporcionalmente para caber em 700x400
            // 2. Recortar centralizando para obter exatamente 700x400
            // 3. Converter para formato AVIF
            
            // Simular resultado da conversão
            const outputPath = originalImagePath.replace(/\.[^.]+$/, '-convertida.avif');
            const originalSizeBytes = selectedFile.size;
            // Usar a qualidade definida pelo usuário - se 100%, não reduzir o tamanho na simulação
            const qualityPercent = parseInt(qualitySlider.value, 10) / 100;
            const compressionFactor = qualityPercent > 0.9 ? 0.9 : qualityPercent * 0.8;
            const avifSizeBytes = Math.round(originalSizeBytes * compressionFactor);
            
            resolve({
                outputPath: outputPath,
                originalSize: originalSizeBytes,
                avifSize: avifSizeBytes,
                reductionPercentage: Math.round((1 - (avifSizeBytes / originalSizeBytes)) * 100)
            });
        } catch (error) {
            reject(error);
        }
    });
}

// Função para exibir o resultado da conversão
function showConversionResult(result) {
    savedLocation.textContent = result.outputPath;
    originalSize.textContent = formatFileSize(result.originalSize);
    avifSize.textContent = formatFileSize(result.convertedSize); // Usando o nome genérico
    sizeReduction.textContent = result.reductionPercentage;
    
    // Atualizar o formato exibido
    const formatoSaida = document.querySelector('#formato-saida');
    if (formatoSaida) {
        formatoSaida.textContent = result.outputFormat ? result.outputFormat.toUpperCase() : 'AVIF';
    }
    
    // Atualizar labels da interface
    const convertedSizeLabel = document.querySelector('#converted-size-label');
    if (convertedSizeLabel) {
        convertedSizeLabel.textContent = `Tamanho ${result.outputFormat ? result.outputFormat.toUpperCase() : 'AVIF'}:`;
    }
    
    // Atualizar metadados da imagem na interface para mostrar informações da imagem convertida
    updateImageInfoAfterConversion(result);
    
    conversionResult.style.display = 'block';
}

// Função para atualizar as informações da imagem após a conversão
function updateImageInfoAfterConversion(result) {
    // Atualizar nome do arquivo
    const fileName = result.outputPath.split(/[\\/]/).pop();
    imageName.textContent = fileName;
    
    // Atualizar tamanho
    imageSize.textContent = formatFileSize(result.convertedSize);
    
    // Atualizar tipo
    const formato = result.outputFormat || 'avif';
    imageType.textContent = `image/${formato}`;
    
    // Atualizar dimensões (sempre 700x400 conforme especificação)
    imageDimensions.textContent = '700 x 400 pixels';
    
    // Atualizar caminho da imagem atual e referencia para processamento futuro
    originalImagePath = result.outputPath;
    
    // Atualizar objeto do arquivo selecionado para refletir a nova imagem
    if (selectedFile) {
        selectedFile = {
            ...selectedFile,
            name: fileName,
            path: result.outputPath,
            size: result.avifSize,
            type: 'image/avif',
            width: 700,
            height: 400
        };
    }
}

// Função para abrir o local de salvamento
function openSavedLocation() {
    const outputPath = savedLocation.textContent;
    if (outputPath) {
        if (window.electronAPI) {
            // Usar a API Electron para abrir o explorer no arquivo
            window.electronAPI.openFolder(outputPath);
        } else {
            // Fallback para ambiente web
            alert('Em ambiente Electron, aqui abriria o local: ' + outputPath);
        }
    }
}

// Função para resetar a UI para o estado inicial
function resetUI() {
    // Limpar estado
    selectedFile = null;
    originalImagePath = '';
    isSelectingFile = false;
    
    // Esconder container de preview
    previewContainer.style.display = 'none';
    
    // Mostrar área de upload novamente com estilo correto centralizado
    uploadArea.style.display = 'block';
    // Resetar qualquer classe que possa afetar o estilo
    uploadArea.className = 'upload-area';
    
    // Esconder resultados da conversão
    conversionResult.style.display = 'none';
    
    // Recarregar as configurações salvas para manter a persistência
    loadSavedSettings();
    console.log('Configurações recarregadas após resetar UI');
}

// Função para atualizar o texto do botão de conversão conforme o formato selecionado
function updateConvertButtonText() {
    if (formatWEBP && formatWEBP.checked) {
        convertBtn.textContent = 'Converter para WebP';
    } else {
        convertBtn.textContent = 'Converter para AVIF';
    }
}

// Função para formatar o tamanho do arquivo para string
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}
