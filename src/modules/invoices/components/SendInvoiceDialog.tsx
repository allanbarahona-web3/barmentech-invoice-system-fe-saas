"use client";

import { useState } from "react";
import { Copy, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { t } from "@/i18n";

interface SendInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNumber: string;
  customerEmail?: string;
  invoiceUrl: string;
  onSend?: (toEmail?: string, message?: string) => void | Promise<void>;
}

export function SendInvoiceDialog({
  open,
  onOpenChange,
  invoiceNumber,
  customerEmail = "",
  invoiceUrl,
  onSend,
}: SendInvoiceDialogProps) {
  const [email, setEmail] = useState(customerEmail);
  const [message, setMessage] = useState(
    t().invoiceActions.defaultMessage.replace("{invoiceNumber}", invoiceNumber)
  );
  const [sending, setSending] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invoiceUrl);
      toast.success(t().invoiceActions.linkCopied);
    } catch (error) {
      toast.error(t().invoiceActions.linkCopyError);
    }
  };

  const handleSend = async () => {
    if (onSend) {
      setSending(true);
      try {
        await onSend(email, message);
      } finally {
        setSending(false);
      }
    } else {
      // Fallback: placeholder toast
      toast.info(t().invoiceActions.sendPlaceholder);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t().invoiceActions.sendInvoice}</DialogTitle>
          <DialogDescription>
            {t().invoiceActions.sendInvoiceDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">{t().invoiceActions.recipientEmail}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t().invoiceActions.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message">{t().invoiceActions.message}</Label>
            <Textarea
              id="message"
              placeholder={t().invoiceActions.messagePlaceholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
          </div>

          {/* Copy Link Section */}
          <div className="space-y-2">
            <Label>{t().invoiceActions.invoiceLink}</Label>
            <div className="flex gap-2">
              <Input
                value={invoiceUrl}
                readOnly
                className="flex-1 font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            {t().invoiceActions.cancel}
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!email || sending}
          >
            <Send className="mr-2 h-4 w-4" />
            {sending ? t().invoiceActions.markingAsIssued : t().invoiceActions.send}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
