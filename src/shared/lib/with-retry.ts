export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  {
    retries = 3,
    delayMs = 2000,
    onError,
  }: {
    retries?: number;
    delayMs?: number;
    onError?: (error: unknown, attempt: number) => void;
  } = {},
): Promise<T> {
  const attempt = async (n: number): Promise<T> => {
    try {
      return await fn(n);
    } catch (error) {
      onError?.(error, n);

      if (n >= retries) {
        throw error;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, n * delayMs),
      );

      return attempt(n + 1);
    }
  };

  return attempt(1);
}