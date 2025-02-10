const Pages = {
    ...Pages,
    history() {
        const template = `
            <div class="max-w-4xl mx-auto">
                <h1 class="text-2xl font-bold mb-6">${i18n.t('history')}</h1>
                
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <div class="flex justify-between mb-6">
                        <div class="flex space-x-4">
                            <button id="filter-all" class="px-4 py-2 rounded bg-blue-500 text-white">
                                ${i18n.t('all')}
                            </button>
                            <button id="filter-scanned" class="px-4 py-2 rounded bg-gray-200">
                                ${i18n.t('scanned')}
                            </button>
                            <button id="filter-generated" class="px-4 py-2 rounded bg-gray-200">
                                ${i18n.t('generated')}
                            </button>
                        </div>
                        <button id="clear-history" class="px-4 py-2 rounded bg-red-500 text-white">
                            ${i18n.t('clear_all')}
                        </button>
                    </div>
                    
                    <div id="history-list" class="space-y-4">
                        <!-- 历史记录列表 -->
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').innerHTML = template;
        
        this.initHistoryEvents();
        this.loadHistory();
    },

    initHistoryEvents() {
        // 筛选按钮
        document.querySelectorAll('[id^="filter-"]').forEach(button => {
            button.onclick = (e) => {
                document.querySelectorAll('[id^="filter-"]').forEach(btn => {
                    btn.classList.remove('bg-blue-500', 'text-white');
                    btn.classList.add('bg-gray-200');
                });
                e.target.classList.remove('bg-gray-200');
                e.target.classList.add('bg-blue-500', 'text-white');
                
                const filter = e.target.id.replace('filter-', '');
                this.loadHistory(filter);
            };
        });

        // 清除历史
        document.getElementById('clear-history').onclick = () => {
            if (confirm(i18n.t('clear_confirm'))) {
                Storage.clearAll();
                this.loadHistory();
            }
        };
    },

    loadHistory(filter = 'all') {
        const records = Storage.getQRCodes();
        const filteredRecords = filter === 'all' ? 
            records : 
            records.filter(r => r.type === filter);
            
        const container = document.getElementById('history-list');
        container.innerHTML = filteredRecords.map(record => `
            <div class="border rounded p-4 flex justify-between items-center">
                <div>
                    <div class="font-medium">${record.content}</div>
                    <div class="text-sm text-gray-500">
                        ${new Date(record.created_at).toLocaleString()}
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="Pages.toggleFavorite(${record.id})" class="p-2 rounded hover:bg-gray-100">
                        <svg class="w-5 h-5 ${record.is_favorite ? 'text-yellow-500' : 'text-gray-400'}" 
                             fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                    </button>
                    <button onclick="Pages.deleteRecord(${record.id})" class="p-2 rounded hover:bg-gray-100">
                        <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    },

    toggleFavorite(id) {
        Storage.toggleFavorite(id);
        this.loadHistory();
    },

    deleteRecord(id) {
        if (confirm(i18n.t('delete_confirm'))) {
            Storage.deleteQRCode(id);
            this.loadHistory();
        }
    }
}; 