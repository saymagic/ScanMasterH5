const Router = {
  init() {
    this.handleLinks();
    window.addEventListener('popstate', () => this.handleRoute());
    this.handleRoute();
  },

  routes: {
    '/': 'home',
    '/scanner': 'scanner', 
    '/generator': 'generator',
    '/history': 'history',
    '/settings': 'settings'
  },

  handleLinks() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('a') && e.target.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const path = e.target.pathname;
        this.navigate(path);
      }
    });
  },

  navigate(path) {
    history.pushState(null, '', path);
    this.handleRoute();
  },

  handleRoute() {
    const path = window.location.pathname;
    const page = this.routes[path] || 'home';
    
    // 清除之前的页面内容
    const appElement = document.getElementById('app');
    appElement.innerHTML = '';
    
    // 调用对应页面的渲染函数
    if (typeof Pages[page] === 'function') {
      Pages[page]();
    }
  }
}; 