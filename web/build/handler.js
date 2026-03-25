// @bun
// src/handler.ts
import { manifest, base, prerendered } from "./server/manifest.js";
import { Server } from "./server/index.js";
import { env } from "./env.js";
import { existsSync } from "fs";

// node_modules/sirv/src/index.ts
import { resolve as resolve2 } from "path";

// node_modules/totalist/sync/index.mjs
import { join, resolve } from "path";
import { readdirSync, statSync } from "fs";
function totalist(dir, callback, pre = "") {
  dir = resolve(".", dir);
  let arr = readdirSync(dir);
  let i = 0, abs, stats;
  for (;i < arr.length; i++) {
    abs = join(dir, arr[i]);
    stats = statSync(abs);
    stats.isDirectory() ? totalist(abs, callback, join(pre, arr[i])) : callback(join(pre, arr[i]), abs, stats);
  }
}

// node_modules/mrmime/index.mjs
var mimes = {
  "3g2": "video/3gpp2",
  "3gp": "video/3gpp",
  "3gpp": "video/3gpp",
  "3mf": "model/3mf",
  aac: "audio/aac",
  ac: "application/pkix-attr-cert",
  adp: "audio/adpcm",
  adts: "audio/aac",
  ai: "application/postscript",
  aml: "application/automationml-aml+xml",
  amlx: "application/automationml-amlx+zip",
  amr: "audio/amr",
  apng: "image/apng",
  appcache: "text/cache-manifest",
  appinstaller: "application/appinstaller",
  appx: "application/appx",
  appxbundle: "application/appxbundle",
  asc: "application/pgp-keys",
  atom: "application/atom+xml",
  atomcat: "application/atomcat+xml",
  atomdeleted: "application/atomdeleted+xml",
  atomsvc: "application/atomsvc+xml",
  au: "audio/basic",
  avci: "image/avci",
  avcs: "image/avcs",
  avif: "image/avif",
  aw: "application/applixware",
  bdoc: "application/bdoc",
  bin: "application/octet-stream",
  bmp: "image/bmp",
  bpk: "application/octet-stream",
  btf: "image/prs.btif",
  btif: "image/prs.btif",
  buffer: "application/octet-stream",
  ccxml: "application/ccxml+xml",
  cdfx: "application/cdfx+xml",
  cdmia: "application/cdmi-capability",
  cdmic: "application/cdmi-container",
  cdmid: "application/cdmi-domain",
  cdmio: "application/cdmi-object",
  cdmiq: "application/cdmi-queue",
  cer: "application/pkix-cert",
  cgm: "image/cgm",
  cjs: "application/node",
  class: "application/java-vm",
  coffee: "text/coffeescript",
  conf: "text/plain",
  cpl: "application/cpl+xml",
  cpt: "application/mac-compactpro",
  crl: "application/pkix-crl",
  css: "text/css",
  csv: "text/csv",
  cu: "application/cu-seeme",
  cwl: "application/cwl",
  cww: "application/prs.cww",
  davmount: "application/davmount+xml",
  dbk: "application/docbook+xml",
  deb: "application/octet-stream",
  def: "text/plain",
  deploy: "application/octet-stream",
  dib: "image/bmp",
  "disposition-notification": "message/disposition-notification",
  dist: "application/octet-stream",
  distz: "application/octet-stream",
  dll: "application/octet-stream",
  dmg: "application/octet-stream",
  dms: "application/octet-stream",
  doc: "application/msword",
  dot: "application/msword",
  dpx: "image/dpx",
  drle: "image/dicom-rle",
  dsc: "text/prs.lines.tag",
  dssc: "application/dssc+der",
  dtd: "application/xml-dtd",
  dump: "application/octet-stream",
  dwd: "application/atsc-dwd+xml",
  ear: "application/java-archive",
  ecma: "application/ecmascript",
  elc: "application/octet-stream",
  emf: "image/emf",
  eml: "message/rfc822",
  emma: "application/emma+xml",
  emotionml: "application/emotionml+xml",
  eps: "application/postscript",
  epub: "application/epub+zip",
  exe: "application/octet-stream",
  exi: "application/exi",
  exp: "application/express",
  exr: "image/aces",
  ez: "application/andrew-inset",
  fdf: "application/fdf",
  fdt: "application/fdt+xml",
  fits: "image/fits",
  g3: "image/g3fax",
  gbr: "application/rpki-ghostbusters",
  geojson: "application/geo+json",
  gif: "image/gif",
  glb: "model/gltf-binary",
  gltf: "model/gltf+json",
  gml: "application/gml+xml",
  gpx: "application/gpx+xml",
  gram: "application/srgs",
  grxml: "application/srgs+xml",
  gxf: "application/gxf",
  gz: "application/gzip",
  h261: "video/h261",
  h263: "video/h263",
  h264: "video/h264",
  heic: "image/heic",
  heics: "image/heic-sequence",
  heif: "image/heif",
  heifs: "image/heif-sequence",
  hej2: "image/hej2k",
  held: "application/atsc-held+xml",
  hjson: "application/hjson",
  hlp: "application/winhlp",
  hqx: "application/mac-binhex40",
  hsj2: "image/hsj2",
  htm: "text/html",
  html: "text/html",
  ics: "text/calendar",
  ief: "image/ief",
  ifb: "text/calendar",
  iges: "model/iges",
  igs: "model/iges",
  img: "application/octet-stream",
  in: "text/plain",
  ini: "text/plain",
  ink: "application/inkml+xml",
  inkml: "application/inkml+xml",
  ipfix: "application/ipfix",
  iso: "application/octet-stream",
  its: "application/its+xml",
  jade: "text/jade",
  jar: "application/java-archive",
  jhc: "image/jphc",
  jls: "image/jls",
  jp2: "image/jp2",
  jpe: "image/jpeg",
  jpeg: "image/jpeg",
  jpf: "image/jpx",
  jpg: "image/jpeg",
  jpg2: "image/jp2",
  jpgm: "image/jpm",
  jpgv: "video/jpeg",
  jph: "image/jph",
  jpm: "image/jpm",
  jpx: "image/jpx",
  js: "text/javascript",
  json: "application/json",
  json5: "application/json5",
  jsonld: "application/ld+json",
  jsonml: "application/jsonml+json",
  jsx: "text/jsx",
  jt: "model/jt",
  jxl: "image/jxl",
  jxr: "image/jxr",
  jxra: "image/jxra",
  jxrs: "image/jxrs",
  jxs: "image/jxs",
  jxsc: "image/jxsc",
  jxsi: "image/jxsi",
  jxss: "image/jxss",
  kar: "audio/midi",
  ktx: "image/ktx",
  ktx2: "image/ktx2",
  less: "text/less",
  lgr: "application/lgr+xml",
  list: "text/plain",
  litcoffee: "text/coffeescript",
  log: "text/plain",
  lostxml: "application/lost+xml",
  lrf: "application/octet-stream",
  m1v: "video/mpeg",
  m21: "application/mp21",
  m2a: "audio/mpeg",
  m2t: "video/mp2t",
  m2ts: "video/mp2t",
  m2v: "video/mpeg",
  m3a: "audio/mpeg",
  m4a: "audio/mp4",
  m4p: "application/mp4",
  m4s: "video/iso.segment",
  ma: "application/mathematica",
  mads: "application/mads+xml",
  maei: "application/mmt-aei+xml",
  man: "text/troff",
  manifest: "text/cache-manifest",
  map: "application/json",
  mar: "application/octet-stream",
  markdown: "text/markdown",
  mathml: "application/mathml+xml",
  mb: "application/mathematica",
  mbox: "application/mbox",
  md: "text/markdown",
  mdx: "text/mdx",
  me: "text/troff",
  mesh: "model/mesh",
  meta4: "application/metalink4+xml",
  metalink: "application/metalink+xml",
  mets: "application/mets+xml",
  mft: "application/rpki-manifest",
  mid: "audio/midi",
  midi: "audio/midi",
  mime: "message/rfc822",
  mj2: "video/mj2",
  mjp2: "video/mj2",
  mjs: "text/javascript",
  mml: "text/mathml",
  mods: "application/mods+xml",
  mov: "video/quicktime",
  mp2: "audio/mpeg",
  mp21: "application/mp21",
  mp2a: "audio/mpeg",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  mp4a: "audio/mp4",
  mp4s: "application/mp4",
  mp4v: "video/mp4",
  mpd: "application/dash+xml",
  mpe: "video/mpeg",
  mpeg: "video/mpeg",
  mpf: "application/media-policy-dataset+xml",
  mpg: "video/mpeg",
  mpg4: "video/mp4",
  mpga: "audio/mpeg",
  mpp: "application/dash-patch+xml",
  mrc: "application/marc",
  mrcx: "application/marcxml+xml",
  ms: "text/troff",
  mscml: "application/mediaservercontrol+xml",
  msh: "model/mesh",
  msi: "application/octet-stream",
  msix: "application/msix",
  msixbundle: "application/msixbundle",
  msm: "application/octet-stream",
  msp: "application/octet-stream",
  mtl: "model/mtl",
  mts: "video/mp2t",
  musd: "application/mmt-usd+xml",
  mxf: "application/mxf",
  mxmf: "audio/mobile-xmf",
  mxml: "application/xv+xml",
  n3: "text/n3",
  nb: "application/mathematica",
  nq: "application/n-quads",
  nt: "application/n-triples",
  obj: "model/obj",
  oda: "application/oda",
  oga: "audio/ogg",
  ogg: "audio/ogg",
  ogv: "video/ogg",
  ogx: "application/ogg",
  omdoc: "application/omdoc+xml",
  onepkg: "application/onenote",
  onetmp: "application/onenote",
  onetoc: "application/onenote",
  onetoc2: "application/onenote",
  opf: "application/oebps-package+xml",
  opus: "audio/ogg",
  otf: "font/otf",
  owl: "application/rdf+xml",
  oxps: "application/oxps",
  p10: "application/pkcs10",
  p7c: "application/pkcs7-mime",
  p7m: "application/pkcs7-mime",
  p7s: "application/pkcs7-signature",
  p8: "application/pkcs8",
  pdf: "application/pdf",
  pfr: "application/font-tdpfr",
  pgp: "application/pgp-encrypted",
  pkg: "application/octet-stream",
  pki: "application/pkixcmp",
  pkipath: "application/pkix-pkipath",
  pls: "application/pls+xml",
  png: "image/png",
  prc: "model/prc",
  prf: "application/pics-rules",
  provx: "application/provenance+xml",
  ps: "application/postscript",
  pskcxml: "application/pskc+xml",
  pti: "image/prs.pti",
  qt: "video/quicktime",
  raml: "application/raml+yaml",
  rapd: "application/route-apd+xml",
  rdf: "application/rdf+xml",
  relo: "application/p2p-overlay+xml",
  rif: "application/reginfo+xml",
  rl: "application/resource-lists+xml",
  rld: "application/resource-lists-diff+xml",
  rmi: "audio/midi",
  rnc: "application/relax-ng-compact-syntax",
  rng: "application/xml",
  roa: "application/rpki-roa",
  roff: "text/troff",
  rq: "application/sparql-query",
  rs: "application/rls-services+xml",
  rsat: "application/atsc-rsat+xml",
  rsd: "application/rsd+xml",
  rsheet: "application/urc-ressheet+xml",
  rss: "application/rss+xml",
  rtf: "text/rtf",
  rtx: "text/richtext",
  rusd: "application/route-usd+xml",
  s3m: "audio/s3m",
  sbml: "application/sbml+xml",
  scq: "application/scvp-cv-request",
  scs: "application/scvp-cv-response",
  sdp: "application/sdp",
  senmlx: "application/senml+xml",
  sensmlx: "application/sensml+xml",
  ser: "application/java-serialized-object",
  setpay: "application/set-payment-initiation",
  setreg: "application/set-registration-initiation",
  sgi: "image/sgi",
  sgm: "text/sgml",
  sgml: "text/sgml",
  shex: "text/shex",
  shf: "application/shf+xml",
  shtml: "text/html",
  sieve: "application/sieve",
  sig: "application/pgp-signature",
  sil: "audio/silk",
  silo: "model/mesh",
  siv: "application/sieve",
  slim: "text/slim",
  slm: "text/slim",
  sls: "application/route-s-tsid+xml",
  smi: "application/smil+xml",
  smil: "application/smil+xml",
  snd: "audio/basic",
  so: "application/octet-stream",
  spdx: "text/spdx",
  spp: "application/scvp-vp-response",
  spq: "application/scvp-vp-request",
  spx: "audio/ogg",
  sql: "application/sql",
  sru: "application/sru+xml",
  srx: "application/sparql-results+xml",
  ssdl: "application/ssdl+xml",
  ssml: "application/ssml+xml",
  stk: "application/hyperstudio",
  stl: "model/stl",
  stpx: "model/step+xml",
  stpxz: "model/step-xml+zip",
  stpz: "model/step+zip",
  styl: "text/stylus",
  stylus: "text/stylus",
  svg: "image/svg+xml",
  svgz: "image/svg+xml",
  swidtag: "application/swid+xml",
  t: "text/troff",
  t38: "image/t38",
  td: "application/urc-targetdesc+xml",
  tei: "application/tei+xml",
  teicorpus: "application/tei+xml",
  text: "text/plain",
  tfi: "application/thraud+xml",
  tfx: "image/tiff-fx",
  tif: "image/tiff",
  tiff: "image/tiff",
  toml: "application/toml",
  tr: "text/troff",
  trig: "application/trig",
  ts: "video/mp2t",
  tsd: "application/timestamped-data",
  tsv: "text/tab-separated-values",
  ttc: "font/collection",
  ttf: "font/ttf",
  ttl: "text/turtle",
  ttml: "application/ttml+xml",
  txt: "text/plain",
  u3d: "model/u3d",
  u8dsn: "message/global-delivery-status",
  u8hdr: "message/global-headers",
  u8mdn: "message/global-disposition-notification",
  u8msg: "message/global",
  ubj: "application/ubjson",
  uri: "text/uri-list",
  uris: "text/uri-list",
  urls: "text/uri-list",
  vcard: "text/vcard",
  vrml: "model/vrml",
  vtt: "text/vtt",
  vxml: "application/voicexml+xml",
  war: "application/java-archive",
  wasm: "application/wasm",
  wav: "audio/wav",
  weba: "audio/webm",
  webm: "video/webm",
  webmanifest: "application/manifest+json",
  webp: "image/webp",
  wgsl: "text/wgsl",
  wgt: "application/widget",
  wif: "application/watcherinfo+xml",
  wmf: "image/wmf",
  woff: "font/woff",
  woff2: "font/woff2",
  wrl: "model/vrml",
  wsdl: "application/wsdl+xml",
  wspolicy: "application/wspolicy+xml",
  x3d: "model/x3d+xml",
  x3db: "model/x3d+fastinfoset",
  x3dbz: "model/x3d+binary",
  x3dv: "model/x3d-vrml",
  x3dvz: "model/x3d+vrml",
  x3dz: "model/x3d+xml",
  xaml: "application/xaml+xml",
  xav: "application/xcap-att+xml",
  xca: "application/xcap-caps+xml",
  xcs: "application/calendar+xml",
  xdf: "application/xcap-diff+xml",
  xdssc: "application/dssc+xml",
  xel: "application/xcap-el+xml",
  xenc: "application/xenc+xml",
  xer: "application/patch-ops-error+xml",
  xfdf: "application/xfdf",
  xht: "application/xhtml+xml",
  xhtml: "application/xhtml+xml",
  xhvml: "application/xv+xml",
  xlf: "application/xliff+xml",
  xm: "audio/xm",
  xml: "text/xml",
  xns: "application/xcap-ns+xml",
  xop: "application/xop+xml",
  xpl: "application/xproc+xml",
  xsd: "application/xml",
  xsf: "application/prs.xsf+xml",
  xsl: "application/xml",
  xslt: "application/xml",
  xspf: "application/xspf+xml",
  xvm: "application/xv+xml",
  xvml: "application/xv+xml",
  yaml: "text/yaml",
  yang: "application/yang",
  yin: "application/yin+xml",
  yml: "text/yaml",
  zip: "application/zip"
};
function lookup(extn) {
  let tmp = ("" + extn).trim().toLowerCase();
  let idx = tmp.lastIndexOf(".");
  return mimes[!~idx ? tmp : tmp.substring(++idx)];
}

