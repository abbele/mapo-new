<script setup lang="ts">
const auth = useAuthStore();

const links = [
  {
    label: "Login",
    to: "/login",
    description:
      "Test useMapoAuth().login() → POST /api/auth/login → proxy → Camomilla",
  },
  {
    label: "Auth status",
    to: "/auth-status",
    description:
      "Inspect auth store: token, user info, permissions, model permissions",
  },
  {
    label: "CRUD — contents",
    to: "/crud",
    description: "Test useCrud() list / create / delete against /api/contents/",
  },
  {
    label: "Protected page",
    to: "/protected",
    description:
      "Requires auth middleware — redirects to /login if not authenticated",
  },
  {
    label: "Permissions",
    to: "/permissions",
    description: "Test usePermissions() can() and hasRole()",
  },
  {
    label: "Sidebar store",
    to: "/sidebar",
    description: "Test useSidebarStore toggle + cookie persistence",
  },
  {
    label: "Snackbar",
    to: "/snack",
    description: "Test useSnackStore show() with different types",
  },
  {
    label: "Confirm dialog",
    to: "/confirm",
    description: "Test useConfirmStore open()",
  },
  {
    label: "Multipart upload",
    to: "/multipart",
    description: "Test useCrud().create() with File — auto multipart detection",
  },
];
</script>

<template>
  <UContainer class="py-10">
    <UPageHero
      title="Mapo Example"
      description="Test suite for @mapomodule/core, @mapomodule/store and mapo-integrations-camomilla"
    >
      <template #links>
        <UBadge
          :color="auth.isAuthenticated ? 'success' : 'neutral'"
          variant="subtle"
          size="lg"
        >
          {{
            auth.isAuthenticated
              ? `✅ logged in as ${auth.username}`
              : "❌ not authenticated"
          }}
        </UBadge>
      </template>
    </UPageHero>

    <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <UCard v-for="link in links" :key="link.to">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="font-semibold">
              {{ link.label }}
            </p>
            <p class="text-sm text-muted mt-1">
              {{ link.description }}
            </p>
          </div>
          <UButton
            :to="link.to"
            variant="soft"
            size="sm"
            trailing-icon="i-lucide-arrow-right"
          >
            Open
          </UButton>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
