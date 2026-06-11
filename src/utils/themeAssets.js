const LIGHT_RULES = {
  logo: {
    dark: '/src/assets/images/logo.png',
    light: '/src/assets/images/light/logo.png',
  },
  projectCover: {
    darkSegment: '/projects/cover/',
    lightSegment: '/projects/cover/light/',
  },
}

export function toLightAsset(path, type) {
  if (!path || typeof path !== 'string') return path

  if (type === 'logo') {
    return path === LIGHT_RULES.logo.light ? path : LIGHT_RULES.logo.light
  }

  if (type === 'projectCover') {
    return path.includes(LIGHT_RULES.projectCover.lightSegment)
      ? path
      : path.replace(LIGHT_RULES.projectCover.darkSegment, LIGHT_RULES.projectCover.lightSegment)
  }

  return path
}

export function toDarkAsset(path) {
  if (!path || typeof path !== 'string') return path

  return path
    .replace(LIGHT_RULES.logo.light, LIGHT_RULES.logo.dark)
    .replace(LIGHT_RULES.projectCover.lightSegment, LIGHT_RULES.projectCover.darkSegment)
}

export function themedAsset(path, themeMode, type) {
  if (themeMode !== 'light') return path
  return toLightAsset(path, type)
}
