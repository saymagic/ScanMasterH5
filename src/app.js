const App = {
  init() {
    Router.init();
    this.bindEvents();
    this.checkPrivacyPolicy();
  },

  bindEvents() {
    // 绑定各种事件处理
    $('#mobile-menu-button').click(() => {
      $('#mobile-menu').toggleClass('hidden');
    });
  },

  checkPrivacyPolicy() {
    const settings = Storage.getSettings();
    if (!settings.privacy_accepted) {
      this.showPrivacyDialog();
    }
  }
};

// 启动应用
$(document).ready(() => {
  App.init();
}); 