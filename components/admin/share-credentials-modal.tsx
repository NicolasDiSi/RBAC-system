'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,  DialogContent,  DialogDescription,  DialogFooter,  DialogHeader,  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { countries } from '@/lib/data/countries'
import { toast } from 'sonner'
import { createShareToken } from '@/app/actions/shareToken'

interface ShareCredentialsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function ShareCredentialsModal({ isOpen, onClose, userId }: ShareCredentialsModalProps) {
  const [duration, setDuration] = useState('24h') // Default to 24 hours
  const [region, setRegion] = useState('US')
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone); // Default to user's local timezone
  const [isLoading, setIsLoading] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)

  const handleGenerateLink = async () => {
    setIsLoading(true);
    setShareLink(null);

    try {
      // The action now returns an object with the raw token: { token: string }
      const { token } = await createShareToken(userId, duration, region, timezone);
      const link = `${window.location.origin}/share/${token}`;
      setShareLink(link);
    } catch (error) {
      console.error('Failed to generate share link:', error);
      toast.error('Failed to generate share link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Credentials</DialogTitle>
          <DialogDescription>
            Generate a secure, temporary link to share this user's credentials.
          </DialogDescription>
        </DialogHeader>

        {!shareLink ? (
          <div className="space-y-4 py-4">
            <Field>
              <FieldLabel>Link Duration</FieldLabel>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="8h">8 Hours</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Region Scope</FieldLabel>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Timezone</FieldLabel>
              <Input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g., America/New_York"
              />
            </Field>
          </div>
        ) : (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">Your secure link is ready:</p>
            <div className="mt-2 flex items-center space-x-2 rounded-md bg-muted p-2">
              <Input type="text" readOnly value={shareLink} className="flex-1" />
              <Button onClick={copyToClipboard} size="sm">Copy</Button>
            </div>
            <p className="mt-2 text-xs text-destructive">
              This link will expire and is only accessible from the selected region.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {!shareLink && (
            <Button onClick={handleGenerateLink} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Link'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
