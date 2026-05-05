<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useInvoicestore } from "@/stores/apps/invoice";
import { Icon } from "@iconify/vue";

const store = useInvoicestore();

const showConfirmation = ref(false);
const ticketIdToDelete = ref<number | null>(null); 
onMounted(async () => {
  await store.fetchinvoice(); 
  setInvoiceType(InvoiceTypeVal.value); 
});


const getInvoice = computed(() => store.invoice);
console.log("list", getInvoice);
let FinalInvoice = ref([...getInvoice.value]);

const searchValue = ref("");
const InvoiceTypeVal = ref("total");

const setInvoiceType = (type: string) => {
  InvoiceTypeVal.value = type;
  console.log(`InvoiceTypeVal changed to: ${type}`);

  if (InvoiceTypeVal.value === "total") {
    FinalInvoice.value = [...getInvoice.value]; 
  } else {
    FinalInvoice.value = getInvoice.value.filter((ticket:any) => {
      console.log("Filtering ticket:", ticket);
      return (
        ticket.status &&
        ticket.status.toLowerCase() === InvoiceTypeVal.value.toLowerCase()
      );
    });
  }
  applySearchFilter();
};

const applySearchFilter = () => {
  if (InvoiceTypeVal.value === "total") {
    FinalInvoice.value = [...getInvoice.value];
  } else {
    FinalInvoice.value = getInvoice.value.filter((ticket:any) => {
      return (
        ticket.status &&
        ticket.status.toLowerCase() === InvoiceTypeVal.value.toLowerCase()
      );
    });
  }

  if (searchValue.value) {
    FinalInvoice.value = FinalInvoice.value.filter((invoice:any) =>
      invoice.billFrom?.toLowerCase().includes(searchValue.value.toLowerCase())
    );
  }
};

watch(searchValue, applySearchFilter);

const calculateTotalCost = (
  unitPrice: number | undefined,
  units: number | undefined
): number => {
  return (unitPrice ?? 0) * (units ?? 0);
};

const totalInvoiceCount = computed(() => getInvoice.value.length);
const ShippedInvoiceCount = computed(
  () => getInvoice.value.filter((ticket:any) => ticket.status === "Shipped").length
);
const DeliveredInvoiceCount = computed(
  () =>
    getInvoice.value.filter((ticket:any) => ticket.status === "Delivered").length
);
const PendingInvoiceCount = computed(
  () => getInvoice.value.filter((ticket:any) => ticket.status === "Pending").length
);

const handleDeleteTicket = (ticketId: number) => {
  ticketIdToDelete.value = ticketId; 
  showConfirmation.value = true; 
};
// Function to confirm deletion
const confirmDelete = () => {
  if (ticketIdToDelete.value !== null) {
    store.deleteinvoice(ticketIdToDelete.value);
    ticketIdToDelete.value = null; 
    showConfirmation.value = false; 
    setInvoiceType(InvoiceTypeVal.value); 
  }
};
</script>

