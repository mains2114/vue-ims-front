// stores/cache.js
import { defineStore } from 'pinia'

export const useCacheStore = defineStore('cache', {
  state: () => {
    return { 
        companies: [],
        accounts: [],
        companiesLock: false,
        accountsLock: false,
        changesVer: 20240718,
        checkedVer: 0,
    }
  },
  actions: {
    updateCompanies(rows) {
      this.companies.splice(0, this.companies.length, ...rows);
    },
    updateAccounts(rows) {
      this.accounts.splice(0, this.accounts.length, ...rows);
    },
    lockCompanies(val) {
      this.companiesLock = val;
    },
    lockAccounts(val) {
      this.accountsLock = val;
    },
    updateCheckedVer() {
      this.checkedVer = this.changesVer;
      localStorage.setItem('cache.checkedVer', this.checkedVer);
    },
    restoreCheckedVer() {
      let val = localStorage.getItem('cache.checkedVer');
      if (val) {
        this.checkedVer = val;
      }
    },
  },
})
