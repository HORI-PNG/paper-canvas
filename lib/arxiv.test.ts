import { describe, expect, it } from "vitest";
import {
  ArxivNotFoundError,
  parseArxivId,
  parseArxivResponse,
} from "./arxiv";

describe("parseArxivId", () => {
  it.each([
    ["https://arxiv.org/abs/1706.03762", "1706.03762"],
    ["https://arxiv.org/abs/1706.03762v7", "1706.03762"],
    ["https://arxiv.org/pdf/1706.03762", "1706.03762"],
    ["https://arxiv.org/pdf/1706.03762v2.pdf", "1706.03762"],
    ["http://export.arxiv.org/abs/2401.00001", "2401.00001"],
    ["https://www.arxiv.org/abs/1706.03762/", "1706.03762"],
    ["arXiv:1706.03762", "1706.03762"],
    ["  1706.03762  ", "1706.03762"],
    ["0704.0001", "0704.0001"],
    ["https://arxiv.org/abs/cs/0601001", "cs/0601001"],
    ["https://arxiv.org/abs/hep-th/9901001v3", "hep-th/9901001"],
    ["math.GT/0309136", "math.GT/0309136"],
  ])("%s → %s", (input, expected) => {
    expect(parseArxivId(input)).toBe(expected);
  });

  it.each([
    "",
    "hello",
    "https://example.com/abs/1706.03762",
    "https://arxiv.org/list/cs.AI/recent",
    "abc1706.03762xyz",
    "not a url 1706.03762",
  ])("%s → null", (input) => {
    expect(parseArxivId(input)).toBeNull();
  });
});

const feed = (entry: string) =>
  `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">${entry}</feed>`;

describe("parseArxivResponse", () => {
  it("複数著者・改行を含むタイトルを整形する", () => {
    const xml = feed(`
      <entry>
        <id>http://arxiv.org/abs/1706.03762v7</id>
        <published>2017-06-12T17:57:34Z</published>
        <title>Attention Is All
          You Need</title>
        <summary>  The dominant sequence
          transduction models...  </summary>
        <author><name>Ashish Vaswani</name></author>
        <author><name>Noam Shazeer</name></author>
      </entry>`);

    expect(parseArxivResponse(xml, "1706.03762")).toEqual({
      id: "1706.03762",
      title: "Attention Is All You Need",
      authors: ["Ashish Vaswani", "Noam Shazeer"],
      year: 2017,
      abstract: "The dominant sequence transduction models...",
      url: "https://arxiv.org/abs/1706.03762",
    });
  });

  it("著者が1人でも配列で返す", () => {
    const xml = feed(`
      <entry>
        <published>2001-01-01T00:00:00Z</published>
        <title>1984</title>
        <summary>s</summary>
        <author><name>Solo Author</name></author>
      </entry>`);

    const result = parseArxivResponse(xml, "cs/0101001");
    expect(result.authors).toEqual(["Solo Author"]);
    expect(result.title).toBe("1984");
  });

  it("エントリが無ければ ArxivNotFoundError", () => {
    expect(() => parseArxivResponse(feed(""), "9999.99999")).toThrow(
      ArxivNotFoundError,
    );
  });

  it("title が Error のエントリは ArxivNotFoundError", () => {
    const xml = feed(
      `<entry><title>Error</title><summary>incorrect id format</summary></entry>`,
    );
    expect(() => parseArxivResponse(xml, "bad")).toThrow(ArxivNotFoundError);
  });
});
