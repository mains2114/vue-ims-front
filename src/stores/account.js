// stores/account.js
import { defineStore } from 'pinia'

export const useAccountStore = defineStore('account', {
  state: () => {
    return { 
        user: null,
        account: null,
    }
  },
  actions: {
    setUser(user) {
      this.user = window.$ims.user = user;
      if (window.sessionStorage) {
        window.sessionStorage.setItem('user', JSON.stringify(user));
      }
    },
    switchAccount(account) {
      this.account = window.$ims.account = account;
      if (window.sessionStorage) {
        window.sessionStorage.setItem('account', JSON.stringify(account));
      }
    },
    recovery() {
      if (window.sessionStorage) {
        this.account = window.$ims.account = JSON.parse(window.sessionStorage.getItem('account'));
        this.user = window.$ims.user = JSON.parse(window.sessionStorage.getItem('user'));
      }
    },
  },
})
