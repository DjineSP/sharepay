"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, QrCode } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface QrCodeDialogProps {
    url: string;
    title: string;
}

export function QrCodeDialog({ url, title }: QrCodeDialogProps) {
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleDownload = () => {
        const canvas = canvasRef.current?.querySelector("canvas");
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = `qr-${title.toLowerCase().replace(/\s+/g, "-")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast.success("QR Code téléchargé");
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    title="Afficher le QR Code"
                >
                    <QrCode className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <DialogHeader>
                    <DialogTitle className="truncate">{title}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-6 py-2">
                    <div ref={canvasRef} className="p-4 bg-white rounded-2xl shadow-inner border">
                        <QRCodeCanvas
                            value={url.replace(/^http:\/\//, "https://")}
                            size={220}
                            level="H"
                            marginSize={1}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground text-center break-all px-2">{url}</p>
                    <Button onClick={handleDownload} className="w-full gap-2">
                        <Download className="h-4 w-4" />
                        Télécharger le QR Code
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
