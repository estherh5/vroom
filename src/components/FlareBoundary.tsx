import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportError } from "../lib/flare";

// PORTED from flare/reporters/next/app/global-error.tsx, by way of
// methods/src/components/FlareBoundary.tsx — React has no hook equivalent of a
// root error boundary, so this is a class component using componentDidCatch
// instead of Next's error-page file convention. No <html>/<body> wrapper: this
// mounts inside vroom's own index.html, which already owns those tags.
//
// The copy is the fleet's, deliberately — every crash screen in every app says
// the same three things, so a reader who has seen one has seen them all. The
// LOOK is vroom's, equally deliberately: methods' cream-and-ink version would
// read as a different product dropped into the middle of this one.
//
// Colors are vroom's own, and the two text pairs were measured rather than
// eyeballed: #ffa500 on #000000 is 11.0:1 and #dedede on #000000 is 15.3:1,
// both far past the 4.5:1 floor. Note what is NOT here — orange is never body
// text on white, where it manages only 2.0:1.
//
// Styles are inline because this file is a port that must stay portable: it
// carries no class names, so it cannot be broken by a stylesheet it does not
// own, and it still renders correctly if the CSS bundle is the thing that
// failed to load. `outline` is deliberately never set, so the browser's own
// focus ring survives for keyboard users.

type Props = { children: ReactNode };
type State = { error: Error | null };

export class FlareBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    void reportError(error, { kind: "client", componentStack: info.componentStack });
  }

  private reset = (): void => this.setState({ error: null });

  render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "1.5rem",
          background: "#000000",
          color: "#dedede",
          font: "400 1rem/1.55 'Source Sans Pro', system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: "26rem", textAlign: "center" }}>
          <h1
            style={{
              font: "400 2.5rem/1.1 'Racing Sans One', system-ui, sans-serif",
              color: "#ffa500",
              margin: "0 0 0.75rem",
            }}
          >
            This page stopped working
          </h1>
          <p style={{ margin: "0 0 1.75rem", color: "#dedede" }}>
            The error was reported automatically. Trying again often works.
          </p>
          <button
            type="button"
            onClick={this.reset}
            style={{
              font: "600 0.95rem/1 'Source Sans Pro', system-ui, sans-serif",
              padding: "0.75rem 1.4rem",
              minHeight: "44px",
              border: "2px solid #ffa500",
              borderRadius: "4px",
              background: "#ffa500",
              color: "#000000",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </div>
    );
  }
}
