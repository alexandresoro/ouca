export const downloadFile = (url: string, resourcePath: string, fileName: string): void => {
  const temporaryA = document.createElement("a");
  temporaryA.href = `${url}${resourcePath}${fileName ? "?filename=" + fileName : ""}`;
  temporaryA.download = fileName;

  temporaryA.click();

  temporaryA.remove();
};
