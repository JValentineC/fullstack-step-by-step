import { Link } from "react-router-dom";
import type { Entry } from "../data/entries";

interface EntryCardProps {
  entry: Entry;
  onDelete?: (id: number) => void;
  onTagClick?: (tag: string) => void;
}

function EntryCard({ entry, onDelete, onTagClick }: EntryCardProps) {
  function handleDelete() {
    if (window.confirm(`Delete "${entry.title}"?`)) {
      onDelete?.(entry.id);
    }
  }

  return (
    <article className="collapse collapse-arrow join-item border-base-300 border bg-base-100">
      <input type="checkbox" />
      <div className="collapse-title font-semibold flex items-center gap-2">
        <span>{entry.title}</span>
        <span className="text-xs opacity-60 ml-auto mr-6 flex items-center gap-1">
          <time dateTime={entry.createdAt}>
            {new Date(entry.createdAt).toLocaleDateString()}
          </time>
          {" · "}
          <span className="badge badge-outline badge-xs">{entry.mood}</span>
        </span>
      </div>
      <div className="collapse-content text-sm">
        <p className="mb-2">{entry.summary}</p>
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {entry.tags.map((tag) =>
              onTagClick ? (
                <button
                  key={tag}
                  type="button"
                  className="badge badge-primary badge-sm cursor-pointer"
                  onClick={() => onTagClick(tag)}
                >
                  #{tag}
                </button>
              ) : (
                <span key={tag} className="badge badge-sm">
                  #{tag}
                </span>
              ),
            )}
          </div>
        )}
        {onDelete && (
          <div className="flex justify-end gap-2 mt-2">
            <Link
              to={`/entries/${entry.id}/edit`}
              className="btn btn-sm btn-ghost"
            >
              Edit
            </Link>
            <button
              type="button"
              className="btn btn-sm btn-error"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default EntryCard;
