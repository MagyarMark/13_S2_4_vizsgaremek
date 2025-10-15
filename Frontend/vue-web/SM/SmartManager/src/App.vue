<script>

</script>

<template>
  <router-view></router-view>
</template>

<style>

</style>

<!--<template>
  <div>
    <h2>Backend kapcsolat teszt</h2>
    <button @click="fetchData">Kapcsolat tesztelése</button>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return { message: "" };
  },
  methods: {
    async fetchData() {
      const res = await fetch("http://localhost:3000/api/test");
      const data = await res.json();
      this.message = `Kapcsolat rendben! Idő: ${data.time.now}`;
    }
  }
};
</script>
-->