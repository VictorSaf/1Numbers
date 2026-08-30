import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** Changing this resets the boundary, so navigating away clears a failed route. */
  resetKey: string;
  labels: { title: string; body: string; retry: string };
}

interface State {
  failedAt: string | null;
}

/**
 * A boundary around the lazily-loaded route, not around the whole app.
 *
 * Every page except the calculator arrives through React.lazy, so a chunk that
 * cannot be fetched -- a deploy landed while the tab was open, the network went
 * away mid-navigation -- rejects inside Suspense. The only boundary used to be
 * at the root, which meant one missing chunk blanked the entire application,
 * navigation included.
 *
 * Here the header and the rest of the shell survive, and the person gets a
 * retry. Retrying works because the import is attempted again: a failed dynamic
 * import is not cached as a failure by the browser.
 */
export class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { failedAt: null };

  static getDerivedStateFromError(): Partial<State> {
    return { failedAt: 'error' };
  }

  componentDidUpdate(prev: Props) {
    // A different route means a different chunk; give it a clean try.
    if (prev.resetKey !== this.props.resetKey && this.state.failedAt) {
      this.setState({ failedAt: null });
    }
  }

  componentDidCatch(error: Error) {
    console.error('Route chunk failed to load:', error);
  }

  render() {
    if (!this.state.failedAt) return this.props.children;

    const { title, body, retry } = this.props.labels;
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="font-heading text-2xl text-gradient-gold">{title}</h2>
          <p className="text-muted-foreground">{body}</p>
          <Button onClick={() => this.setState({ failedAt: null })} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {retry}
          </Button>
        </div>
      </div>
    );
  }
}
