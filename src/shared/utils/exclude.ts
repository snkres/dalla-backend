export function exclude<T, Key extends keyof T>(
  user: Record<any, any>,
  keys: Key[],
): Omit<T, Key> {
  const filteredEntries = Object.entries(user).filter(
    ([key]) => !keys.includes(key as Key),
  );
  const excludedObject: any = {};

  for (const [key, value] of filteredEntries) {
    excludedObject[key] = value;
  }

  return excludedObject;
}
