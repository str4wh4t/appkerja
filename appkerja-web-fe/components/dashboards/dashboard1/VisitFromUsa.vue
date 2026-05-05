

<template>

  <VCard elevation="10">

    <v-card-text class="position-relative">
      <h5 class="text-h5 mb-3 font-weight-semibold">
        Visit From USA
      </h5>
      
      <div id="svgMap" ref="map" class="mt-5"></div>

      <v-row class="align-center justify-space-between mt-6">
        <v-col cols="2" md="auto" sm="2">
          <h6 class="text-subtitle-1 font-weight-semibold text-grey200">LA</h6>
        </v-col>
        <v-col cols="7" md="8" class="px-0"><v-progress-linear model-value="28" height="5" color="info" bg-color="lightinfo"
            rounded></v-progress-linear></v-col>
        <v-col cols="3" md="auto" sm="3">
          <h6 class="text-subtitle-1 font-weight-semibold text-grey200 text-right">28%</h6>
        </v-col>
      </v-row>
      <v-row class="align-center justify-space-between">
        <v-col cols="2" md="auto" sm="2">
          <h6 class="text-subtitle-1 font-weight-semibold text-grey200">NY</h6>
        </v-col>
        <v-col cols="7" md="8" class="px-0"><v-progress-linear model-value="21" height="5" color="primary" bg-color="lightprimary"
            rounded></v-progress-linear></v-col>
        <v-col cols="3" md="auto" sm="3">
          <h6 class="text-subtitle-1 font-weight-semibold text-grey200 text-right">21%</h6>
        </v-col>
      </v-row>
      <v-row class="align-center justify-space-between">
        <v-col cols="2" md="auto" sm="2">
          <h6 class="text-subtitle-1 font-weight-semibold text-grey200">KA</h6>
        </v-col>
        <v-col cols="7" md="8" class="px-0"><v-progress-linear model-value="18" height="5" color="error" bg-color="lighterror"
            rounded></v-progress-linear></v-col>
        <v-col cols="3" md="auto" sm="3">
          <h6 class="text-subtitle-1 font-weight-semibold text-grey200 text-right">18%</h6>
        </v-col>
      </v-row>
      <v-row class="align-center justify-space-between">
        <v-col cols="2" md="auto" sm="2">
          <h6 class="text-subtitle-1 font-weight-semibold text-grey200">AZ</h6>
        </v-col>
        <v-col cols="7" md="8" class="px-0"><v-progress-linear model-value="12" height="5" color="indigo" bg-color="lightindigo"
            rounded></v-progress-linear></v-col>
        <v-col cols="3" md="auto" sm="3">
          <h6 class="text-subtitle-1 font-weight-semibold text-grey200 text-right">12%</h6>
        </v-col>
      </v-row>
    </v-card-text>
  </VCard>
  
</template>
<script setup>
import svgMap from "svgmap";
import "svgmap/dist/svgMap.min.css";
import { onMounted, ref } from "vue";
const map = ref(null);

onMounted(() => {
  new svgMap({
    targetElementID: "svgMap",
    mouseWheelZoomEnabled: false,
    hideFlag: true,
    initialZoom: 1.23,

    data: {
      data: {
        countresidents: {
          format: "{0}",
          thousandSeparator: ",",
          thresholdMax: 50000,
          thresholdMin: 1000,
        },
      },
      applyData: "countresidents",
      values: {
        AF: { countresidents: 587, color: "#4bd08b" },
        IN: { countresidents: 232, color: "#46caeb" },
        US: { countresidents: 42393, color: "#0085db" },
      },
    },
  });
});
</script>

<style lang="scss">
.svgMap-map-wrapper {
  background: transparent;
  padding-top: 70%;
  top: -20px;
}
</style>


