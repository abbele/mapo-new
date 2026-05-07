# Login

`MapoLogin` is a self-contained sign-in form. It calls `useMapoAuth().login()`, handles loading and error state, and redirects to the page the user was trying to reach (or `/`) after a successful authentication.

## Basic usage

Create a `pages/login.vue` with `layout: false` so the admin shell is not rendered:

```vue
<!-- pages/login.vue -->
<script setup lang="ts">
definePageMeta({ layout: false });
</script>

<template>
  <MapoLogin />
</template>
```

The `auth` middleware redirects unauthenticated users to `loginUrl` (default `/login`) configured in `nuxt.config.ts`. After a successful login, `navigateTo(route.query.redirect ?? "/")` is called automatically.

## Slots

Both slots are optional. If neither is provided, the default Mapo branding is shown in the header and no footer is rendered.

### `header`

Replaces the default icon + "Sign in" heading:

```vue
<MapoLogin>
  <template #header>
    <div class="flex flex-col items-center gap-3">
      <img src="~/assets/logo.svg" class="h-10" alt="Acme" />
      <h1 class="text-xl font-semibold">Acme Admin</h1>
    </div>
  </template>
</MapoLogin>
```

### `footer`

Adds content below the sign-in button — useful for links:

```vue
<MapoLogin>
  <template #footer>
    <p class="text-center text-sm text-muted">
      <a href="https://example.com/reset" class="underline">Forgot password?</a>
    </p>
  </template>
</MapoLogin>
```

## Redirect after login

`MapoLogin` reads `route.query.redirect` to know where to send the user after login. The `auth` middleware automatically appends `?redirect=/protected-page` when it bounces an unauthenticated request. You don't need to handle this manually.

## Error handling

If the backend returns an error on login (4xx/5xx), the component catches it and shows:

```
Invalid credentials. Please try again.
```

via a `UAlert` inside the form. Customize the message by extending the component or by wrapping it and catching the error yourself with `useMapoAuth().login()`.

## Using `useMapoAuth` directly

For fully custom login UIs, use the composable directly:

```vue
<script setup lang="ts">
const { login } = useMapoAuth();
const loading = ref(false);
const error = ref<string | null>(null);

async function submit(creds: { username: string; password: string }) {
  loading.value = true;
  try {
    await login(creds);
    await navigateTo("/");
  } catch {
    error.value = "Login failed.";
  } finally {
    loading.value = false;
  }
}
</script>
```

## Component reference

### `MapoLogin`

**Props:** none

**Slots:**

| Slot     | Description                                                    |
| -------- | -------------------------------------------------------------- |
| `header` | Replaces the icon + title in the `UCard` header                |
| `footer` | Appended inside the `UCard` footer (only rendered if provided) |

**Behavior:**

- Submits `POST` to `mapo.authLoginUrl` (default `/api/auth/login`)
- On success: fetches user info, hydrates `useAuthStore`, navigates to `redirect` query param or `/`
- On error: shows inline alert, clears on next submit attempt
- Disables submit button while either field is empty or while loading
