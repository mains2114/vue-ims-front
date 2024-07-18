// stores/cache.js
import { defineStore } from 'pinia'

export const useCacheStore = defineStore('cache', {
  state: () => {
    return { 
        companies: [],
        accounts: [],
        companiesLock: false,
        accountsLock: false,
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
  },
})
