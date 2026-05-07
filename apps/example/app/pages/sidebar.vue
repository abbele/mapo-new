<script setup lang="ts">
const sidebar = useSidebarStore();
</script>

<template>
  <UContainer class="py-10 max-w-lg">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold">Sidebar store</h2>
        <p class="text-sm text-muted">
          Tests useSidebarStore toggles + cookie persistence. Reload the page —
          state should survive.
        </p>
      </div>
      <UButton to="/" variant="ghost" leading-icon="i-lucide-arrow-left"
        >Back</UButton
      >
    </div>

    <UCard>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">drawer</p>
            <p class="text-sm text-muted">Open/closed state</p>
          </div>
          <div class="flex items-center gap-3">
            <UBadge
              :color="sidebar.drawer ? 'success' : 'neutral'"
              variant="subtle"
            >
              {{ sidebar.drawer ? "open" : "closed" }}
            </UBadge>
            <UButton @click="sidebar.toggleDrawer()" size="sm" variant="soft"
              >Toggle</UButton
            >
          </div>
        </div>

        <USeparator />

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">mini</p>
            <p class="text-sm text-muted">Icon-only collapsed mode</p>
          </div>
          <div class="flex items-center gap-3">
            <UBadge
              :color="sidebar.mini ? 'success' : 'neutral'"
              variant="subtle"
            >
              {{ sidebar.mini ? "on" : "off" }}
            </UBadge>
            <UButton @click="sidebar.toggleMini()" size="sm" variant="soft"
              >Toggle</UButton
            >
          </div>
        </div>

        <USeparator />

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">clipped</p>
            <p class="text-sm text-muted">Clipped to toolbar</p>
          </div>
          <div class="flex items-center gap-3">
            <UBadge
              :color="sidebar.clipped ? 'success' : 'neutral'"
              variant="subtle"
            >
              {{ sidebar.clipped ? "on" : "off" }}
            </UBadge>
            <UButton @click="sidebar.toggleClipped()" size="sm" variant="soft"
              >Toggle</UButton
            >
          </div>
        </div>
      </div>

      <template #footer>
        <p class="text-xs text-muted">
          Reload the page to verify cookie persistence. Check DevTools →
          Application → Cookies.
        </p>
      </template>
    </UCard>
  </UContainer>
</template>
