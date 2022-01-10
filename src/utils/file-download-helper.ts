export const downloadFile = (resourcePath: string, fileName: string): void => {
  const temporaryA = document.createElement("a");
  temporaryA.href = resourcePath;
  temporaryA.download = fileName;

  temporaryA.click();

  temporaryA.remove();
};
