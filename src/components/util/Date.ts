export function formatDate(dateString: string): string {
  return new Date(dateString).toISOString().split('T')[0];
}
