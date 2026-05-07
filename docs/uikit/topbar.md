# Topbar

`MapoTopbar` is the horizontal header bar rendered at the top of the admin shell. It handles the sidebar drawer toggle and exposes three slots for custom content.

## Slots

| Slot      | Description                                               |
| --------- | --------------------------------------------------------- |
| `left`    | Left of the topbar, after the drawer-open button          |
| `default` | Center / fill area                                        |
| `right`   | Right side — ideal for actions, user menus, notifications |

## Customizing from app.vue

```vue
<!-- app.vue -->
<NuxtLayout>
  <template #topbar:right>
    <UButton
      icon="i-lucide-bell"
      variant="ghost"
      color="neutral"
      size="sm"
    />
    <UAvatar alt="Admin" size="xs" />
  </template>

  <NuxtPage />
</NuxtLayout>
```

## Adding a breadcrumb

```vue
<template #topbar:default>
  <UBreadcrumb :items="breadcrumbs" />
</template>
```

## Adding a search bar

```vue
<template #topbar:default>
  <UInput
    v-model="q"
    icon="i-lucide-search"
    placeholder="Search..."
    size="sm"
    class="max-w-xs"
  />
</template>
```

## Drawer toggle behavior

When the sidebar drawer is closed (`sidebar.drawer === false`), the topbar automatically shows a button to reopen it (`i-lucide-panel-left-open`). When the sidebar is open, the toggle button lives inside the sidebar header instead. This is handled internally — you don't need to wire it up.

## Component reference

### `MapoTopbar`

**Props:** none

**Slots:**

| Slot      | Type | Description                                                |
| --------- | ---- | ---------------------------------------------------------- |
| `left`    | —    | Content injected to the left                               |
| `default` | —    | Center content (flex-1, fills available space)             |
| `right`   | —    | Content injected to the right (items aligned with `gap-2`) |
