export const downloadFile = (resourcePath: string, fileName: string): void => {
  const temporaryA = document.createElement("a");
  temporaryA.href = `${process.env.REACT_APP_API_URL ?? ""}${resourcePath}${fileName ? "?filename=" + fileName : ""}`;
  temporaryA.download = fileName;

  temporaryA.click();

  temporaryA.remove();
};
