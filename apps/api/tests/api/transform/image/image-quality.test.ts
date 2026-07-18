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
  {
    name: "Image 100% quality",
    path: "/t/q_100/example-loan.jpg",
    expected: {
      code: 200,
      width: 1920,
      height: 2400,
      hash: "0658bb2efaf48d7b91f54afa1ee4caec422af190e790c1b3525ce03ebf77077a", // original
    },
  },
  {
    name: "Image 80% quality",
    path: "/t/q_80/example-loan.jpg",
    expected: {
      code: 200,
      width: 1920,
      height: 2400,
      hash: "52f291fd0e3a4d9ed50fa3414953ff563bccf540d7d5cf56de15e56b799b26ee",
    },
  },
  {
    name: "Image 20% quality",
    path: "/t/q_20/example-loan.jpg",
    expected: {
      code: 200,
      width: 1920,
      height: 2400,
      hash: "2a94b09e55cb39d6fb8dd170d50124cdbbc8d40de16e69d8e58b82ac938db47c",
    },
  },
  {
    name: "Image 1% quality",
    path: "/t/q_1/example-loan.jpg",
    expected: {
      code: 200,
      width: 1920,
      height: 2400,
      hash: "bdcd344f9513a1d6e8480703c0ee13fe807c804cf97b1a18194821748f9805dc",
    },
  },
  {
    name: "Image 0% quality",
    path: "/t/q_0/example-loan.jpg",
    expected: {
      code: 200,
      width: 1920,
      height: 2400,
      hash: "52f291fd0e3a4d9ed50fa3414953ff563bccf540d7d5cf56de15e56b799b26ee", // original
    },
  },
  {
    name: "Image 101% quality",
    path: "/t/q_101/example-loan.jpg",
    expected: {
      code: 200,
      width: 1920,
      height: 2400,
      hash: "52f291fd0e3a4d9ed50fa3414953ff563bccf540d7d5cf56de15e56b799b26ee", // original
    },
  },
  {
    name: "Image invalid quality",
    path: "/t/q_invalid/example-loan.jpg",
    expected: {
      code: 404,
      width: 1920,
      height: 2400,
      hash: "---",
    },
  },
];

suite("Image quality tests", () => {
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