<template>
  <v-card elevation="10">
    <v-card-item>
      <div class="overflow-x-reposive">
        <v-row class="d-flex  flex-nowrap">
          <v-col cols="10" md="3" sm="6" >
            <div
              :class="[
                'pa-6 d-flex ga-3 align-center cursor-pointer rounded-xl',
                { 'bg-bglight': InvoiceTypeVal === 'total' },
              ]"
              @click="setInvoiceType('total')"
            >
              <v-avatar size="56" class="border border-md border-primary">
                <Icon
                  icon="solar:tag-horizontal-broken"
                  height="25"
                  class="text-primary"
                />
              </v-avatar>
              <div>
                <h6 class="text-h6">Total</h6>
                <p class="text-14 lh-normal" v-if="totalInvoiceCount == 0">
                  0 invoices
                </p>
                <p class="text-14 lh-normal" v-else>
                  {{ totalInvoiceCount }} invoices
                </p>
                <h5 class="text-14 lh-normal">$46,218.04</h5>
              </div>
            </div>
          </v-col>
          <v-col cols="10" md="3" sm="6" >
            <div
              :class="[
                'pa-6 d-flex ga-3 align-center cursor-pointer rounded-xl',
                { 'bg-bglight': InvoiceTypeVal === 'Shipped' },
              ]"
              @click="setInvoiceType('Shipped')"
            >
              <v-avatar size="56" class="border border-md border-success">
                <Icon
                  icon="solar:shield-up-linear"
                  height="25"
                  class="text-success"
                />
              </v-avatar>
              <div>
                <h6 class="text-h6">Shipped</h6>
                <p class="text-14 lh-normal" v-if="ShippedInvoiceCount == 0">
                  0 invoices
                </p>
                <p class="text-14 lh-normal" v-else>
                  {{ ShippedInvoiceCount }} invoices
                </p>
                <h5 class="text-14 lh-normal">$23,110.23</h5>
              </div>
            </div>
          </v-col>
          <v-col cols="10" md="3" sm="6" >
            <div
              :class="[
                'pa-6 d-flex ga-3 align-center cursor-pointer rounded-xl',
                { 'bg-bglight': InvoiceTypeVal === 'Delivered' },
              ]"
              @click="setInvoiceType('Delivered')"
            >
              <v-avatar size="56" class="border border-md border-info">
                <Icon
                  icon="solar:map-point-wave-linear"
                  height="25"
                  class="text-info"
                />
              </v-avatar>
              <div>
                <h6 class="text-h6">Delivered</h6>
                <p class="text-14 lh-normal" v-if="DeliveredInvoiceCount == 0">
                  0 invoices
                </p>
                <p class="text-14 lh-normal" v-else>
                  {{ DeliveredInvoiceCount }} invoices
                </p>
                <h5 class="text-14 lh-normal">$13,825.05</h5>
              </div>
            </div>
          </v-col>
          <v-col cols="10" md="3" sm="6" >
            <div
              :class="[
                'pa-6 d-flex ga-3 align-center cursor-pointer rounded-xl',
                { 'bg-bglight': InvoiceTypeVal === 'Pending' },
              ]"
              @click="setInvoiceType('Pending')"
            >
              <v-avatar size="56" class="border border-md border-warning">
                <Icon
                  icon="solar:camera-rotate-broken"
                  height="25"
                  class="text-warning"
                />
              </v-avatar>
              <div>
                <h6 class="text-h6">Pending</h6>
                <p class="text-14 lh-normal" v-if="PendingInvoiceCount == 0">
                  0 invoices
                </p>
                <p class="text-14 lh-normal" v-else>
                  {{ PendingInvoiceCount }} invoices
                </p>
                <h5 class="text-14 lh-normal">$4,655.63</h5>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>

      <div class="">
        <div class="d-sm-flex justify-space-between align-center my-7">
          <v-sheet width="255" class="mb-lg-0 mb-4">
            <v-text-field
              v-model="searchValue"
              label="Search Invoice"
              variant="outlined"
              hide-details
              class="w-100"
              density="compact"
            >
              <template v-slot:prepend-inner>
                <Icon icon="solar:magnifer-linear" height="18" width="25" />
              </template>
            </v-text-field>
          </v-sheet>
          <v-btn color="primary" rounded="pill" flat to="/apps/invoice/create"
            >New Invoice</v-btn
          >
        </div>

        <!-- Render filtered tickets -->
        <v-table class="invoice-table">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-14">
                  <v-checkbox hide-details color="primary"></v-checkbox>
                </th>
                <th class="text-14 text-no-wrap">ID</th>
                <th class="text-14 text-no-wrap">BILL FROM</th>
                <th class="text-14 text-no-wrap">BILL TO</th>
                <th class="text-14 text-no-wrap">TOTAL COST</th>
                <th class="text-14 text-no-wrap">STATUS</th>
                <th class="text-14 text-no-wrap text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invoice in FinalInvoice" :key="invoice.id">
                <td>
                  <v-checkbox color="primary" hide-details></v-checkbox>
                </td>
                <td class="text-14 font-weight-semibold">{{ invoice.id }}</td>
                <td class="text-14 font-weight-semibold text-no-wrap">
                  {{ invoice.billFrom }}
                </td>
                <td class="text-14 text-no-wrap">{{ invoice.billTo }}</td>
                <td class="text-14 text-no-wrap">{{ store.grandTotal(invoice) }}</td>
                <td>
                  <v-chip
                    rounded="pill"
                    :color="
                      invoice.status === 'Shipped'
                        ? 'success'
                        : invoice.status === 'Delivered'
                        ? 'info'
                        : invoice.status === 'Pending'
                        ? 'warning'
                        : 'primary'
                    "
                    variant="flat"
                    size="small"
                    label
                    >{{ invoice.status }}</v-chip
                  >
                </td>
                <td>
                  <div class="d-flex ga-3 align-center justify-center">
                    <RouterLink :to="`/apps/invoice/edit/${invoice.id}`">
                      <v-avatar color="lightsuccess" size="32">
                        <Icon
                          icon="solar:pen-linear"
                          class="text-success"
                          height="18"
                        />
                      </v-avatar>
                      <v-tooltip activator="parent" location="bottom"
                        >Edit Invoice</v-tooltip
                      >
                    </RouterLink>

                    <RouterLink :to="`/apps/invoice/details/${invoice.id}`">
                      <v-avatar color="lightprimary" size="32">
                        <Icon
                          icon="solar:eye-linear"
                          class="text-primary"
                          height="18"
                        />
                      </v-avatar>
                      <v-tooltip activator="parent" location="bottom"
                        >View Invoice</v-tooltip
                      >
                    </RouterLink>

                    <RouterLink to=""
                      @click.stop="handleDeleteTicket(invoice.id)"
                      class="cursor-pointer"
                    >
                      <v-avatar color="lighterror" size="32">
                        <Icon
                          icon="solar:trash-bin-minimalistic-linear"
                          class="text-error"
                          height="18"
                        />
                      </v-avatar>
                      <v-tooltip activator="parent" location="bottom"
                        >Delete Invoice</v-tooltip
                      >
                    </RouterLink>
                  </div>
                </td>
              </tr>
            </tbody>
          </template>
        </v-table>
      </div>
    </v-card-item>
  </v-card>

  <!-- Confirmation Dialog -->
  <v-dialog v-model="showConfirmation" max-width="500px">
    <v-card>
      <v-card-title class="pa-4 bg-primary">Delete Invoice</v-card-title>
      <v-card-text>
        <h5 class="text-16">Are you sure you want to delete this invoice?</h5>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          class="px-4"
          variant="flat"
          rounded="pill"
          @click="confirmDelete"
          >Yes, Delete</v-btn
        >
        <v-btn
          color="error"
          variant="flat"
          rounded="pill"
          class="px-4"
          @click="showConfirmation = false"
          >Cancel</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
