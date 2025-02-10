const Pages = {
    ...Pages,
    settings() {
        const settings = Storage.getSettings();
        const template = `
            <div class="max-w-2xl mx-auto">
                <h1 class="text-2xl font-bold mb-6">${i18n.t('settings')}</h1>
                
                <div class="bg-white rounded-lg shadow-lg p-6 space-y-6">
                    <div>
                        <h2 class="text-lg font-semibold mb-4">${i18n.t('language')}</h2>
                        <select id="language-select" class="w-full border rounded px-3 py-2">
                            <option value="zh" ${settings.language === 'zh' ? 'selected' : ''}>
                                中文
                            </option>
                            <option value="en" ${settings.language === 'en' ? 'selected' : ''}>
                                English
                            </option>
                        </select>
                    </div>
                    
                    <div>
                        <h2 class="text-lg font-semibold mb-4">${i18n.t('storage_management')}</h2>
                        <p class="text-gray-600 mb-4">${i18n.t('clear_storage_description')}</p>
                        <button id="clear-storage" class="bg-red-500 text-white px-4 py-2 rounded">
                            ${i18n.t('clear_storage')}
                        </button>
                    </div>
                    
                    <div>
                        <h2 class="text-lg font-semibold mb-4">${i18n.t('privacy_policy')}</h2>
                        <button id="view-privacy" class="bg-blue-500 text-white px-4 py-2 rounded">
                            ${i18n.t('read_privacy')}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').innerHTML = template;
        
        this.initSettingsEvents();
    },

    initSettingsEvents() {
        // 语言切换
        document.getElementById('language-select').onchange = (e) => {
            i18n.setLanguage(e.target.value);
        };

        // 清除存储
        document.getElementById('clear-storage').onclick = () => {
            if (confirm(i18n.t('clear_confirm'))) {
                Storage.clearAll();
                alert(i18n.t('clear_success'));
            }
        };

        // 查看隐私政策
        document.getElementById('view-privacy').onclick = () => {
            App.showPrivacyDialog();
        };
    }
}; 