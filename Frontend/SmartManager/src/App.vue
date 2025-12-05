<script>
export default {
  async mounted() {
    try {
      await this.$router.replace({ name: "Home" });//Név alapján keresés
    } catch (e) {
      try {
        await this.$router.replace("/home");//Útvonal alapján keresés
      } catch (e2) {
        console.log("Nincs elérhető Home oldal")
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