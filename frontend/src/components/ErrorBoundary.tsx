import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>문제가 발생했어요</h2>
          <button onClick={() => window.location.href = '/'}>
            홈으로 돌아가기
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
