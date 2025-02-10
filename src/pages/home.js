const Pages = {
    home() {
        const template = `
            <div class="max-w-4xl mx-auto text-center">
                <h1 class="text-4xl font-bold mb-8">${i18n.t('welcome_title')}</h1>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <a href="/scanner" class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <svg class="w-12 h-12 mx-auto mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                        </svg>
                        <h2 class="text-xl font-semibold mb-2">${i18n.t('scan_qr_code')}</h2>
                        <p class="text-gray-600">${i18n.t('scan_description')}</p>
                    </a>
                    
                    <a href="/generator" class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <svg class="w-12 h-12 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M12 4v16m8-8H4"/>
                        </svg>
                        <h2 class="text-xl font-semibold mb-2">${i18n.t('generate_qr_code')}</h2>
                        <p class="text-gray-600">${i18n.t('generate_description')}</p>
                    </a>
                </div>
                
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <h2 class="text-xl font-semibold mb-4">${i18n.t('recent_codes')}</h2>
                    <div id="recent-list" class="space-y-4">
                        <!-- 最近的二维码列表 -->
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').innerHTML = template;
        
        // 加载最近的二维码
        const recentCodes = Storage.getQRCodes().slice(-5).reverse();
        document.getElementById('recent-list').innerHTML = recentCodes.map(code => `
            <div class="border rounded p-4 text-left">
                <div class="font-medium">${code.content}</div>
                <div class="text-sm text-gray-500">
                    ${new Date(code.created_at).toLocaleString()}
                </div>
            </div>
        `).join('') || `<p class="text-gray-500">${i18n.t('no_recent_codes')}</p>`;
    }
}; 