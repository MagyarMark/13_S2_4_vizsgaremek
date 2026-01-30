<script>
export default {
  async mounted() {
    try {
      await this.$router.replace({ name: "Home" });
    } catch (e) {
      console.log("Nincs elérhető Home oldal")
    }
  }
};
</script>

<template>
  <router-view></router-view>
</template>

<style>

</style>