<script>
import {
  clearSessionAuthData,
  ensureSessionTimeout,
  isSessionExpired
} from './utils/sessionTimeout';

export default {
  name: 'App',
  data() {
    return {
      sessionCheckIntervalId: null
    };
  },
  mounted() {
    this.checkSessionTimeout();
    this.sessionCheckIntervalId = window.setInterval(this.checkSessionTimeout, 15000);
  },
  beforeUnmount() {
    if (this.sessionCheckIntervalId) {
      clearInterval(this.sessionCheckIntervalId);
      this.sessionCheckIntervalId = null;
    }
  },
  methods: {
    checkSessionTimeout() {
      const hasToken = Boolean(localStorage.getItem('accessToken'));
      const hasUser = Boolean(localStorage.getItem('user'));

      if (!hasToken || !hasUser) {
        return;
      }

      ensureSessionTimeout();
      if (!isSessionExpired()) {
        return;
      }

      clearSessionAuthData();
      if (this.$route.name !== 'Login') {
        this.$router.push({ name: 'Login', query: { reason: 'timeout' } }).catch(() => {});
      }
    }
  }
};
</script>

<template>
  <router-view></router-view>
</template>

<style>

</style>