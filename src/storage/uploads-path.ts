import path from 'node:path';

export function getUploadsDir() {
  const configuredDir = process.env.UPLOADS_DIR?.trim();

  if (configuredDir) {
    return path.isAbsolute(configuredDir)
      ? configuredDir
      : path.resolve(process.cwd(), configuredDir);
  }

  return path.join(process.cwd(), 'uploads');
}