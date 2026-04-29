import { readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export async function getProjectDoc(slug: string) {
  try {
    const filePath = path.join(process.cwd(), "docs", `${slug}.md`);
    const raw = await readFile(filePath, "utf8");
    const parsed = matter(raw);

    return {
      slug,
      title:
        typeof parsed.data.title === "string"
          ? parsed.data.title
          : slug
              .split("-")
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" "),
      body: parsed.content || raw,
    };
  } catch {
    return null;
  }
}
