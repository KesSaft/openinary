import test, { after, before, suite } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import ImageTestHelper from "../../../helpers/imageTestHelper";
import TestHelper from "../../../helpers/testHelper";

interface TestCase {
  name: string;
  path: string;
  expected: {
    code: number;
    format: string | undefined;
    hash: string;
  };
}

const testCases: TestCase[] = [
  {
    name: "No Image format specified",
    path: "/t/example-loan.jpg",
    expected: {
      code: 200,
      format: "heif",
      hash: "52f291fd0e3a4d9ed50fa3414953ff563bccf540d7d5cf56de15e56b799b26ee",
    },
  },
  {
    name: "Image format PNG",
    path: "/t/f_png/example-loan.jpg",
    expected: {
      code: 200,
      format: "png",
      hash: "52873e0ecb2bf6a67fb7d662f0b5500e5434773904d5592ce8b78cd9eaa4527c",
    },
  },
  {
    name: "Image format AVIF",
    path: "/t/f_avif/example-loan.jpg",
    expected: {
      code: 200,
      format: "heif",
      hash: "52f291fd0e3a4d9ed50fa3414953ff563bccf540d7d5cf56de15e56b799b26ee",
    },
  },
  {
    name: "Image format WEBP",
    path: "/t/f_webp/example-loan.jpg",
    expected: {
      code: 200,
      format: "webp",
      hash: "03dcc8b3ed492ab78a745e7b2de48d48c612c597a50782118e1ba411a2740af4",
    },
  },
  {
    name: "Image format JPG",
    path: "/t/f_jpg/example-loan.jpg",
    expected: {
      code: 200,
      format: "jpeg",
      hash: "ddf302a59575b203fb0a2ba215afe6382552e1194b7bfa932e190cb7c417a2bf",
    },
  },
  {
    name: "Image format JPEG",
    path: "/t/f_jpeg/example-loan.jpg",
    expected: {
      code: 200,
      format: "jpeg",
      hash: "ddf302a59575b203fb0a2ba215afe6382552e1194b7bfa932e190cb7c417a2bf",
    },
  },
  {
    name: "Wrong Image format MP4",
    path: "/t/f_mp4/example-loan.jpg",
    expected: {
      code: 200,
      format: "png",
      hash: "52873e0ecb2bf6a67fb7d662f0b5500e5434773904d5592ce8b78cd9eaa4527c",
    },
  },
  {
    name: "Wrong format POP",
    path: "/t/f_pop/example-loan.jpg",
    expected: {
      code: 404,
      format: "pop",
      hash: "---",
    },
  },
];

suite("Image format tests", () => {
  for (const imageCase of testCases) {
    test(imageCase.name, async () => {
      const response = await TestHelper.APIRequest(imageCase.path);

      assert.equal(
        response.status,
        imageCase.expected.code,
        "Status code should be 200",
      );

      if (imageCase.expected.code !== 200) return;

      const contentType = response.headers.get("content-type");

      assert.ok(
        contentType?.startsWith("image/"),
        `Expected image response but got ${contentType}`,
      );

      const buffer = Buffer.from(await response.arrayBuffer());

      if (imageCase.expected.format) {
        const metadata = await sharp(buffer).metadata();

        assert.equal(
          metadata.format,
          imageCase.expected.format,
          "Format missmatch",
        );
      }

      const hash = await ImageTestHelper.getPixelHash(buffer);

      assert.equal(hash, imageCase.expected.hash, "Pixel hash mismatch");
    });
  }
});
