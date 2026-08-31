'use client';

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const DEFAULT_ZOOM = 0.1;
const MAX_ZOOM = 2;
const REFRESH_INTERVAL = 30_000;

const styles = {
  terminal: {
    position: 'fixed',
    background: '#0c0c0c',
    border: '1px solid #3a3a3a',
    boxShadow:
      '0 25px 70px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.025)',
    color: '#d4d4d4',
    fontFamily:
      '"Cascadia Code", "Cascadia Mono", Consolas, "Courier New", monospace',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },

  titleBar: {
    height: 38,
    minHeight: 38,
    display: 'flex',
    alignItems: 'center',
    background: '#181818',
    borderBottom: '1px solid #303030',
    userSelect: 'none',
  },

  titleIcon: {
    width: 40,
    textAlign: 'center',
    color: '#4ec9b0',
    fontSize: 15,
    fontWeight: 'bold',
  },

  title: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    color: '#d4d4d4',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  windowButton: {
    width: 46,
    height: '100%',
    border: 0,
    background: 'transparent',
    color: '#aaa',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 15,
    transition: 'background .12s, color .12s',
  },

  toolbar: {
    height: 34,
    minHeight: 34,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '0 8px',
    background: '#101010',
    borderBottom: '1px solid #292929',
  },

  terminalButton: {
    height: 24,
    background: '#111',
    border: '1px solid #333',
    color: '#c8c8c8',
    padding: '0 9px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 11,
  },

  statusBar: {
    height: 25,
    minHeight: 25,
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    background: '#181818',
    borderTop: '1px solid #303030',
    color: '#777',
    fontSize: 10,
  },
};

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

function getCoordinate(marker, axis) {
  if (!marker || typeof marker !== 'object') {
    return NaN;
  }

  const value =
    axis === 'x'
      ? marker.x ??
        marker.pos_x ??
        marker.longitude ??
        marker.position?.x ??
        marker.coordinates?.x
      : marker.y ??
        marker.pos_y ??
        marker.latitude ??
        marker.position?.y ??
        marker.coordinates?.y;

  return toNumber(value);
}

function getMarkerName(marker, index) {
  return (
    marker?.name ||
    marker?.base_name ||
    marker?.baseName ||
    marker?.owner_name ||
    marker?.character_name ||
    `Base ${index + 1}`
  );
}

function getMarkerArray(data) {
  if (Array.isArray(data?.markers)) {
    return data.markers;
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.rows)) {
    return data.rows;
  }

  return [];
}

function getMapConfig(data) {
  if (data?.map) {
    return data.map;
  }

  if (
    data?.maps &&
    data?.defaultMap &&
    data.maps[data.defaultMap]
  ) {
    return data.maps[data.defaultMap];
  }

  if (data?.maps) {
    const firstMap = Object.values(data.maps)[0];

    if (firstMap) {
      return firstMap;
    }
  }

  if (data?.config) {
    return data.config;
  }

  return null;
}

function getMapDimensions(mapConfig, imageSize) {
  const imageWidth = Number(imageSize?.width);
  const imageHeight = Number(imageSize?.height);

  if (
    Number.isFinite(imageWidth) &&
    Number.isFinite(imageHeight) &&
    imageWidth > 0 &&
    imageHeight > 0
  ) {
    return {
      width: imageWidth,
      height: imageHeight,
    };
  }

  return {
    width: Number(mapConfig?.width) || 0,
    height: Number(mapConfig?.height) || 0,
  };
}

function worldToMapPoint(marker, map, mapWidth, mapHeight) {
  const x = getCoordinate(marker, 'x');
  const y = getCoordinate(marker, 'y');

  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !map
  ) {
    return null;
  }

  const minX = Number(map.minX);
  const maxX = Number(map.maxX);
  const minY = Number(map.minY);
  const maxY = Number(map.maxY);

  if (
    !Number.isFinite(mapWidth) ||
    !Number.isFinite(mapHeight) ||
    mapWidth <= 0 ||
    mapHeight <= 0 ||
    !Number.isFinite(minX) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxY) ||
    maxX === minX ||
    maxY === minY
  ) {
    return null;
  }

  const normalizedX =
    (x - minX) / (maxX - minX);

  let normalizedY =
    (y - minY) / (maxY - minY);

  if (map.flipY) {
    normalizedY = 1 - normalizedY;
  }

  const px = normalizedX * mapWidth;
  const py = normalizedY * mapHeight;

  return {
    px,
    py,
    x,
    y,
    inBounds:
      px >= 0 &&
      px <= mapWidth &&
      py >= 0 &&
      py <= mapHeight,
  };
}

