<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";

interface FilterType {
  id?: number;
  filterbyTitle?: string;
  icon?: any;
  name: string;
  divider?: boolean;
  color?: string;
}

const filterData1: FilterType[] = [
  { id: 2, name: "inbox", icon: "solar:inbox-line-broken" },
  { id: 3, name: "sent", icon: "solar:plain-2-linear" },
  { id: 4, name: "draft", icon: "solar:notes-linear" },
  { id: 5, name: "spam", icon: "solar:flag-2-outline" },
  { id: 6, name: "trash", icon: "solar:trash-bin-trash-outline" },
  {
    id: 7,
    name: "starred",
    icon: "solar:star-fall-minimalistic-2-line-duotone",
  },
  {
    id: 8,
    name: "important",
    icon: "solar:bell-bing-linear",
  },
  {
    id: 10,
    name: "promotional",
    icon: "solar:folder-open-linear",
    color: "primary",
  },
  {
    id: 11,
    name: "social",
    icon: "solar:folder-open-linear",
    color: "error",
  },
  {
    id: 12,
    name: "health",
    icon: "solar:folder-open-linear",
    color: "success",
  },
];

const selectedFilter = ref<string | null>("inbox");

const emit = defineEmits(["filter-change"]);
const handleFilterClick = (filterName: string) => {
  selectedFilter.value = filterName;
  emit("filter-change", filterName);
};

onMounted(() => {
  handleFilterClick("inbox");
});

const showComposeEmail = ref(false);

</script>

<template>
  <div>
    <v-btn color="primary" class="w-100 rounded-pill"  @click="showComposeEmail = true">compose</v-btn>
    <!-- Sidebar Filter Lists -->
    <v-list class="my-4 theme-list">
     
      <v-list-item
        v-for="item in filterData1.slice(0, 5)" 
        :key="item.id"
        :value="item"
        color="primary"
        rounded="md"
        class="mail-items"
        :class="{
          'active bg-light text-primary': selectedFilter === item.name,
        }"
        @click="handleFilterClick(item.name)"
      >
        <template v-slot:prepend>
          <Icon :icon="item.icon" height="18" />
        </template>
        <v-list-item-title class="ms-3 text-capitalize">{{
          item.name
        }}</v-list-item-title>
      </v-list-item>

      
      <v-list-item-title class="mt-4 mb-2 border-t pt-5 text-uppercase text-12 font-weight-semibold">Sort By</v-list-item-title>

      
      <v-list-item
        v-for="item in filterData1.slice(5,7)" 
        :key="item.id"
        :value="item"
        color="primary"
        rounded="md"
        class="mail-items"
        :class="{
          'active bg-light text-primary': selectedFilter === item.name,
        }"
        @click="handleFilterClick(item.name)"
      >
        <template v-slot:prepend>
          <Icon :icon="item.icon" height="18" />
        </template>
        <v-list-item-title class="ms-3 text-capitalize">{{
          item.name
        }}</v-list-item-title>
      </v-list-item>


      
      <v-list-item-title class="mt-4 mb-2 border-t pt-5 text-uppercase text-12 font-weight-semibold">Labels</v-list-item-title>

      <v-list-item
        v-for="item in filterData1.slice(7)" 
        :key="item.id"
        :value="item"
        color="primary"
        rounded="md"
        class="mail-items"
        :class="{
          'active bg-bglight text-primary': selectedFilter === item.name,
        }"
        @click="handleFilterClick(item.name)"
      >
        <template v-slot:prepend>
          <Icon :icon="item.icon" height="18" :class="'text-' + item.color" />
        </template>
        <v-list-item-title class="ms-3 text-capitalize">{{
          item.name
        }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </div>



  <v-dialog v-model="showComposeEmail" max-width="500px">
    <v-card>
      <v-card-title class="pa-4 bg-primary">Compose Mail</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            label="To"
            required
          ></v-text-field>
          <v-text-field
            label="Subject"
            required
          ></v-text-field>
          <v-textarea
            label="Message"
            rows="4"
            required
          ></v-textarea>
          <v-file-input prepend-icon="null" 
          append-icon="null" label="Attachment" variant="outlined" hide-details class="w-100 mx-0 no-icon" > </v-file-input>
        </v-form>
      </v-card-text>
      <v-card-actions class="ga-3">
        <v-btn
          color="error"
          rounded="pill"
          variant="flat"
          class="px-5"
          @click="showComposeEmail = false"
          >Cancel</v-btn
        >
        <v-btn color="primary"  rounded="pill" class="px-5" variant="flat"
          >Send</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
