export const downloadFile = (url: string, fileName: string): void => {
  const temporaryA = document.createElement("a");
  temporaryA.href = `${url}${fileName ? `?filename=${fileName}` : ""}`;
  temporaryA.download = fileName;

  temporaryA.click();

  temporaryA.remove();
};
