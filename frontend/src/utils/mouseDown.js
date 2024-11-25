export const handleMouseDown = (e, url) => {
  if (e.button === 1) {
    window.open(url, "_blank");
  }
};
