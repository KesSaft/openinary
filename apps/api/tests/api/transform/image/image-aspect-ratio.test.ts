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
    width: number;
    height: number;
    hash: string;
  };
}

const testCases: TestCase[] = [
  {
    name: "Image original",
    path: "/t/example-loan.jpg",
    expected: {
      code: 200,
      width: 1920,
      height: 2400,
      hash: "52f291fd0e3a4d9ed50fa3414953ff563bccf540d7d5cf56de15e56b799b26ee",
    },
  },
];

suite("Image crop tests", () => {
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

      const metadata = await sharp(buffer).metadata();

      assert.equal(metadata.width, imageCase.expected.width, "Width mismatch");
      assert.equal(
        metadata.height,
        imageCase.expected.height,
        "Height mismatch",
      );

      const hash = await ImageTestHelper.getPixelHash(buffer);

      assert.equal(hash, imageCase.expected.hash, "Pixel hash mismatch");
    });
  }
});