// node_modules/sirv/src/index.ts
/*! MIT © Luke Edwards https://github.com/lukeed/sirv/blob/master/packages/sirv/index.js */
function isMatch(uri, arr) {
  for (let i = 0;i < arr.length; i++) {
    if (arr[i]?.test(uri))
      return true;
  }
}
function toAssume(uri, extns) {
  let i = 0, x, len = uri.length - 1;
  if (uri.charCodeAt(len) === 47) {
    uri = uri.substring(0, len);
  }
  const arr = [], tmp = `${uri}/index`;
  for (;i < extns.length; i++) {
    x = extns[i] ? `.${extns[i]}` : "";
    if (uri)
      arr.push(uri + x);
    arr.push(tmp + x);
  }
  return arr;
}
function viaCache(cache, uri, extns) {
  let i = 0, data, arr = toAssume(uri, extns);
  for (;i < arr.length; i++) {
    if (data = cache[arr[i]])
      return data;
  }
}
function is404(req) {
  return new Response(null, {
    status: 404,
    statusText: "404"
  });
}
function send(req, data) {
  let code = 200;
  const opts = { end: 0, start: 0 };
  if (req.headers.has("range")) {
    code = 206;
    const [x, y] = req.headers.get("range").replace("bytes=", "").split("-");
    if (x !== undefined && y !== undefined) {
      let end = opts.end = parseInt(y, 10) || data.stats.size - 1;
      const start = opts.start = parseInt(x, 10) || 0;
      if (end >= data.stats.size) {
        end = data.stats.size - 1;
      }
      if (start >= data.stats.size) {
        data.headers.set("Content-Range", `bytes */${data.stats.size}`);
        return new Response(null, {
          headers: data.headers,
          status: 416
        });
      }
      data.headers.set("Content-Range", `bytes ${start}-${end}/${data.stats.size}`);
      data.headers.set("Content-Length", (end - start + 1).toString());
      data.headers.set("Accept-Ranges", "bytes");
      return new Response(Bun.file(data.abs).slice(opts.start, opts.end + 1), {
        headers: data.headers,
        status: code
      });
    }
  }
  return new Response(Bun.file(data.abs), {
    headers: data.headers,
    status: code
  });
}
var ENCODING = {
  ".br": "br",
  ".gz": "gzip"
};
function toHeaders(name, stats, isEtag) {
  const enc = ENCODING[name.slice(-3)];
  let ctype = lookup(name.slice(0, enc ? -3 : undefined)) || "";
  if (ctype === "text/html")
    ctype += ";charset=utf-8";
  const headers = new Headers({
    "Content-Length": stats.size.toString(),
    "Content-Type": ctype,
    "Last-Modified": stats.mtime.toUTCString()
  });
  if (enc)
    headers.set("Content-Encoding", enc);
  if (isEtag)
    headers.set("ETag", `W/"${stats.size}-${stats.mtime.getTime()}"`);
  return headers;
}
function src_default(dir, opts = {}) {
  dir = resolve2(dir || ".");
  const isNotFound = opts.onNoMatch || is404;
  const setHeaders = opts.setHeaders;
  const extensions = opts.extensions || ["html", "htm"];
  const gzips = opts.gzip && extensions.map((x) => `${x}.gz`).concat("gz");
  const brots = opts.brotli && extensions.map((x) => `${x}.br`).concat("br");
  const FILES = {};
  const fallback = "/";
  const isEtag = !!opts.etag;
  const ignores = [];
  if (opts.ignores !== false) {
    ignores.push(/[/]([A-Za-z\s\d~$._-]+\.\w+){1,}$/);
    if (opts.dotfiles) {
      ignores.push(/\/\.\w/);
    } else {
      ignores.push(/\/\.well-known/);
    }
    if (opts.ignores && Array.isArray(opts.ignores)) {
      ignores.push(...opts.ignores.map((x) => new RegExp(x, "i")));
    } else if (typeof opts.ignores === "string") {
      ignores.push(new RegExp(opts.ignores, "i"));
    }
  }
  let CacheControl = opts.maxAge != null && `public,max-age=${opts.maxAge}`;
  if (CacheControl && opts.immutable)
    CacheControl += ",immutable";
  else if (CacheControl && opts.maxAge === 0)
    CacheControl += ",must-revalidate";
  totalist(dir, (name, abs, stats) => {
    if (/\.well-known[\\+/]/.test(name)) {} else if (!opts.dotfiles && /(^\.|[\\+|/+]\.)/.test(name))
      return;
    const headers = toHeaders(name, stats, isEtag);
    if (CacheControl)
      headers.set("Cache-Control", CacheControl);
    FILES["/" + name.normalize().replace(/\\+/g, "/")] = {
      abs,
      stats,
      headers
    };
  });
  const lookup2 = viaCache.bind(0, FILES);
  return (req, next) => {
    const extns = [""];
    let pathname = new URL(req.url).pathname;
    const val = req.headers.get("accept-encoding") || "";
    if (gzips && val.includes("gzip"))
      extns.unshift(...gzips);
    if (brots && /(br|brotli)/i.test(val))
      extns.unshift(...brots);
    extns.push(...extensions);
    if (pathname.indexOf("%") !== -1) {
      try {
        pathname = decodeURI(pathname);
      } catch (err) {}
    }
    let data = lookup2(pathname, extns) || isMatch(pathname, ignores) && lookup2(fallback, extns);
    if (!data)
      return next ? next() : isNotFound(req);
    if (isEtag && req.headers.get("if-none-match") === data.headers.get("ETag")) {
      return new Response(null, {
        status: 304
      });
    }
    data = {
      ...data,
      headers: new Headers(data.headers)
    };
    if (gzips || brots) {
      data.headers.set("Vary", "Accept-Encoding");
    }
    if (setHeaders) {
      data.headers = setHeaders(data.headers, pathname, data.stats);
    }
    return send(req, data);
  };
}