function mapPointToWorld(px, py, map, mapWidth, mapHeight) {
  if (!map) {
    return null;
  }

  const minX = Number(map.minX);
  const maxX = Number(map.maxX);
  const minY = Number(map.minY);
  const maxY = Number(map.maxY);

  if (
    !Number.isFinite(mapWidth) ||
    !Number.isFinite(mapHeight) ||
    mapWidth <= 0 ||
    mapHeight <= 0 ||
    !Number.isFinite(minX) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxY) ||
    maxX === minX ||
    maxY === minY
  ) {
    return null;
  }

  let normalizedY = py / mapHeight;

  if (map.flipY) {
    normalizedY = 1 - normalizedY;
  }

  return {
    x:
      minX +
      (px / mapWidth) * (maxX - minX),

    y:
      minY +
      normalizedY * (maxY - minY),
  };
}

function getMinimumZoom(mapWidth, mapHeight, frame) {
  if (
    !frame ||
    !mapWidth ||
    !mapHeight
  ) {
    return DEFAULT_ZOOM;
  }

  const availableWidth = frame.clientWidth;
  const availableHeight = frame.clientHeight;

  if (
    availableWidth <= 0 ||
    availableHeight <= 0
  ) {
    return DEFAULT_ZOOM;
  }

  return Math.min(
    availableWidth / mapWidth,
    availableHeight / mapHeight
  );
}

function clampZoom(value, minimum) {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.max(
    minimum,
    Math.min(MAX_ZOOM, value)
  );
}

function markerKey(marker, index) {
  return String(
    marker?.base_id ??
      marker?.id ??
      `base-${index}`
  );
}

