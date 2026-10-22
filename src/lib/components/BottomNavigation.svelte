<script lang="ts">
  import { FileText, Library, Search, Settings, Plus, NotebookPen, ListTodo, PenSquare } from '@lucide/svelte';
  import type { TabKey } from '$lib/types';

  let {
    activeTab = $bindable('notes' as TabKey),
    onCreate = () => {}
  } = $props();

  const tabs = [
    { key: 'notes', label: 'Notes', icon: FileText },
    { key: 'library', label: 'Bibliothèque', icon: Library },
    { key: 'search', label: 'Recherche', icon: Search },
    { key: 'settings', label: 'Réglages', icon: Settings }
  ] as const;

  let quickMenuOpen = $state(false);
  let pressTimer: ReturnType<typeof window.setTimeout> | undefined;

  function setTab(tab: TabKey) {
    activeTab = tab;
    quickMenuOpen = false;
  }

  function beginLongPress() {
    pressTimer = window.setTimeout(() => {
      quickMenuOpen = true;
    }, 450);
  }

  function cancelLongPress() {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = undefined;
    }
  }

  function handleQuickAction(type: 'note' | 'todo' | 'list') {
    quickMenuOpen = false;
    onCreate(type);
  }
</script>

<nav class="tabbar" aria-label="Navigation principale">
  <div class="tabbar-shell">
    {#each tabs as tab}
      <button
        class="tab"
        type="button"
        class:active={activeTab === tab.key}
        aria-current={activeTab === tab.key ? 'page' : undefined}
        onclick={() => setTab(tab.key)}
      >
        <svelte:component this={tab.icon} size={22} />
        <span>{tab.label}</span>
      </button>
    {/each}

    <button
      class="add-button"
      type="button"
      aria-label="Créer une note rapide"
      onpointerdown={beginLongPress}
      onpointerup={cancelLongPress}
      onpointerleave={cancelLongPress}
      onpointercancel={cancelLongPress}
      onclick={() => onCreate('note')}
    >
      <Plus size={32} strokeWidth={2.6} />
    </button>
  </div>

  {#if quickMenuOpen}
    <div class="quick-menu" role="menu" aria-label="Actions rapides">
      <button class="menu-item" type="button" role="menuitem" onclick={() => handleQuickAction('note')}>
        <NotebookPen size={18} />
        <span>Note rapide</span>
      </button>
      <button class="menu-item" type="button" role="menuitem" onclick={() => handleQuickAction('todo')}>
        <ListTodo size={18} />
        <span>To-do</span>
      </button>
      <button class="menu-item" type="button" role="menuitem" onclick={() => handleQuickAction('list')}>
        <PenSquare size={18} />
        <span>Liste</span>
      </button>
    </div>
  {/if}
</nav>

<style>
  .tabbar {
    position: sticky;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 30;
    display: flex;
    justify-content: center;
    padding: 0 0 calc(var(--safe-bottom) + 12px);
  }

  .tabbar-shell {
    position: relative;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
    align-items: center;
    gap: 10px;
    width: min(100%, 920px);
    padding: 12px 10px 12px 10px;
    background: rgba(255, 255, 255, 0.46);
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    box-shadow: var(--shadow-soft);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  :global([data-theme='dark']) .tabbar-shell {
    background: rgba(25, 25, 25, 0.64);
  }

  .tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 68px;
    gap: 7px;
    border-radius: var(--radius-pill);
    color: var(--muted);
    padding: 8px 8px 10px;
    transition: background var(--duration-fast) ease, color var(--duration-fast) ease, transform var(--duration-fast) ease;
  }

  .tab span {
    font-size: 0.82rem;
    line-height: 1.1;
    font-weight: 700;
  }

  .tab.active {
    background: var(--highlight);
    color: var(--ink);
    box-shadow: 0 8px 18px rgba(217, 163, 90, 0.12);
  }

  .add-button {
    display: grid;
    place-items: center;
    width: 76px;
    height: 76px;
    border-radius: 28px;
    background: var(--accent);
    color: var(--ink);
    box-shadow: 0 14px 26px rgba(217, 163, 90, 0.24);
    transition: transform var(--duration-fast) ease, box-shadow var(--duration-fast) ease;
  }

  .add-button:active {
    transform: scale(0.96);
  }

  .quick-menu {
    position: absolute;
    right: 12px;
    bottom: 96px;
    display: grid;
    gap: 8px;
    width: min(246px, calc(100vw - 36px));
    padding: 8px;
    border-radius: 20px;
    background: var(--surface-strong);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-strong);
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 46px;
    padding: 0 14px;
    border-radius: 13px;
    color: var(--ink);
    background: transparent;
    transition: background var(--duration-fast) ease;
  }

  .menu-item:hover {
    background: rgba(239, 218, 178, 0.2);
  }

  @media (max-width: 440px) {
    .tabbar-shell {
      gap: 6px;
      padding: 10px 8px;
    }

    .tab {
      min-height: 62px;
    }

    .tab span {
      font-size: 0.74rem;
    }

    .add-button {
      width: 70px;
      height: 70px;
    }
  }
</style>
