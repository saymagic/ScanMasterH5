const Pages = {
    ...Pages,
    scanner() {
        const template = `
            <div class="max-w-2xl mx-auto">
                <h1 class="text-2xl font-bold mb-6">${i18n.t('scan_qr_code')}</h1>
                
                <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div class="flex space-x-4 mb-6">
                        <button id="start-camera" class="flex-1 bg-blue-500 text-white px-4 py-2 rounded">
                            ${i18n.t('start_camera')}
                        </button>
                        <button id="select-image" class="flex-1 bg-green-500 text-white px-4 py-2 rounded">
                            ${i18n.t('select_image')}
                        </button>
                    </div>
                    
                    <div id="camera-container" class="hidden">
                        <video id="video" class="w-full rounded"></video>
                    </div>
                    
                    <input type="file" id="file-input" class="hidden" accept="image/*">
                </div>
                
                <div id="result-container" class="bg-white rounded-lg shadow-lg p-6 hidden">
                    <h2 class="text-xl font-bold mb-4">${i18n.t('scan_result')}</h2>
                    <div class="bg-gray-50 rounded p-4">
                        <p id="result-text" class="text-gray-800 break-all"></p>
                    </div>
                    <div class="mt-4 flex space-x-4">
                        <button id="copy-result" class="bg-blue-500 text-white px-4 py-2 rounded">
                            ${i18n.t('copy')}
                        </button>
                        <button id="save-result" class="bg-green-500 text-white px-4 py-2 rounded">
                            ${i18n.t('save')}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').innerHTML = template;
        
        this.initScannerEvents();
    },

    initScannerEvents() {
        const video = document.getElementById('video');
        let stream = null;

        // 启动相机
        document.getElementById('start-camera').onclick = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                video.srcObject = stream;
                video.play();
                document.getElementById('camera-container').classList.remove('hidden');
                this.startQRScanning(video);
            } catch (err) {
                alert(i18n.t('camera_permission_denied'));
            }
        };

        // 选择图片
        document.getElementById('select-image').onclick = () => {
            document.getElementById('file-input').click();
        };

        document.getElementById('file-input').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.scanImage(file);
            }
        };

        // 复制结果
        document.getElementById('copy-result').onclick = () => {
            const text = document.getElementById('result-text').textContent;
            navigator.clipboard.writeText(text);
            alert(i18n.t('copied'));
        };

        // 保存结果
        document.getElementById('save-result').onclick = () => {
            const text = document.getElementById('result-text').textContent;
            Storage.saveQRCode({
                content: text,
                type: 'scanned',
                created_at: new Date().toISOString()
            });
            alert(i18n.t('saved'));
        };
    },

    startQRScanning(video) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        const scan = () => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                
                if (code) {
                    this.showResult(code.data);
                    return;
                }
            }
            requestAnimationFrame(scan);
        };
        
        requestAnimationFrame(scan);
    },

    scanImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const context = canvas.getContext('2d');
                context.drawImage(img, 0, 0);
                
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                
                if (code) {
                    this.showResult(code.data);
                } else {
                    alert(i18n.t('no_qr_code_found'));
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    showResult(text) {
        document.getElementById('result-text').textContent = text;
        document.getElementById('result-container').classList.remove('hidden');
    }
}; 