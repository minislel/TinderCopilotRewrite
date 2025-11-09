export function serializeError(error: any) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: JSON.parse(JSON.stringify(error.message)),
      stack: error.stack,
      ...(error as any),
    };
  }
  return error;
}
