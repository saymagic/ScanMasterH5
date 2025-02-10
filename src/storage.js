const Storage = {
  // 二维码记录相关
  getQRCodes() {
    return JSON.parse(localStorage.getItem('qrcodes') || '[]');
  },
  
  saveQRCode(qrcode) {
    const qrcodes = this.getQRCodes();
    qrcodes.push({
      ...qrcode,
      id: Date.now(),
      created_at: new Date().toISOString()
    });
    localStorage.setItem('qrcodes', JSON.stringify(qrcodes));
  },
  
  deleteQRCode(id) {
    const qrcodes = this.getQRCodes().filter(qr => qr.id !== id);
    localStorage.setItem('qrcodes', JSON.stringify(qrcodes));
  },
  
  toggleFavorite(id) {
    const qrcodes = this.getQRCodes().map(qr => {
      if (qr.id === id) {
        return { ...qr, is_favorite: !qr.is_favorite };
      }
      return qr;
    });
    localStorage.setItem('qrcodes', JSON.stringify(qrcodes));
  },
  
  // 设置相关
  getSettings() {
    return JSON.parse(localStorage.getItem('settings') || '{"language":"zh"}');
  },
  
  saveSettings(settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
  },
  
  // 清除所有数据
  clearAll() {
    const settings = this.getSettings();
    localStorage.clear();
    this.saveSettings(settings); // 保留设置
  }
}; 