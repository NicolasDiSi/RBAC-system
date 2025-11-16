import { PostgrestSingleResponse } from "@supabase/supabase-js";

/**
 * Executes a Supabase query and handles the error checking in a centralized way.
 * @param queryPromise The Supabase query promise to execute.
 * @returns The data from the query promise.
 * @throws An error if the query returns an error.
 */
export async function executeQuery<T>(queryPromise: Promise<PostgrestSingleResponse<T>>): Promise<T> {
  const { data, error } = await queryPromise;

  if (error) {
    // TODO: Add logging here in the future (e.g., Sentry, LogRocket)
    throw new Error(error.message);
  }

  return data as T;
}
