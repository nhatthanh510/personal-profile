import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const companiesDir = path.join(__dirname, "..", "public", "companies");
const outPath = path.join(__dirname, "..", "src", "windows", "gallery", "galleryData.ts");

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function walk(dir, base = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const result = [];
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) {
      result.push(...walk(path.join(dir, e.name), rel));
    } else if (IMAGE_EXT.has(path.extname(e.name).toLowerCase())) {
      result.push(rel);
    }
  }
  return result;
}

function pathToTitle(filePath) {
  const name = path.basename(filePath, path.extname(filePath));
  return name
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function companyToTitle(companyKey) {
  return companyKey
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

if (!fs.existsSync(companiesDir)) {
  fs.writeFileSync(
    outPath,
    `export interface GalleryImage {
  id: string;
  src: string;
  title: string;
}

export interface GalleryCompanyGroup {
  company: string;
  title: string;
  images: GalleryImage[];
}

export const galleryGroups: GalleryCompanyGroup[] = [];
export const galleryImages: GalleryImage[] = [];
`
  );
  console.log("Gallery images generated: 0 (no companies folder)");
  process.exit(0);
}

const relativePaths = walk(companiesDir).sort();
const byCompany = new Map();

for (const rel of relativePaths) {
  const segs = rel.split(path.sep);
  if (segs.length < 2) continue;
  const companyKey = segs[0];
  const pathUrl = `/companies/${rel.replace(path.sep, "/")}`;
  const item = { path: pathUrl, title: pathToTitle(rel) };
  if (!byCompany.has(companyKey)) {
    byCompany.set(companyKey, []);
  }
  byCompany.get(companyKey).push(item);
}

const companiesGroups = [];
let globalIndex = 0;
for (const [companyKey, items] of [...byCompany.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const images = items.map((item, i) => ({
    id: `companies-${globalIndex + i}-${item.path.replace(/\//g, "-")}`,
    src: item.path,
    title: item.title,
  }));
  globalIndex += images.length;
  companiesGroups.push({
    company: companyKey,
    title: companyToTitle(companyKey),
    images,
  });
}

const groupsJson = JSON.stringify(companiesGroups, null, 2).replace(/"([^"]+)":/g, "$1:");

const ts = `export interface GalleryImage {
  id: string;
  src: string;
  title: string;
}

export interface GalleryCompanyGroup {
  company: string;
  title: string;
  images: GalleryImage[];
}

// Auto-generated from public/companies – run: node scripts/generate-gallery-images.js
const companiesGroups: GalleryCompanyGroup[] = ${groupsJson};

export const galleryGroups = companiesGroups;
export const galleryImages: GalleryImage[] = companiesGroups.flatMap((g) => g.images);
`;

fs.writeFileSync(outPath, ts);
console.log("Gallery images generated:", globalIndex, "in", companiesGroups.length, "companies");