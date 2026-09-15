/**
 * Determines the single best active menu path given the current pathname/searchParams and all registered menu paths.
 * Prioritizes exact matches, and falls back to longest prefix matching for dynamic nested routes.
 */
export function getActiveMenuPath(
  pathname: string,
  allMenuPaths: string[],
  searchParamsStr?: string
): string | null {
  if (!pathname || !allMenuPaths || allMenuPaths.length === 0) return null;

  const currentFullUrl = searchParamsStr ? `${pathname}?${searchParamsStr}` : pathname;

  // 1. Exact match with query params if any menu path defines query params
  if (searchParamsStr) {
    const exactQueryMatch = allMenuPaths.find((path) => path === currentFullUrl);
    if (exactQueryMatch) return exactQueryMatch;
  }

  // 2. Exact match with clean pathname
  const cleanPathname = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  
  const exactPathMatch = allMenuPaths.find((path) => {
    const cleanPath = path.split('?')[0];
    const normalized = cleanPath.endsWith('/') && cleanPath.length > 1 ? cleanPath.slice(0, -1) : cleanPath;
    return normalized === cleanPathname;
  });
  if (exactPathMatch) return exactPathMatch;

  // 3. Longest prefix match (for detail views / nested sub-routes not explicitly defined in the sidebar)
  // Example: /modules/news/edit/10 -> matches /modules/news
  const matchingPrefixes = allMenuPaths
    .filter((path) => {
      const cleanPath = path.split('?')[0];
      if (cleanPath === '/' || !cleanPath) return false;
      return cleanPathname.startsWith(cleanPath + '/');
    })
    .sort((a, b) => b.split('?')[0].length - a.split('?')[0].length);

  if (matchingPrefixes.length > 0) {
    return matchingPrefixes[0];
  }

  // 4. Root fallback
  if (cleanPathname === '/' && allMenuPaths.includes('/')) {
    return '/';
  }

  return null;
}

/**
 * Checks if a specific href matches the determined active path.
 */
export function isPathActive(href: string, activePath: string | null | undefined): boolean {
  if (!href || !activePath) return false;
  return href === activePath;
}

