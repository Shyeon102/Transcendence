import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/20">
            <h2 className="text-2xl font-semibold text-white">문제가 발생했어요</h2>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              className="mt-4 rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
