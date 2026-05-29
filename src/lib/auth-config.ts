export function isAuthConfigured() {
  return Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET && process.env.NEXTAUTH_SECRET);
}