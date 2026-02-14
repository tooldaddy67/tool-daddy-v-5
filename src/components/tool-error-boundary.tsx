'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    toolName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ToolErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error in tool:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="container mx-auto py-20 px-4 max-w-2xl text-center">
                    <Card className="glass-panel border-red-500/20 bg-red-500/5">
                        <CardHeader className="flex flex-col items-center">
                            <div className="p-4 rounded-full bg-red-500/10 mb-4">
                                <AlertCircle className="h-12 w-12 text-red-500" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-red-500">
                                Something went wrong
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-muted-foreground">
                                We encountered an unexpected error while running {this.props.toolName || 'this tool'}.
                                Your browser data is safe, but the tool needs to be restarted.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={this.handleReset}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold"
                                >
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    Try Again
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/">
                                        <Home className="mr-2 h-4 w-4" />
                                        Back to Home
                                    </Link>
                                </Button>
                            </div>

                            {process.env.NODE_ENV === 'development' && (
                                <div className="mt-8 pt-6 border-t border-red-500/10 text-left">
                                    <p className="text-xs font-mono text-red-400 overflow-x-auto whitespace-pre-wrap">
                                        {this.state.error?.toString()}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
