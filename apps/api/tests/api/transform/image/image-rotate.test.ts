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
    name: "Image without rotating",
    path: "/t/example-loan.jpg",
    expected: {
      code: 200,
      width: 1920,
      height: 2400,
      hash: "52f291fd0e3a4d9ed50fa3414953ff563bccf540d7d5cf56de15e56b799b26ee",
    },
  },
  {
    name: "Image rotated 90°",
    path: "/t/a_90/example-loan.jpg",
    expected: {
      code: 200,
      width: 2400,
      height: 1920,
      hash: "cecca16b72f3d7cee4dd89acdf7b103d58cc2c2a658f90fc852af2bf9f94a509",
    },
  },
  {
    name: "Image rotated -90°",
    path: "/t/a_-90/example-loan.jpg",
    expected: {
      code: 200,
      width: 2400,
      height: 1920,
      hash: "34f58e5b192cbaa6ffe441455b1b080dedac547d5c9a8beed14a899cfff1808f",
    },
  },
  {
    name: "Image rotated automatically",
    path: "/t/a_auto/example-loan.jpg",
    expected: {
      code: 200,
      width: 1920,
      height: 2400,
      hash: "52f291fd0e3a4d9ed50fa3414953ff563bccf540d7d5cf56de15e56b799b26ee",
    },
  },
  {
    name: "Image rotated 810° => 90°",
    path: "/t/a_810/example-loan.jpg",
    expected: {
      code: 200,
      width: 2400,
      height: 1920,
      hash: "cecca16b72f3d7cee4dd89acdf7b103d58cc2c2a658f90fc852af2bf9f94a509",
    },
  },
  {
    name: "Image rotated 50°",
    path: "/t/a_50/example-loan.jpg",
    expected: {
      code: 200,
      width: 3073,
      height: 3013,
      hash: "3d24025044517d0bdb29914bc6e91c772f059980f80420067c042b29d15ac924",
    },
  },
  {
    name: "Invalid image rotation",
    path: "/t/a_left/example-loan.jpg",
    expected: {
      code: 404,
      width: 3073,
      height: 3013,
      hash: "---",
    },
  },
];

suite("Image rotation tests", () => {
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
