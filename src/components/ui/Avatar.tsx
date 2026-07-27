import * as React from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  indicator?: "online" | "offline" | "away" | null;
}

export function resolveAvatarUrl(src?: string): string | undefined {
  if (!src) return undefined;

  // Blob URLs or Base64 Data URLs (preview)
  if (src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }

  const defaultBackend = "https://beaptikatools.up.railway.app";
  const apiBase = process.env.NEXT_PUBLIC_API_URL || `${defaultBackend}/api`;
  const backendOrigin = apiBase.replace(/\/api\/?$/, "");

  // If full URL with protocol
  if (src.startsWith("http://") || src.startsWith("https://")) {
    try {
      const urlObj = new URL(src);
      // If browser is NOT on localhost, but image URL points to localhost/127.0.0.1, convert to production backend domain
      if (
        typeof window !== "undefined" &&
        !window.location.hostname.includes("localhost") &&
        !window.location.hostname.includes("127.0.0.1")
      ) {
        if (urlObj.hostname.includes("localhost") || urlObj.hostname.includes("127.0.0.1")) {
          return `${backendOrigin}${urlObj.pathname}`;
        }
      }
      return src;
    } catch (e) {
      return src;
    }
  }

  // Relative path (e.g. "avatars/xxx.jpg", "/storage/avatars/xxx.jpg")
  let cleanPath = src.startsWith("/") ? src : `/${src}`;
  if (!cleanPath.startsWith("/storage/")) {
    cleanPath = `/storage${cleanPath}`;
  }

  return `${backendOrigin}${cleanPath}`;
}

export default function Avatar({
  src,
  name = "User",
  size = "md",
  indicator = null,
  className = "",
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const resolvedSrc = React.useMemo(() => resolveAvatarUrl(src), [src]);

  React.useEffect(() => {
    setImgError(false);
  }, [src]);

  const getInitials = (userName: string) => {
    const parts = userName.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-[12px]",
    md: "w-10 h-10 text-[14px]",
    lg: "w-12 h-12 text-[16px]",
    xl: "w-16 h-16 text-[20px]",
  };

  const indicatorClasses = {
    online: "bg-emerald-500",
    offline: "bg-slate-400",
    away: "bg-amber-500",
  };

  const indicatorSizes = {
    xs: "w-1.5 h-1.5",
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3 h-3 border-2",
    xl: "w-4 h-4 border-2",
  };

  return (
    <div className={`relative inline-block rounded-full ${className}`} {...props}>
      <div
        className={`
        flex items-center justify-center rounded-full font-bold overflow-hidden select-none
        ${sizeClasses[size]}
        ${resolvedSrc && !imgError ? "bg-slate-100" : "bg-gradient-to-tr from-slate-700 to-slate-800 text-white"}
      `}
      >
        {resolvedSrc && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedSrc}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => {
              setImgError(true);
            }}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {indicator && (
        <span
          className={`
          absolute bottom-0 right-0 rounded-full border border-white
          ${indicatorClasses[indicator]}
          ${indicatorSizes[size]}
        `}
        />
      )}
    </div>
  );
}
export { Avatar };