// src/handler.ts
var server = new Server(manifest);
var { serveAssets } = {"serveAssets":true};
var origin = env("ORIGIN", undefined);
var xff_depth = parseInt(env("XFF_DEPTH", "1"), 10);
var address_header = env("ADDRESS_HEADER", "").toLowerCase();
var protocol_header = env("PROTOCOL_HEADER", "").toLowerCase();
var host_header = env("HOST_HEADER", "").toLowerCase();
var port_header = env("PORT_HEADER", "").toLowerCase();
var asset_dir = `${import.meta.dir}/client${base}`;
await server.init({
  env: Bun.env,
  read: (file) => Bun.file(`${asset_dir}/${file}`).stream()
});
function serve(path, client = false) {
  if (existsSync(path)) {
    return src_default(path, {
      etag: true,
      gzip: true,
      brotli: true,
      setHeaders: client ? (headers, pathname) => {
        if (pathname.startsWith(`/${manifest.appDir}/immutable/`)) {
          headers.set("cache-control", "public,max-age=31536000,immutable");
        }
        return headers;
      } : undefined
    });
  }
}
function serve_prerendered() {
  const handler = serve(`${import.meta.dir}/prerendered`, false);
  return (req, next) => {
    let { pathname, search } = new URL(req.url);
    try {
      pathname = decodeURIComponent(pathname);
    } catch {}
    if (prerendered.has(pathname)) {
      return handler(req, next);
    }
    let location = pathname.at(-1) === "/" ? pathname.slice(0, -1) : pathname + "/";
    if (prerendered.has(location)) {
      if (search)
        location += search;
      return new Response(null, { status: 308, headers: { location } });
    } else {
      return next?.() || new Response(null, { status: 404 });
    }
  };
}
var ssr = async (request, bunServer) => {
  const baseOrigin = origin || get_origin(request.headers);
  const url = request.url.slice(request.url.split("/", 3).join("/").length);
  const newRequest = new Request(baseOrigin + url, request);
  return server.respond(newRequest, {
    platform: { server: bunServer, request },
    getClientAddress() {
      if (address_header) {
        if (!request.headers.has(address_header)) {
          throw new Error(`Address header was specified with ${"" + "ADDRESS_HEADER"}=${address_header} but is absent from request`);
        }
        const value = request.headers.get(address_header) || "";
        if (address_header === "x-forwarded-for") {
          const addresses = value.split(",");
          if (xff_depth < 1) {
            throw new Error(`${"" + "XFF_DEPTH"} must be a positive integer`);
          }
          if (xff_depth > addresses.length) {
            throw new Error(`${"" + "XFF_DEPTH"} is ${xff_depth}, but only found ${addresses.length} addresses`);
          }
          return addresses[addresses.length - xff_depth]?.trim() || "";
        }
        return value;
      }
      return bunServer.requestIP(request)?.address || "";
    }
  });
};
var getHandler = () => {
  const websocket = server.websocket();
  const staticHandlers = [
    serveAssets && serve(`${import.meta.dir}/client${base}`, true),
    serveAssets && serve_prerendered()
  ].filter(Boolean);
  const handler = (request, server2) => {
    function handle(i) {
      if (i < staticHandlers.length) {
        return staticHandlers[i](request, () => handle(i + 1));
      } else {
        return ssr(request, server2);
      }
    }
    return handle(0);
  };
  return {
    fetch: handler,
    websocket
  };
};
function get_origin(headers) {
  const protocol = protocol_header && headers.get(protocol_header) || "https";
  const host = host_header && headers.get(host_header) || headers.get("host");
  const port = port_header && headers.get(port_header);
  return port ? `${protocol}://${host}:${port}` : `${protocol}://${host}`;
}
export {
  getHandler
};
