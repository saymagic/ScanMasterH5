const i18n = {
  currentLanguage: 'zh',

  init() {
    this.currentLanguage = Storage.getSettings().language;
  },

  t(key) {
    return this.translations[this.currentLanguage][key] || key;
  },

  setLanguage(lang) {
    this.currentLanguage = lang;
    Storage.saveSettings({ language: lang });
    // 触发页面刷新
    window.location.reload();
  },

  translations: {
    zh: {
      'scan': '扫描',
      'generate': '生成',
      'history': '历史',
      'settings': '设置',
      'clear_storage': '清除存储',
      'clear_storage_description': '清除本地存储以释放空间并删除所有已保存的二维码历史记录。',
      'clear_confirm': '确定要清除所有存储吗？此操作无法撤消。',
      // ... 其他翻译
    },
    en: {
      'scan': 'Scan',
      'generate': 'Generate',
      'history': 'History',
      'settings': 'Settings',
      'clear_storage': 'Clear Storage',
      'clear_storage_description': 'Clear local storage to free up space and delete all saved QR code history.',
      'clear_confirm': 'Are you sure you want to clear all storage? This action cannot be undone.',
      // ... 其他翻译
    }
  }
}; 