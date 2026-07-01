'use client';

interface AuthLoadingOverlayProps {
    message?: string;
}

export function AuthLoadingOverlay({ message = 'Signing you in...' }: AuthLoadingOverlayProps) {
    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">I</span>
                </div>
                <div className="w-10 h-10 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-slate-300 text-sm font-medium">{message}</p>
            </div>
        </div>
    );
}
