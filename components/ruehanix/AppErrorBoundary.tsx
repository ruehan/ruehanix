"use client";

import { Component, type ReactNode } from "react";
import { notify } from "@/lib/ruehanix/toast";

interface Props {
  /** 표시용 앱 이름. 토스트·fallback 헤더에 노출. */
  appName: string;
  children: ReactNode;
  /** 재시도 시 부모에서 함께 처리할 정리 로직(상태 복구 등). */
  onRetry?: () => void;
}

interface State {
  error: Error | null;
}

/**
 * 앱 본문 격리 경계. 한 앱이 throw 해도 데스크톱 셸과 다른 앱은 영향받지 않는다.
 * fallback UI 는 role="alert" 으로 노출되어 보조기술에 즉시 전달된다.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    notify(`${this.props.appName} 앱 오류`);
    // 진단 정보는 devtools 에 남긴다. 콘솔 노이즈는 운영에서 의도적으로 허용.
    console.error("[AppErrorBoundary]", this.props.appName, error);
  }

  retry = (): void => {
    this.setState({ error: null });
    this.props.onRetry?.();
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          role="alert"
          style={{
            padding: 24,
            color: "var(--ov0)",
            textAlign: "center",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--sub1)" }}>
            {this.props.appName} 앱에 문제가 생겼어요
          </div>
          <div style={{ fontSize: 11.5 }}>화면 일부가 일시적으로 비활성화되었습니다</div>
          <button
            type="button"
            onClick={this.retry}
            style={{
              marginTop: 6,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text)",
              background: "var(--surface0)",
              border: "1px solid var(--surf0)",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}