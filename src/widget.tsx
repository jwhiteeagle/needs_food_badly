import type { ReactNode } from "react";

// Loading, retry and empty messages for a data-backed card section
export type FeedState = {
  error: string;
  onRetry: () => void;
  loading?: boolean;
  loadingText?: string;
  empty?: boolean;
  emptyText?: string;
};

export function FeedStatus({
  error,
  onRetry,
  loading = false,
  loadingText,
  empty = false,
  emptyText,
}: FeedState) {
  return (
    <>
      {error && (
        <p className="market-error" role="status">
          {error}{" "}
          <button type="button" onClick={onRetry}>
            Try again
          </button>
        </p>
      )}
      {loading && !error && (
        <p className="market-message" role="status">
          {loadingText}
        </p>
      )}
      {empty && <p className="market-message">{emptyText}</p>}
    </>
  );
}

// Shared widget shape: a header over an adaptive grid of item cards
// Toolbar, feed messages and footer sit outside the grid so they never take a card slot
// Non-empty groups replace the children grid with one titled grid per group
export function Widget({
  title,
  headingId,
  subheading,
  description,
  toolbar,
  feed,
  groups,
  footer,
  children,
}: {
  title: string;
  headingId: string;
  subheading?: ReactNode;
  description?: ReactNode;
  toolbar?: ReactNode;
  feed?: FeedState;
  groups?: { title: string; items: ReactNode }[];
  footer?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="widget" aria-labelledby={headingId}>
      <header className="widget-header">
        <h3 id={headingId} className="widget-title">
          {title}
        </h3>
        {subheading && <p className="widget-subheading">{subheading}</p>}
        {description && <p className="widget-description">{description}</p>}
      </header>
      {toolbar && <div className="widget-toolbar">{toolbar}</div>}
      {feed && <FeedStatus {...feed} />}
      {groups?.length ? (
        groups.map(({ title, items }, index) => (
          <section
            key={title}
            className="widget-group"
            aria-labelledby={`${headingId}-group-${index}`}
          >
            <h4
              id={`${headingId}-group-${index}`}
              className="widget-group-title"
            >
              {title}
            </h4>
            <div className="widget-body">{items}</div>
          </section>
        ))
      ) : (
        <div className="widget-body">{children}</div>
      )}
      {footer}
    </section>
  );
}
