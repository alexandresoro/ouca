import { type UseMutationOptions } from "@tanstack/react-query";
import { type FetchError } from "../api-types";
import useApiMutation from "../useApiMutation";

export const useApiEntryDelete = (
  mutationOptions?: Omit<UseMutationOptions<unknown, FetchError, { path?: string }>, "mutationFn">
) => {
  const { mutate, ...restUseMutation } = useApiMutation(
    {
      method: "DELETE",
    },
    { ...mutationOptions }
  );

  const mutateApi = ({ entryId }: { entryId: string }) =>
    mutate({
      path: `/entries/${entryId}`,
    });

  return { ...restUseMutation, mutate: mutateApi };
};
