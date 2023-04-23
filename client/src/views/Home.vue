<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/mevn.jpg" width="350" />
    <HelloWorld msg="Default Boilerplate Template" />
    <button @click="addData()">TEST</button>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import axios from "axios";

export default {
  name: "home",
  components: {
    HelloWorld
  },
  async mounted() {
    const res = await axios.get(`http://localhost:9000/api`);
    console.log(res);
  },
  methods: {
    async addData() {
      const response = await axios.post(`http://localhost:9000/api`, {
        name: 'test',
        password: 'dispass'
      });

      console.log(response);

    }
  }
};
</script>
