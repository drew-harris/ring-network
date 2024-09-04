import { RefObject, useEffect, useState } from "react";

export const useContainerDimensions = (myRef: RefObject<HTMLDivElement>) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const getDimensions = () => ({
      width: myRef.current?.offsetWidth || 0,
      height: myRef.current?.offsetHeight || 0,
    });

    const handleResize = (entries: ResizeObserverEntry[]) => {
      if (entries[0]) {
        setDimensions(getDimensions());
      }
    };

    if (myRef.current) {
      setDimensions(getDimensions());

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(myRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [myRef]);

  return dimensions;
};
