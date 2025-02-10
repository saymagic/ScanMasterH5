const Pages = {
    ...Pages,
    generator() {
        const template = `
            <div class="max-w-2xl mx-auto">
                <h1 class="text-2xl font-bold mb-6">${i18n.t('generate_qr_code')}</h1>
                
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <div class="mb-6">
                        <label class="block text-gray-700 mb-2">${i18n.t('content_type')}</label>
                        <select id="content-type" class="w-full border rounded px-3 py-2">
                            <option value="text">${i18n.t('text')}</option>
                            <option value="url">${i18n.t('url')}</option>
                            <option value="wifi">${i18n.t('wifi')}</option>
                            <option value="contact">${i18n.t('contact')}</option>
                        </select>
                    </div>
                    
                    <div id="content-form">
                        <!-- 动态内容表单 -->
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-gray-700 mb-2">${i18n.t('qr_size')}</label>
                        <input type="range" id="size-slider" min="128" max="512" value="256" class="w-full">
                    </div>
                    
                    <div id="qr-preview" class="mb-6 flex justify-center">
                        <!-- 预览区域 -->
                    </div>
                    
                    <div class="flex space-x-4">
                        <button id="generate-btn" class="flex-1 bg-blue-500 text-white px-4 py-2 rounded">
                            ${i18n.t('generate')}
                        </button>
                        <button id="download-btn" class="flex-1 bg-green-500 text-white px-4 py-2 rounded">
                            ${i18n.t('download')}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').innerHTML = template;
        
        this.initGeneratorEvents();
        this.updateContentForm('text');
    },

    initGeneratorEvents() {
        // 内容类型切换
        document.getElementById('content-type').onchange = (e) => {
            this.updateContentForm(e.target.value);
        };

        // 生成按钮
        document.getElementById('generate-btn').onclick = () => {
            const content = this.getFormContent();
            if (content) {
                this.generateQRCode(content);
            }
        };

        // 下载按钮
        document.getElementById('download-btn').onclick = () => {
            const canvas = document.querySelector('#qr-preview canvas');
            if (canvas) {
                const link = document.createElement('a');
                link.download = 'qrcode.png';
                link.href = canvas.toDataURL();
                link.click();
            }
        };

        // 尺寸滑块
        document.getElementById('size-slider').oninput = (e) => {
            const content = this.getFormContent();
            if (content) {
                this.generateQRCode(content, parseInt(e.target.value));
            }
        };
    },

    updateContentForm(type) {
        const container = document.getElementById('content-form');
        let html = '';

        switch (type) {
            case 'text':
                html = `
                    <div class="mb-6">
                        <label class="block text-gray-700 mb-2">${i18n.t('text_content')}</label>
                        <textarea id="text-content" class="w-full border rounded px-3 py-2" rows="4"></textarea>
                    </div>
                `;
                break;
            case 'url':
                html = `
                    <div class="mb-6">
                        <label class="block text-gray-700 mb-2">${i18n.t('url')}</label>
                        <input type="url" id="url-content" class="w-full border rounded px-3 py-2" 
                               placeholder="https://example.com">
                    </div>
                `;
                break;
            case 'wifi':
                html = `
                    <div class="space-y-4 mb-6">
                        <div>
                            <label class="block text-gray-700 mb-2">${i18n.t('network_name')}</label>
                            <input type="text" id="wifi-ssid" class="w-full border rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-gray-700 mb-2">${i18n.t('password')}</label>
                            <input type="password" id="wifi-password" class="w-full border rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-gray-700 mb-2">${i18n.t('encryption')}</label>
                            <select id="wifi-encryption" class="w-full border rounded px-3 py-2">
                                <option value="WPA">WPA/WPA2</option>
                                <option value="WEP">WEP</option>
                                <option value="nopass">${i18n.t('none')}</option>
                            </select>
                        </div>
                    </div>
                `;
                break;
            case 'contact':
                html = `
                    <div class="space-y-4 mb-6">
                        <div>
                            <label class="block text-gray-700 mb-2">${i18n.t('name')}</label>
                            <input type="text" id="contact-name" class="w-full border rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-gray-700 mb-2">${i18n.t('phone')}</label>
                            <input type="tel" id="contact-phone" class="w-full border rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-gray-700 mb-2">${i18n.t('email')}</label>
                            <input type="email" id="contact-email" class="w-full border rounded px-3 py-2">
                        </div>
                    </div>
                `;
                break;
        }

        container.innerHTML = html;
    },

    getFormContent() {
        const type = document.getElementById('content-type').value;
        let content = '';

        switch (type) {
            case 'text':
                content = document.getElementById('text-content').value;
                break;
            case 'url':
                content = document.getElementById('url-content').value;
                break;
            case 'wifi':
                const ssid = document.getElementById('wifi-ssid').value;
                const password = document.getElementById('wifi-password').value;
                const encryption = document.getElementById('wifi-encryption').value;
                content = `WIFI:S:${ssid};T:${encryption};P:${password};;`;
                break;
            case 'contact':
                const name = document.getElementById('contact-name').value;
                const phone = document.getElementById('contact-phone').value;
                const email = document.getElementById('contact-email').value;
                content = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
                break;
        }

        return content;
    },

    generateQRCode(content, size = 256) {
        const qr = qrcode(0, 'M');
        qr.addData(content);
        qr.make();

        const preview = document.getElementById('qr-preview');
        preview.innerHTML = qr.createImgTag(size / 25);

        // 保存到历史记录
        Storage.saveQRCode({
            content: content,
            type: 'generated',
            preview: preview.innerHTML
        });
    }
}; 