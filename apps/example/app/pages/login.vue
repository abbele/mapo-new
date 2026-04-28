<script setup lang="ts">
const { login } = useMapoAuth();
const toast = useToast();

const form = reactive({ username: "", password: "" });
const loading = ref(false);

async function submit() {
  loading.value = true;
  try {
    await login(form);
    toast.add({ title: "Logged in", color: "success" });
    await navigateTo("/");
  } catch (e: unknown) {
    console.error("Login failed", e);
    toast.add({
      title: "Login failed",
      description: String(e),
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UContainer class="py-10 max-w-sm">
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Login</h2>
        <p class="text-sm text-muted">
          Tests POST /api/auth/login → proxy → /api/camomilla/auth/login/
        </p>
      </template>

      <UForm :state="form" @submit="submit" class="space-y-4">
        <UFormField label="Username" name="username">
          <UInput
            v-model="form.username"
            autocomplete="username"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Password" name="password">
          <UInput
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            class="w-full"
          />
        </UFormField>
        <UButton type="submit" :loading="loading" block>Login</UButton>
      </UForm>

      <template #footer>
        <UButton to="/" variant="ghost" leading-icon="i-lucide-arrow-left"
          >Back</UButton
        >
      </template>
    </UCard>
  </UContainer>
</template>
