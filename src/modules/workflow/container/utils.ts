export function loadScript(url: any) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export const pluginLoader = (url: any) => {
  const loadPlugin: any = memoize(loadScript);
  return (name: any) =>
    loadPlugin(`${url}/${name}.js`).then(() => window[name]);
};

export const memoize = (f: any) => {
  const cache: any = {};
  return (...args: any) => {
    const argStr = JSON.stringify(args);
    cache[argStr] = cache[argStr] || f(...args);
    return cache[argStr];
  };
};

export const stepStyles = () => {
  return {
    display: "flex",
    background: "linear-gradient(132.77deg, #FCFCFC 11.98%, #F1F1F1 111.18%)",
    border: "0.5px solid #FFFFFF",
    boxSizing: "border-box",
    boxShadow:
      "0px 2px 1px -1px rgba(180, 179, 189, 0.35), 2px 0px 1px rgba(180, 179, 189, 0.24), 0px 2px 8px rgba(180, 179, 189, 0.5), inset 1px 2px 0px #FFFFFF",
    borderRadius: "8px",
    minWidth: "30rem",
    minHeight: "12rem",
  };
};

export const outComeLabelStyles = () => {
  return {
    arrowHeadType: "arrowclosed",
    type: "custom",
    labelStyle: {
      fill: "#fff",
      fontFamily: "Poppins",
      fontStyle: "normal",
      fontWeight: "normal",
      fontSize: "1rem",
    },
    labelBgBorderRadius: 4,
    labelBgPadding: [7, 4],
    labelBgStyle: {
      fill: "#000000",
      color: "#fff !important",
      fillOpacity: 1,
    },
    style: { stroke: "#000000" },
  };
};