export default function HaggaBasinMap() {
  const [mapConfig, setMapConfig] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [imageSize, setImageSize] = useState({
    width: 0,
    height: 0,
  });

  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [target, setTarget] = useState(null);

  const [drag, setDrag] = useState(null);

  const [windowState, setWindowState] = useState({
    x: 70,
    y: 55,
    width: 1100,
    height: 700,
    minimized: false,
    maximized: false,
  });

  const [windowDrag, setWindowDrag] = useState(null);

  const frameRef = useRef(null);
  const canvasRef = useRef(null);
  const zoomAnchorRef = useRef(null);

  const mapDimensions = useMemo(
    () =>
      getMapDimensions(
        mapConfig,
        imageSize
      ),
    [mapConfig, imageSize]
  );

  const mapWidth = mapDimensions.width;
  const mapHeight = mapDimensions.height;

  const loadMap = useCallback(
    async (signal) => {
      try {
        setLoading(true);

        const response = await fetch(
          '/api/map/markers?map=HaggaBasin',
          {
            method: 'GET',
            cache: 'no-store',
            headers: {
              Accept: 'application/json',
            },
            signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Map API returned ${response.status}`
          );
        }

        const data = await response.json();

        const map = getMapConfig(data);
        const rows = getMarkerArray(data);

        const baseRows = rows.filter(
          (marker) =>
            String(marker?.type || '')
              .trim()
              .toLowerCase() === 'base'
        );

        if (!map) {
          throw new Error(
            'Map API did not return a map configuration.'
          );
        }

        setMapConfig(map);
        setMarkers(baseRows);
        setError('');
      } catch (err) {
        if (err?.name === 'AbortError') {
          return;
        }

        setError(
          err?.message || 'Failed to load map'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let active = true;
    let controller;

    const load = () => {
      if (!active) {
        return;
      }

      controller?.abort();
      controller = new AbortController();

      void loadMap(controller.signal);
    };

    load();

    const interval = window.setInterval(
      load,
      REFRESH_INTERVAL
    );

    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(interval);
    };
  }, [loadMap]);

  const fitMap = useCallback(() => {
    const frame = frameRef.current;

    if (
      !frame ||
      !mapWidth ||
      !mapHeight
    ) {
      return;
    }

    const next = getMinimumZoom(
      mapWidth,
      mapHeight,
      frame
    );

    zoomAnchorRef.current = null;
    setZoom(next);

    requestAnimationFrame(() => {
      const currentFrame = frameRef.current;

      if (!currentFrame) {
        return;
      }

      const scaledWidth =
        mapWidth * next;

      const scaledHeight =
        mapHeight * next;

      currentFrame.scrollLeft = Math.max(
        0,
        (scaledWidth -
          currentFrame.clientWidth) /
          2
      );

      currentFrame.scrollTop = Math.max(
        0,
        (scaledHeight -
          currentFrame.clientHeight) /
          2
      );
    });
  }, [mapWidth, mapHeight]);

  useEffect(() => {
    if (
      !mapWidth ||
      !mapHeight
    ) {
      return;
    }

    const updateMinimumZoom = () => {
      const frame = frameRef.current;

      if (!frame) {
        return;
      }

      const minimum = getMinimumZoom(
        mapWidth,
        mapHeight,
        frame
      );

      setZoom((current) =>
        current < minimum
          ? minimum
          : current
      );
    };

    updateMinimumZoom();

    window.addEventListener(
      'resize',
      updateMinimumZoom
    );

    return () => {
      window.removeEventListener(
        'resize',
        updateMinimumZoom
      );
    };
  }, [mapWidth, mapHeight]);

  useLayoutEffect(() => {
    if (
      !mapWidth ||
      !mapHeight ||
      !frameRef.current
    ) {
      return;
    }

    const frame = frameRef.current;

    const centerMap = () => {
      const width =
        mapWidth * zoom;

      const height =
        mapHeight * zoom;

      frame.scrollLeft = Math.max(
        0,
        (width - frame.clientWidth) / 2
      );

      frame.scrollTop = Math.max(
        0,
        (height - frame.clientHeight) / 2
      );
    };

    requestAnimationFrame(centerMap);
  }, [mapWidth, mapHeight]);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const anchor = zoomAnchorRef.current;

    if (!frame || !anchor) {
      return;
    }

    frame.scrollLeft =
      anchor.mapX * zoom -
      anchor.viewportX;

    frame.scrollTop =
      anchor.mapY * zoom -
      anchor.viewportY;

    zoomAnchorRef.current = null;
  }, [zoom]);

  const setZoomAround = useCallback(
    (nextZoom, anchor) => {
      const frame = frameRef.current;
      const canvas = canvasRef.current;

      if (
        !frame ||
        !mapWidth ||
        !mapHeight
      ) {
        return;
      }

      const minimum = getMinimumZoom(
        mapWidth,
        mapHeight,
        frame
      );

      const next = clampZoom(
        nextZoom,
        minimum
      );

      if (next === zoom) {
        return;
      }

      const frameRect =
        frame.getBoundingClientRect();

      const canvasRect =
        canvas?.getBoundingClientRect();

      const viewportX = anchor
        ? anchor.clientX - frameRect.left
        : frame.clientWidth / 2;

      const viewportY = anchor
        ? anchor.clientY - frameRect.top
        : frame.clientHeight / 2;

      const mapX =
        anchor && canvasRect
          ? (anchor.clientX -
              canvasRect.left) /
            zoom
          : (frame.scrollLeft +
              frame.clientWidth / 2) /
            zoom;

      const mapY =
        anchor && canvasRect
          ? (anchor.clientY -
              canvasRect.top) /
            zoom
          : (frame.scrollTop +
              frame.clientHeight / 2) /
            zoom;

      zoomAnchorRef.current = {
        mapX,
        mapY,
        viewportX,
        viewportY,
      };

      setZoom(next);
    },
    [mapWidth, mapHeight, zoom]
  );

  useEffect(() => {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const handleWheel = (event) => {
      if (!canvasRef.current) {
        return;
      }

      const rect =
        canvasRef.current.getBoundingClientRect();

      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!inside) {
        return;
      }

      event.preventDefault();

      setZoomAround(
        zoom *
          (event.deltaY < 0
            ? 1.12
            : 0.88),
        {
          clientX: event.clientX,
          clientY: event.clientY,
        }
      );
    };

    frame.addEventListener(
      'wheel',
      handleWheel,
      { passive: false }
    );

    return () => {
      frame.removeEventListener(
        'wheel',
        handleWheel
      );
    };
  }, [zoom, setZoomAround]);

  const handleMouseDown = (event) => {
    if (event.button !== 0) {
      return;
    }

    if (
      event.target.closest(
        '.hag-map-marker'
      )
    ) {
      return;
    }

    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    setDrag({
      x: event.clientX,
      y: event.clientY,
      left: frame.scrollLeft,
      top: frame.scrollTop,
    });
  };

  const handleMouseMove = (event) => {
    if (
      !drag ||
      !frameRef.current
    ) {
      return;
    }

    frameRef.current.scrollLeft =
      drag.left -
      (event.clientX - drag.x);

    frameRef.current.scrollTop =
      drag.top -
      (event.clientY - drag.y);
  };

  const stopDragging = () => {
    setDrag(null);
  };

  const handleDoubleClick = (event) => {
    if (
      !mapConfig ||
      !canvasRef.current ||
      !mapWidth ||
      !mapHeight
    ) {
      return;
    }

    if (
      event.target.closest(
        '.hag-map-marker'
      )
    ) {
      return;
    }

    const rect =
      canvasRef.current.getBoundingClientRect();

    const px =
      (event.clientX - rect.left) /
      zoom;

    const py =
      (event.clientY - rect.top) /
      zoom;

    const world =
      mapPointToWorld(
        px,
        py,
        mapConfig,
        mapWidth,
        mapHeight
      );

    if (world) {
      setTarget(world);
    }
  };

  const handleWindowMouseDown = (event) => {
    if (event.button !== 0) {
      return;
    }

    if (windowState.maximized) {
      return;
    }

    setWindowDrag({
      startX: event.clientX,
      startY: event.clientY,
      startWindowX: windowState.x,
      startWindowY: windowState.y,
    });
  };

  useEffect(() => {
    if (!windowDrag) {
      return;
    }

    const move = (event) => {
      setWindowState((current) => ({
        ...current,

        x:
          windowDrag.startWindowX +
          event.clientX -
          windowDrag.startX,

        y:
          windowDrag.startWindowY +
          event.clientY -
          windowDrag.startY,
      }));
    };

    const up = () => {
      setWindowDrag(null);
    };

    window.addEventListener(
      'mousemove',
      move
    );

    window.addEventListener(
      'mouseup',
      up
    );

    return () => {
      window.removeEventListener(
        'mousemove',
        move
      );

      window.removeEventListener(
        'mouseup',
        up
      );
    };
  }, [windowDrag]);

  const toggleMaximize = () => {
    setWindowState((current) => ({
      ...current,
      maximized: !current.maximized,
      minimized: false,
    }));
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelected(null);
        return;
      }

      if (
        event.target instanceof
          HTMLInputElement ||
        event.target instanceof
          HTMLTextAreaElement
      ) {
        return;
      }

      if (
        event.key === '+' ||
        event.key === '='
      ) {
        event.preventDefault();

        setZoomAround(
          zoom * 1.18
        );
      }

      if (event.key === '-') {
        event.preventDefault();

        setZoomAround(
          zoom * 0.84
        );
      }

      if (
        event.key.toLowerCase() === 'f'
      ) {
        event.preventDefault();
        fitMap();
      }

      if (
        event.key.toLowerCase() === 'r'
      ) {
        event.preventDefault();

        const controller =
          new AbortController();

        void loadMap(
          controller.signal
        );
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [
    zoom,
    setZoomAround,
    fitMap,
    loadMap,
  ]);

  const plottedMarkers = useMemo(() => {
    if (
      !mapConfig ||
      !mapWidth ||
      !mapHeight
    ) {
      return [];
    }

    return markers
      .map((marker, index) => ({
        marker,
        index,
        point: worldToMapPoint(
          marker,
          mapConfig,
          mapWidth,
          mapHeight
        ),
      }))
      .filter(
        ({ point }) =>
          point && point.inBounds
      );
  }, [
    markers,
    mapConfig,
    mapWidth,
    mapHeight,
  ]);

  const targetPoint = useMemo(() => {
    if (
      !target ||
      !mapConfig ||
      !mapWidth ||
      !mapHeight
    ) {
      return null;
    }

    return worldToMapPoint(
      target,
      mapConfig,
      mapWidth,
      mapHeight
    );
  }, [
    target,
    mapConfig,
    mapWidth,
    mapHeight,
  ]);

  const zoomPercent =
    Math.round(zoom * 100);

  const terminalStyle = {
    ...styles.terminal,

    left: windowState.maximized
      ? 0
      : windowState.x,

    top: windowState.maximized
      ? 0
      : windowState.y,

    width: windowState.maximized
      ? '100vw'
      : `min(${windowState.width}px, calc(100vw - 30px))`,

    height: windowState.maximized
      ? '100vh'
      : `min(${windowState.height}px, calc(100vh - 30px))`,

    zIndex: 100,

    borderRadius:
      windowState.maximized
        ? 0
        : 6,
  };

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at center, #151515 0%, #070707 65%, #030303 100%)',
        color: '#d4d4d4',
        fontFamily:
          '"Cascadia Code", "Cascadia Mono", Consolas, "Courier New", monospace',
      }}
    >
      {!windowState.minimized && (
        <div style={terminalStyle}>
          <div
            onMouseDown={
              handleWindowMouseDown
            }
            onDoubleClick={
              toggleMaximize
            }
            style={{
              ...styles.titleBar,

              cursor:
                windowState.maximized
                  ? 'default'
                  : windowDrag
                    ? 'grabbing'
                    : 'grab',
            }}
          >
            <div
              style={styles.titleIcon}
            >
              ▸_
            </div>

            <div
              style={styles.title}
            >
              HAGGA BASIN — LIVE MAP
            </div>

            <button
              type="button"
              title="Minimize"
              style={
                styles.windowButton
              }
              onMouseDown={(event) =>
                event.stopPropagation()
              }
              onClick={() =>
                setWindowState(
                  (current) => ({
                    ...current,
                    minimized: true,
                  })
                )
              }
              onMouseEnter={(event) => {
                event.currentTarget.style.background =
                  '#333';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background =
                  'transparent';
              }}
            >
              −
            </button>

            <button
              type="button"
              title="Maximize"
              style={
                styles.windowButton
              }
              onMouseDown={(event) =>
                event.stopPropagation()
              }
              onClick={
                toggleMaximize
              }
              onMouseEnter={(event) => {
                event.currentTarget.style.background =
                  '#333';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background =
                  'transparent';
              }}
            >
              {windowState.maximized
                ? '❐'
                : '□'}
            </button>

            <button
              type="button"
              title="Close"
              style={{
                ...styles.windowButton,
                color: '#aaa',
              }}
              onMouseDown={(event) =>
                event.stopPropagation()
              }
              onClick={() => {
                window.location.href =
                  '/portal';
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background =
                  '#c42b1c';

                event.currentTarget.style.color =
                  '#fff';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background =
                  'transparent';

                event.currentTarget.style.color =
                  '#aaa';
              }}
            >
              ×
            </button>
          </div>

          <div
            style={styles.toolbar}
          >
            <span
              style={{
                color: '#4ec9b0',
                fontSize: 11,
                marginRight: 5,
              }}
            >
              C:\HAGGA\MAP&gt;
            </span>

            <button
              type="button"
              style={
                styles.terminalButton
              }
              onClick={() =>
                setZoomAround(
                  zoom * 0.84
                )
              }
            >
              −
            </button>

            <span
              style={{
                minWidth: 62,
                textAlign: 'center',
                fontSize: 10,
                color: '#7fdbca',
              }}
            >
              ZOOM {zoomPercent}%
            </span>

            <button
              type="button"
              style={
                styles.terminalButton
              }
              onClick={() =>
                setZoomAround(
                  zoom * 1.18
                )
              }
            >
              +
            </button>

            <button
              type="button"
              style={
                styles.terminalButton
              }
              onClick={fitMap}
            >
              FIT
            </button>

            <button
              type="button"
              style={
                styles.terminalButton
              }
              onClick={() => {
                const controller =
                  new AbortController();

                void loadMap(
                  controller.signal
                );
              }}
            >
              REFRESH
            </button>

            <span
              style={{
                marginLeft: 'auto',
                color: '#555',
                fontSize: 10,
              }}
            >
              F=FIT&nbsp;&nbsp;
              R=REFRESH&nbsp;&nbsp;
              +/-=ZOOM&nbsp;&nbsp;
              ESC=CLOSE
            </span>
          </div>

          <div
            ref={frameRef}
            className="hag-map-frame"
            onMouseDown={
              handleMouseDown
            }
            onMouseMove={
              handleMouseMove
            }
            onMouseUp={
              stopDragging
            }
            onMouseLeave={
              stopDragging
            }
            onDoubleClick={
              handleDoubleClick
            }
            style={{
              position: 'relative',
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
              cursor: drag
                ? 'grabbing'
                : 'grab',
              background: '#050505',
              scrollbarWidth: 'thin',
              scrollbarColor:
                '#333 #090909',
            }}
          >
            {mapConfig ? (
              <div
                ref={canvasRef}
                style={{
                  position: 'relative',

                  width:
                    mapWidth * zoom,

                  height:
                    mapHeight * zoom,

                  flexShrink: 0,
                }}
              >
                <img
                  src="/images/maps/hagga-basin.png"
                  alt={
                    mapConfig?.label ||
                    'Hagga Basin'
                  }
                  draggable={false}
                  onLoad={(event) => {
                    const img =
                      event.currentTarget;

                    setImageSize({
                      width:
                        img.naturalWidth,
                      height:
                        img.naturalHeight,
                    });
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    userSelect: 'none',
                    pointerEvents: 'none',
                    objectFit: 'fill',
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    backgroundImage:
                      'linear-gradient(rgba(78,201,176,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(78,201,176,.035) 1px, transparent 1px)',
                    backgroundSize:
                      `${Math.max(
                        25,
                        100 * zoom
                      )}px ${Math.max(
                        25,
                        100 * zoom
                      )}px`,
                  }}
                />

                {targetPoint && (
                  <span
                    style={{
                      position: 'absolute',

                      left:
                        targetPoint.px *
                        zoom,

                      top:
                        targetPoint.py *
                        zoom,

                      width: 22,
                      height: 22,

                      transform:
                        'translate(-50%, -50%)',

                      border:
                        '1px solid #4ec9b0',

                      borderRadius: '50%',

                      boxShadow:
                        '0 0 0 4px rgba(78,201,176,.12), 0 0 18px rgba(78,201,176,.8)',

                      pointerEvents: 'none',
                      zIndex: 10,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: -8,
                        width: 1,
                        height: 38,
                        background:
                          'rgba(78,201,176,.7)',
                        transform:
                          'translateX(-50%)',
                      }}
                    />

                    <span
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: -8,
                        width: 38,
                        height: 1,
                        background:
                          'rgba(78,201,176,.7)',
                        transform:
                          'translateY(-50%)',
                      }}
                    />
                  </span>
                )}

                {plottedMarkers.map(
                  ({
                    marker,
                    index,
                    point,
                  }) => {
                    const name =
                      getMarkerName(
                        marker,
                        index
                      );

                    const key =
                      markerKey(
                        marker,
                        index
                      );

                    const iconSize =
                      Math.max(
                        22,
                        Math.min(
                          42,
                          34 * zoom
                        )
                      );

                    return (
                      <button
                        key={key}
                        type="button"
                        className="hag-map-marker"
                        onClick={(event) => {
                          event.stopPropagation();

                          setSelected(
                            marker
                          );
                        }}
                        title={`${name} — X: ${point.x.toFixed(
                          0
                        )}, Y: ${point.y.toFixed(
                          0
                        )}`}
                        style={{
                          position:
                            'absolute',

                          left:
                            point.px *
                            zoom,

                          top:
                            point.py *
                            zoom,

                          transform:
                            'translate(-50%, -50%)',

                          width: Math.max(
                            100,
                            iconSize + 20
                          ),

                          minHeight:
                            iconSize + 24,

                          padding: 0,
                          margin: 0,
                          border: 0,
                          outline: 'none',

                          background:
                            'transparent',

                          color: '#d4d4d4',
                          cursor: 'pointer',
                          textAlign: 'center',

                          display: 'flex',
                          flexDirection:
                            'column',

                          alignItems:
                            'center',

                          justifyContent:
                            'center',

                          zIndex: 5,
                        }}
                      >
                        <span
                          style={{
                            width:
                              iconSize,

                            height:
                              iconSize,

                            display: 'flex',

                            alignItems:
                              'center',

                            justifyContent:
                              'center',

                            flexShrink: 0,
                          }}
                        >
                          <img
                            src="/map-icons/Base.webp"
                            alt={name}
                            draggable={false}
                            style={{
                              width:
                                iconSize,

                              height:
                                iconSize,

                              display: 'block',

                              objectFit:
                                'contain',

                              filter:
                                'drop-shadow(0 2px 5px rgba(0,0,0,.9))',

                              userSelect:
                                'none',

                              pointerEvents:
                                'none',
                            }}
                          />
                        </span>

                        <span
                          style={{
                            display: 'block',
                            maxWidth: 180,
                            overflow: 'hidden',
                            textOverflow:
                              'ellipsis',

                            background:
                              'rgba(8,8,8,.94)',

                            border:
                              '1px solid #3a3a3a',

                            borderRadius: 0,

                            padding:
                              '2px 6px',

                            marginTop: 2,

                            color: '#d4d4d4',

                            fontSize:
                              '0.7rem',

                            lineHeight: '1.1',

                            whiteSpace:
                              'nowrap',

                            boxShadow:
                              '0 2px 8px rgba(0,0,0,.7)',

                            pointerEvents:
                              'none',
                          }}
                        >
                          {name}
                        </span>

                        {marker?.owner_name && (
                          <span
                            style={{
                              display:
                                'block',

                              maxWidth: 180,

                              overflow:
                                'hidden',

                              textOverflow:
                                'ellipsis',

                              marginTop: 1,

                              color: '#777',

                              fontSize:
                                '0.6rem',

                              lineHeight:
                                '1.1',

                              whiteSpace:
                                'nowrap',

                              pointerEvents:
                                'none',
                            }}
                          >
                            {
                              marker.owner_name
                            }
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            ) : (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  placeItems: 'center',
                  color: '#666',
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      color: '#4ec9b0',
                      marginBottom: 8,
                    }}
                  >
                    C:\HAGGA\MAP&gt;
                  </div>

                  {loading
                    ? 'Loading map...'
                    : 'Map unavailable'}
                </div>
              </div>
            )}
          </div>

          {selected && (
            <div
              style={{
                position: 'absolute',
                right: 14,
                bottom: 39,
                width: 285,
                background:
                  'rgba(12,12,12,.97)',
                border: '1px solid #444',
                boxShadow:
                  '0 10px 30px rgba(0,0,0,.8)',
                zIndex: 30,
                fontFamily: 'inherit',
              }}
            >
              <div
                style={{
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 8px',
                  background: '#1b1b1b',
                  borderBottom:
                    '1px solid #333',
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontSize: 11,
                    color: '#4ec9b0',
                  }}
                >
                  BASE_INFO.EXE
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setSelected(null)
                  }
                  style={{
                    border: 0,
                    background:
                      'transparent',
                    color: '#888',
                    cursor: 'pointer',
                    fontFamily:
                      'inherit',
                    fontSize: 14,
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  padding: 12,
                  fontSize: 11,
                  lineHeight: 1.7,
                }}
              >
                <div
                  style={{
                    color: '#d4d4d4',
                    fontSize: 13,
                    marginBottom: 8,
                  }}
                >
                  {getMarkerName(
                    selected,
                    0
                  )}
                </div>

                <div>
                  <span
                    style={{
                      color: '#666',
                    }}
                  >
                    TYPE:
                  </span>{' '}
                  {selected.type ||
                    'Base'}
                </div>

                <div>
                  <span
                    style={{
                      color: '#666',
                    }}
                  >
                    ID:
                  </span>{' '}
                  {selected.id ||
                    selected.base_id ||
                    '—'}
                </div>

                <div>
                  <span
                    style={{
                      color: '#666',
                    }}
                  >
                    X:
                  </span>{' '}
                  {getCoordinate(
                    selected,
                    'x'
                  )}
                </div>

                <div>
                  <span
                    style={{
                      color: '#666',
                    }}
                  >
                    Y:
                  </span>{' '}
                  {getCoordinate(
                    selected,
                    'y'
                  )}
                </div>

                <div>
                  <span
                    style={{
                      color: '#666',
                    }}
                  >
                    OWNER:
                  </span>{' '}
                  {selected.owner_name ||
                    'Unknown'}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                position: 'absolute',
                left: 12,
                top: 84,
                maxWidth: 400,
                padding: '7px 10px',
                background:
                  'rgba(30,8,8,.95)',
                border:
                  '1px solid #632d2d',
                color: '#e07070',
                fontSize: 10,
                zIndex: 40,
              }}
            >
              ERROR: {error}
            </div>
          )}

          <div
            style={styles.statusBar}
          >
            <span
              style={{
                color: '#4ec9b0',
              }}
            >
              ● LIVE
            </span>

            <span
              style={{
                marginLeft: 14,
              }}
            >
              BASES: {markers.length}
            </span>

            <span
              style={{
                marginLeft: 14,
              }}
            >
              MAP:{' '}
              {mapWidth && mapHeight
                ? `${mapWidth}×${mapHeight}`
                : '---'}
            </span>

            {target && (
              <span
                style={{
                  marginLeft: 14,
                  color: '#7fdbca',
                }}
              >
                TARGET: X:
                {Math.round(target.x)}{' '}
                Y:
                {Math.round(target.y)}
              </span>
            )}

            <span
              style={{
                marginLeft: 'auto',
              }}
            >
              SYNC: 30s
            </span>
          </div>
        </div>
      )}

      {windowState.minimized && (
        <button
          type="button"
          onClick={() =>
            setWindowState(
              (current) => ({
                ...current,
                minimized: false,
              })
            )
          }
          style={{
            position: 'fixed',
            left: 15,
            bottom: 15,
            zIndex: 200,
            height: 36,
            padding: '0 15px',
            background: '#181818',
            border: '1px solid #3a3a3a',
            color: '#d4d4d4',
            boxShadow:
              '0 10px 30px rgba(0,0,0,.7)',
            cursor: 'pointer',
            fontFamily:
              '"Cascadia Code", Consolas, monospace',
            fontSize: 11,
          }}
        >
          <span
            style={{
              color: '#4ec9b0',
              marginRight: 8,
            }}
          >
            ▸_
          </span>

          HAGGA BASIN — LIVE MAP
        </button>
      )}

      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }

        * {
          box-sizing: border-box;
        }

        button {
          -webkit-tap-highlight-color: transparent;
        }

        .hag-map-frame::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .hag-map-frame::-webkit-scrollbar-track {
          background: #090909;
        }

        .hag-map-frame::-webkit-scrollbar-thumb {
          background: #333;
          border: 2px solid #090909;
        }

        .hag-map-frame::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        .hag-map-marker:hover
          span:first-child
          img {
          filter:
            drop-shadow(
              0 0 5px
                rgba(78, 201, 176, 0.8)
            )
            drop-shadow(
              0 2px 5px
                rgba(0, 0, 0, 0.9)
            );
        }

        @media (max-width: 700px) {
          .hag-map-frame {
            cursor: grab;
          }
        }
      `}</style>
    </main>
  );
}