<script lang="ts">
  import { onMount } from 'svelte';
  import { db } from '$lib/db';
  import type { Note, NoteColor, TabKey } from '$lib/types';
  import BottomNavigation from '$lib/components/BottomNavigation.svelte';
  import NoteCard from '$lib/components/NoteCard.svelte';
  import { themeMode } from '$lib/stores/theme';
  import {
    Archive,
    Bold,
    CheckCheck,
    Palette,
    Pin,
    Search,
    Tag,
    Trash2,
    Plus,
    NotebookText,
    Sparkles
  } from 'lucide-svelte';

  const tagSuggestions = ['Daily', 'Work', 'Ideas', 'Personal', 'Inbox', 'Travel', 'Shopping'];
  const noteColors: NoteColor[] = ['amber', 'sage', 'slate', 'rose'];

  let activeTab = $state<TabKey>('notes');
  let notes = $state<Note[]>([]);
  let selectedNoteId = $state<string | null>(null);
  let draftTitle = $state('');
  let draftBody = $state('');
  let draftColor = $state<NoteColor>('amber');
  let searchQuery = $state('');
  let quickMenuOpen = $state(false);

  const libraryNotes = $derived(
    [...notes]
      .filter((note) => !note.archived)
      .sort((a, b) => b.updatedAt - a.updatedAt)
  );

  const searchResults = $derived(
    [...notes]
      .filter((note) => !note.archived)
      .filter((note) => {
        const value = searchQuery.trim().toLowerCase();
        if (!value) return true;
        return `${note.title} ${note.body} ${note.tags.join(' ')}`.toLowerCase().includes(value);
      })
      .sort((a, b) => b.updatedAt - a.updatedAt)
  );

  function countWords(value: string): number {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }

  function extractTags(value: string): string[] {
    const hashtags = value.match(/#[\w-]+/g) ?? [];
    return hashtags.map((tag) => tag.replace('#', '').toLowerCase());
  }

  function selectedNote() {
    return notes.find((note) => note.id === selectedNoteId) ?? null;
  }

  function chooseNote(note: Note | null) {
    if (!note) {
      selectedNoteId = null;
      draftTitle = '';
      draftBody = '';
      draftColor = 'amber';
      return;
    }

    selectedNoteId = note.id;
    draftTitle = note.title;
    draftBody = note.body;
    draftColor = note.color;
  }

  async function loadNotes() {
    notes = await db.notes.orderBy('updatedAt').reverse().toArray();

    if (!selectedNoteId && notes.length > 0) {
      chooseNote(notes[0]);
    }
  }

  async function saveNote() {
    const current = selectedNoteId ? notes.find((note) => note.id === selectedNoteId) ?? null : null;
    const trimmedTitle = draftTitle.trim();
    const trimmedBody = draftBody.trim();

    if (!trimmedTitle && !trimmedBody) {
      return;
    }

    const payload: Note = {
      id: current?.id ?? crypto.randomUUID(),
      title: trimmedTitle || 'Sans titre',
      body: trimmedBody,
      tags: extractTags(`${trimmedTitle} ${trimmedBody}`),
      createdAt: current?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
      pinned: current?.pinned ?? false,
      archived: current?.archived ?? false,
      color: draftColor
    };

    await db.notes.put(payload);
    await loadNotes();
    selectedNoteId = payload.id;
    chooseNote(payload);
  }

  async function togglePin() {
    const current = selectedNote();
    if (!current) return;

    const next = { ...current, pinned: !current.pinned, updatedAt: Date.now() };
    await db.notes.put(next);
    await loadNotes();
    chooseNote(next);
  }

  async function archiveSelected() {
    const current = selectedNote();
    if (!current) return;

    const next = { ...current, archived: !current.archived, updatedAt: Date.now() };
    await db.notes.put(next);
    await loadNotes();
    if (activeTab === 'notes') {
      chooseNote(next);
    }
  }

  async function deleteSelected() {
    const current = selectedNote();
    if (!current) return;

    await db.notes.delete(current.id);
    await loadNotes();
    const nextSelection = notes.find((note) => note.id !== current.id) ?? null;
    chooseNote(nextSelection);
  }

  function applyFormatting(kind: 'bold' | 'list') {
    const prefix = kind === 'bold' ? '**' : '- ';
    const suffix = kind === 'bold' ? '**' : '';
    const existing = draftBody.trim();
    draftBody = `${existing ? `${existing}\n` : ''}${prefix}${existing || 'texte'}${suffix}`;
  }

  function cycleColor() {
    const currentIndex = noteColors.indexOf(draftColor);
    const nextIndex = (currentIndex + 1) % noteColors.length;
    draftColor = noteColors[nextIndex];
  }

  function addTag(tag: string) {
    const content = draftBody.trim();
    const normalized = content.length ? `${content} #${tag}` : `#${tag}`;
    draftBody = normalized;
  }

  async function handleQuickCreate(type: 'note' | 'todo' | 'list') {
    const template = {
      note: 'Nouvelle idée',
      todo: 'À faire',
      list: 'Liste'
    };

    draftTitle = template[type];
    draftBody = type === 'todo' ? '- [ ] Première tâche\n- [ ] Deuxième tâche' : type === 'list' ? '- Élément 1\n- Élément 2\n- Élément 3' : 'Une pensée rapide...';
    selectedNoteId = null;
    quickMenuOpen = false;
    activeTab = 'notes';
  }

  onMount(async () => {
    await loadNotes();

    if (!selectedNoteId && notes.length > 0) {
      chooseNote(notes[0]);
    }
  });
</script>

<svelte:head>
  <title>Quick Notes</title>
</svelte:head>

<div class="app-shell">
  <main class="app-layout">
    {#if activeTab === 'notes'}
      <section class="screen notes-screen">
        <header class="screen-header">
          <div>
            <p class="eyebrow">Aujourd’hui</p>
            <h1>Notes</h1>
          </div>
          <button class="save-button" type="button" onclick={saveNote}>Enregistrer</button>
        </header>

        <article class="editor-card card-surface">
          <div class="editor-header">
            <input
              class="note-title"
              bind:value={draftTitle}
              placeholder="Titre de la note"
              maxlength="80"
              aria-label="Titre de la note"
            />
          </div>

          <textarea
            class="note-body"
            bind:value={draftBody}
            placeholder="Écris ta pensée du jour..."
            aria-label="Corps de la note"
          ></textarea>

          <div class="tag-suggestions" aria-label="Suggestions de tags">
            {#each tagSuggestions as tag}
              <button class="tag-chip" type="button" onclick={() => addTag(tag)}>
                #{tag}
              </button>
            {/each}
          </div>

          <div class="editor-footer">
            <span class="word-count">{countWords(draftBody)} mots</span>
            <div class="status-inline">
              {#if selectedNote()}
                <span>Modifiée le {new Date(selectedNote()!.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
              {:else}
                <span>Nouvelle note</span>
              {/if}
            </div>
          </div>

          <div class="toolbar" aria-label="Actions de mise en forme">
            <button class="toolbar-button" type="button" onclick={() => applyFormatting('bold')} aria-label="Mettre en gras">
              <Bold size={16} />
            </button>
            <button class="toolbar-button" type="button" onclick={() => applyFormatting('list')} aria-label="Créer une liste">
              <CheckCheck size={16} />
            </button>
            <button class="toolbar-button" type="button" onclick={togglePin} aria-label="Épingler la note">
              <Pin size={16} />
            </button>
            <button class="toolbar-button" type="button" onclick={cycleColor} aria-label="Changer la couleur de la note">
              <Palette size={16} />
            </button>
          </div>
        </article>
      </section>
    {/if}

    {#if activeTab === 'library'}
      <section class="screen">
        <header class="screen-header">
          <div>
            <p class="eyebrow">Archive</p>
            <h1>Bibliothèque</h1>
          </div>
        </header>

        <div class="notes-list">
          {#if libraryNotes.length === 0}
            <div class="empty-state">
              <NotebookText size={28} />
              <p>Aucune note pour le moment.</p>
            </div>
          {:else}
            {#each libraryNotes as note (note.id)}
              <NoteCard
                note={note}
                selected={selectedNoteId === note.id}
                onSelect={() => { activeTab = 'notes'; chooseNote(note); }}
                onTogglePin={async () => {
                  const current = {...note};
                  await db.notes.put({ ...current, pinned: !current.pinned, updatedAt: Date.now() });
                  await loadNotes();
                }}
                onArchive={async () => {
                  await db.notes.put({ ...note, archived: true, updatedAt: Date.now() });
                  await loadNotes();
                }}
                onDelete={async () => {
                  await db.notes.delete(note.id);
                  await loadNotes();
                }}
              />
            {/each}
          {/if}
        </div>
      </section>
    {/if}

    {#if activeTab === 'search'}
      <section class="screen">
        <header class="screen-header">
          <div>
            <p class="eyebrow">Filtre</p>
            <h1>Recherche</h1>
          </div>
        </header>

        <div class="search-panel card-surface">
          <label class="search-field" for="search-notes">
            <Search size={18} />
            <input id="search-notes" bind:value={searchQuery} placeholder="Rechercher dans les notes" />
          </label>
        </div>

        <div class="notes-list">
          {#if searchResults.length === 0}
            <div class="empty-state">
              <Sparkles size={28} />
              <p>Aucune correspondance.</p>
            </div>
          {:else}
            {#each searchResults as note (note.id)}
              <NoteCard
                note={note}
                selected={selectedNoteId === note.id}
                onSelect={() => { activeTab = 'notes'; chooseNote(note); }}
                onTogglePin={async () => {
                  await db.notes.put({ ...note, pinned: !note.pinned, updatedAt: Date.now() });
                  await loadNotes();
                }}
                onArchive={async () => {
                  await db.notes.put({ ...note, archived: true, updatedAt: Date.now() });
                  await loadNotes();
                }}
                onDelete={async () => {
                  await db.notes.delete(note.id);
                  await loadNotes();
                }}
              />
            {/each}
          {/if}
        </div>
      </section>
    {/if}

    {#if activeTab === 'settings'}
      <section class="screen">
        <header class="screen-header">
          <div>
            <p class="eyebrow">App</p>
            <h1>Réglages</h1>
          </div>
        </header>

        <div class="settings-stack">
          <div class="settings-card card-surface">
            <div class="setting-row">
              <span>Thème</span>
              <div class="theme-switcher">
                {#each ['system', 'light', 'dark'] as option}
                  <button
                    class="theme-option"
                    class:active={$themeMode === option}
                    type="button"
                    onclick={() => themeMode.set(option as 'system' | 'light' | 'dark')}
                  >
                    {option === 'system' ? 'Système' : option === 'light' ? 'Clair' : 'Sombre'}
                  </button>
                {/each}
              </div>
            </div>
          </div>

          <div class="settings-card card-surface">
            <div class="setting-row info-row">
              <div>
                <p class="label">Version</p>
                <strong>Quick Notes v0.1</strong>
              </div>
              <div>
                <p class="label">Stockage</p>
                <strong>IndexedDB</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    {/if}
  </main>

  <BottomNavigation bind:activeTab={activeTab} onCreate={handleQuickCreate} />
</div>

<style>
  .app-shell {
    min-height: 100vh;
    background: var(--bg);
    color: var(--ink);
  }

  .app-layout {
    max-width: 920px;
    margin: 0 auto;
    padding: 20px 16px calc(var(--safe-bottom) + 120px);
  }

  .screen {
    display: grid;
    gap: 18px;
  }

  .screen-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 12px;
  }

  .eyebrow {
    font-size: var(--text-caption);
    line-height: var(--line-caption);
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 700;
  }

  h1 {
    font-size: var(--text-h1);
    line-height: var(--line-h1);
    font-weight: 800;
  }

  .save-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    padding: 8px 14px;
    border-radius: 999px;
    background: var(--surface);
    color: var(--ink);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-soft);
    font-weight: 700;
  }

  .card-surface {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-container);
    box-shadow: var(--shadow-soft);
  }

  .editor-card {
    display: grid;
    gap: 14px;
    padding: 16px;
  }

  .editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .note-title {
    width: 100%;
    font-size: 1.25rem;
    font-weight: 800;
    line-height: 1.3;
    color: var(--ink);
    border: none;
    padding: 0;
  }

  .note-title::placeholder,
  .note-body::placeholder,
  .search-field input::placeholder {
    color: var(--muted);
  }

  .note-body {
    min-height: 230px;
    border: none;
    resize: vertical;
    width: 100%;
    font-size: 1.05rem;
    line-height: 1.7;
    color: var(--ink);
    background: transparent;
    padding: 0;
  }

  .tag-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag-chip {
    padding: 7px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
    border: 1px solid var(--border);
    color: var(--ink);
    font-weight: 700;
    font-size: 0.76rem;
  }

  .editor-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: var(--muted);
    font-size: 0.78rem;
    font-weight: 700;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 4px;
  }

  .toolbar-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid var(--border);
    color: var(--ink);
  }

  .notes-list,
  .settings-stack {
    display: grid;
    gap: 14px;
  }

  .empty-state {
    display: grid;
    place-items: center;
    gap: 10px;
    min-height: 180px;
    padding: 24px;
    text-align: center;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-container);
    color: var(--muted);
    box-shadow: var(--shadow-soft);
  }

  .search-panel {
    padding: 12px 14px;
  }

  .search-field {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 52px;
    padding: 8px 12px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--border);
    color: var(--muted);
  }

  .search-field input {
    width: 100%;
    border: none;
    font-size: 0.96rem;
    color: var(--ink);
  }

  .settings-card {
    padding: 18px 16px;
  }

  .setting-row {
    display: grid;
    gap: 12px;
  }

  .theme-switcher {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .theme-option {
    min-height: 40px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid var(--border);
    color: var(--muted);
    background: transparent;
    font-weight: 700;
  }

  .theme-option.active {
    background: var(--highlight);
    color: var(--ink);
  }

  .info-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .label {
    font-size: 0.76rem;
    color: var(--muted);
    letter-spacing: 0.04em;
    margin-bottom: 6px;
    text-transform: uppercase;
  }

  strong {
    font-size: 0.96rem;
  }

  @media (min-width: 680px) {
    .app-layout {
      padding-left: 26px;
      padding-right: 26px;
    }
  }
</style>
