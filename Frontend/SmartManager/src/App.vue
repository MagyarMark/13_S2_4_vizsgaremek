<script>
/*export default {
  async mounted() {
    try {
      const lastRoute = sessionStorage.getItem("lastRoute");
      const lastRouteName = lastRoute ? JSON.parse(lastRoute).name : null;
      
      if (lastRouteName && lastRouteName !== this.$route.name) {
        await this.$router.replace(JSON.parse(lastRoute));
      } else if (!lastRouteName) {
        await this.$router.replace({ name: "Home" });
      }
    } catch (e) {
      console.log("Nincs elérhető oldal", e)
    }
  },
  
  watch: {
    $route(to) {
      sessionStorage.setItem("lastRoute", JSON.stringify({
        name: to.name,
        path: to.path,
        params: to.params,
        query: to.query
      }));
    }
  }
};*/
</script>

<template>
  <router-view></router-view>
</template>

<style>

</style>