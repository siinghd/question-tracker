import { updateLiveChatSession } from '@/actions/liveChatSession';
import { LiveChatSessionUpdateSchema } from '@/actions/liveChatSession/schema';
import { useAction } from '@/hooks/useAction';
import React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '../ui/button';

interface IProps {
  idForm: string;
  formData: z.infer<typeof LiveChatSessionUpdateSchema>;
  btnLabel: string;
}

const FormLiveSessionUpdate: React.FC<IProps> = ({
  idForm,
  formData,
  btnLabel,
}) => {
  const { execute, fieldErrors, setFieldErrors } = useAction(
    updateLiveChatSession,
    {
      onSuccess: (data) => {
        toast.success(`Session updated`);
      },
      onError: (error) => {
        toast.error(error);
      },
    },
  );
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    execute(formData);
  };

  return (
    <form id={idForm} onSubmit={handleSubmit} className="w-full">
      <Button
        className="text-gray-900 dark:text-white"
        variant="outline"
        type="submit"
      >
        {btnLabel}
      </Button>
    </form>
  );
};

export default FormLiveSessionUpdate;
