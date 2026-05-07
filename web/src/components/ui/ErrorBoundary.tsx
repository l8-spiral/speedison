"use client";
import { Component, type ReactNode } from "react";

type State = { hasError: boolean };
type Props = { fallback: ReactNode; children: ReactNode };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: Error) { console.error("ErrorBoundary:", err); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}
