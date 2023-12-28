'use client';

import { createLiveChatSession } from '@/actions/liveChatSession';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAction } from '@/hooks/useAction';
import { toast } from 'sonner';
import { FormSubmit } from './form/form-submit';
import { FormErrors } from './form/form-errors';
import { useState } from 'react';

export function NewLiveChatSession() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { execute, fieldErrors, setFieldErrors } = useAction(
    createLiveChatSession,
    {
      onSuccess: (data) => {
        toast.success(
          `Session created and it's active now, session id: ${data.id}`,
        );
        setDialogOpen((prev) => !prev);
      },
      onError: (error) => {
        toast.error(error);
      },
    },
  );
  const handleLiveSessionCreationSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    console.log(event.currentTarget);
    const formData = new FormData(event.currentTarget);
    console.log(JSON.stringify(formData));
    const title = formData.get('title')?.toString() || '';
    console.log(title, formData);
    execute({ title });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Start Chat</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start new live chat session</DialogTitle>
        </DialogHeader>
        <form id="livechatSession" onSubmit={handleLiveSessionCreationSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" name="title" className="col-span-3" />
            </div>
            <FormErrors errors={fieldErrors} id="title" />
          </div>

          <DialogFooter>
            <FormSubmit>Create</FormSubmit>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
