export const MASTER_DRIVE_FOLDER_ID = "10idSQEP8yefEYlT5qqF0LcsyCfjXEvMH";
export const MASTER_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${MASTER_DRIVE_FOLDER_ID}`;

/**
 * Returns a Google Drive search URL that opens Google Drive and searches/filters specifically
 * for the requested employee CV folder or name, highlighting only that requested record.
 */
export function getEmployeeDriveSearchUrl(employeeName: string, employeeId?: string): string {
  if (!employeeName) return MASTER_DRIVE_FOLDER_URL;
  const cleanName = employeeName.trim();
  const query = encodeURIComponent(`"${cleanName}"`);
  return `https://drive.google.com/drive/search?q=${query}`;
}
