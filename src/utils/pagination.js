export const pagination = (size, page) => {
    if (!size || size <= 0) {
      size = 3;
    }
    if (!page || page <= 0) {
      page = 1;
    }
    const skip = (parseInt(page) - 1) * parseInt(size);
    return { skip, limit: size };
  };
  