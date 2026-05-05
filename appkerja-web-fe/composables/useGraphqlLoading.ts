/** Delay before hiding overlay after last GraphQL op ends (avoids blink when chaining requests). */
const GRAPHQL_LOADING_HIDE_DELAY_MS = 220;

let hideTimer: ReturnType<typeof setTimeout> | null = null;

const clearHideTimer = () => {
  if (hideTimer !== null) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
};

export const useGraphqlLoading = () => {
  const pendingCount = useState<number>("graphql-loading-pending-count", () => 0);
  const displayLoading = useState<boolean>("graphql-loading-display", () => false);

  const scheduleHide = () => {
    clearHideTimer();
    if (pendingCount.value !== 0) return;

    if (!import.meta.client) {
      displayLoading.value = false;
      return;
    }

    hideTimer = setTimeout(() => {
      hideTimer = null;
      if (pendingCount.value === 0) {
        displayLoading.value = false;
      }
    }, GRAPHQL_LOADING_HIDE_DELAY_MS);
  };

  const start = () => {
    clearHideTimer();
    pendingCount.value += 1;
    displayLoading.value = true;
  };

  const stop = () => {
    pendingCount.value = Math.max(0, pendingCount.value - 1);
    if (pendingCount.value === 0) {
      scheduleHide();
    } else {
      clearHideTimer();
      displayLoading.value = true;
    }
  };

  const reset = () => {
    clearHideTimer();
    pendingCount.value = 0;
    displayLoading.value = false;
  };

  const isLoading = computed(() => displayLoading.value);

  return {
    pendingCount,
    isLoading,
    start,
    stop,
    reset,
  };
};
