export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const dns = await import("dns");

  type LookupCallback = (
    err: NodeJS.ErrnoException | null,
    address: string | { address: string; family: number }[],
    family?: number,
  ) => void;

  const originalLookup = dns.lookup;
  const patchedLookup = function (
    hostname: string,
    optionsOrCb: unknown,
    callback?: LookupCallback,
  ) {
    let options = optionsOrCb;
    let cb = callback;
    if (typeof optionsOrCb === "function") {
      cb = optionsOrCb as LookupCallback;
      options = {};
    }
    if (typeof options === "number") options = { family: options };
    options = (options ?? {}) as Record<string, unknown>;

    if (typeof hostname === "string" && hostname.endsWith(".amazonaws.com")) {
      const family = (options as { family?: number }).family;
      if (family === undefined || family === 0) {
        (options as { family?: number }).family = 4;
      }
    }

    return (originalLookup as unknown as (
      ...args: unknown[]
    ) => unknown).call(dns, hostname, options, cb);
  };
  (dns as unknown as { lookup: typeof patchedLookup }).lookup = patchedLookup;

  const dnsPromises = dns.promises;
  const originalPromisesLookup = dnsPromises.lookup.bind(dnsPromises);
  const patchedPromisesLookup = async function (
    hostname: string,
    options?: unknown,
  ) {
    let opts = options;
    if (typeof opts === "number") opts = { family: opts };
    opts = (opts ?? {}) as Record<string, unknown>;

    if (typeof hostname === "string" && hostname.endsWith(".amazonaws.com")) {
      const family = (opts as { family?: number }).family;
      if (family === undefined || family === 0) {
        (opts as { family?: number }).family = 4;
      }
    }

    return (originalPromisesLookup as unknown as (
      ...args: unknown[]
    ) => Promise<unknown>)(hostname, opts);
  };
  (dnsPromises as unknown as { lookup: typeof patchedPromisesLookup }).lookup =
    patchedPromisesLookup;
}
