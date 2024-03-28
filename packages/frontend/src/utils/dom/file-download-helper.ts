export const downloadBlob = (blob: Blob, fileName: string): void => {
  const blobUrl = URL.createObjectURL(blob);

  downloadFile(blobUrl, fileName, false);
};

export const downloadFile = (url: string, fileName: string, nameInHref = true): void => {
  const temporaryA = document.createElement("a");
  temporaryA.href = `${url}${fileName && nameInHref ? `?filename=${fileName}` : ""}`;
  temporaryA.download = fileName;

  temporaryA.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    }),
  );

  temporaryA.remove();
};
