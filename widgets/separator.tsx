export const HSeparator = () => {
  const css = `
    min-height: 1px;
    background-color: var(--border-color);
    border-radius: 9999px;
  `;

  return <box css={css} hexpand={true} />;
};

export const VSeparator = () => {
  const css = `
    min-width: 1px;
    background-color: var(--border-color);
    border-radius: 9999px;
  `;

  return <box css={css} vexpand={true} />;
};
