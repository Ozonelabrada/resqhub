import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const useApiMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, AxiosError, TVariables>
) => {
  return useMutation<TData, AxiosError, TVariables>({
    mutationFn,
    ...options,
  });
};
