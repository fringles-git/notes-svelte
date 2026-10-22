<script lang="ts">
  import type { NoteColor } from '$lib/types';

  let { note, selected = false, onSelect = () => {}, onTogglePin = () => {}, onArchive = () => {}, onDelete = () => {} } = $props();

  const noteColors: Record<NoteColor, string> = {
    amber: 'card-amber',
    sage: 'card-sage',
    slate: 'card-slate',
    rose: 'card-rose'
  };

  const excerpt = (value: string) => {
    const cleaned = value.replace(/\s+/g, ' ').trim();
    return cleaned.length > 120 ? `${cleaned.slice(0, 120)}…` : cleaned;
  };
</script>

<article class={`note-card ${selected ? 'selected' : ''} ${noteColors[note.color]}`} onclick={onSelect} role="button" tabindex="0" onkeydown={(event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onSelect();
  }
}}>
  <header class="note-card-head">
    <div>
      {#if note.pinned}
        <span class="pin-badge">Épinglée</span>
      {/if}
      <h3>{note.title || 'Sans titre'}</h3>
    </div>

    <div class="note-card-actions">
      <button class="mini-button" type="button" aria-label="Épingler la note" onclick={(event) => { event.stopPropagation(); onTogglePin(); }}>
        <span>📌</span>
      </button>
      <button class="mini-button" type="button" aria-label="Archiver la note" onclick={(event) => { event.stopPropagation(); onArchive(); }}>
        <span>🗃</span>
      </button>
      <button class="mini-button danger" type="button" aria-label="Supprimer la note" onclick={(event) => { event.stopPropagation(); onDelete(); }}>
        <span>🗑</span>
      </button>
    </div>
  </header>

  <p class="note-card-copy">{excerpt(note.body)}</p>

  {#if note.tags.length > 0}
    <div class="tag-row">
      {#each note.tags as tag}
        <span class="tag-pill">#{tag}</span>
      {/each}
    </div>
  {/if}

  <footer class="note-card-footer">
    <span>{new Date(note.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
    <span>{note.archived ? 'Archivée' : 'Active'}</span>
  </footer>
</article>

<style>
  .note-card {
    display: grid;
    gap: 14px;
    padding: 16px 16px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    background: var(--surface);
    box-shadow: var(--shadow-soft);
    transition: transform var(--duration-fast) ease, border-color var(--duration-fast) ease;
    cursor: pointer;
  }

  .note-card.selected {
    border-color: rgba(217, 163, 90, 0.5);
    box-shadow: 0 12px 30px rgba(217, 163, 90, 0.12);
  }

  .note-card:hover {
    transform: translateY(-1px);
  }

  .card-amber {
    background: linear-gradient(180deg, rgba(239, 218, 178, 0.22), rgba(239, 218, 178, 0.08));
  }

  .card-sage {
    background: linear-gradient(180deg, rgba(128, 170, 138, 0.16), rgba(128, 170, 138, 0.05));
  }

  .card-slate {
    background: linear-gradient(180deg, rgba(94, 112, 136, 0.12), rgba(94, 112, 136, 0.04));
  }

  .card-rose {
    background: linear-gradient(180deg, rgba(196, 152, 138, 0.12), rgba(196, 152, 138, 0.04));
  }

  .note-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .pin-badge {
    display: inline-flex;
    margin-bottom: 6px;
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--muted);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .note-card-head h3 {
    font-size: 1.05rem;
    line-height: 1.3;
    font-weight: 700;
    color: var(--ink);
  }

  .note-card-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .mini-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid var(--border);
  }

  .mini-button.danger {
    color: #b95555;
  }

  .note-card-copy {
    color: var(--muted);
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag-pill {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    color: var(--muted);
    font-size: 0.7rem;
    font-weight: 700;
  }

  .note-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--muted);
    font-size: 0.74rem;
    font-weight: 700;
  }
</style>
