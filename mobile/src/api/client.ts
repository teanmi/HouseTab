export async function requestJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, options);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      (body as { message?: string })?.message || 'Request failed',
    );
  }

  return body as T;
}
