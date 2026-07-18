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
    name: "Image 100 roundness all around",
    path: "/t/r_100/example-loan.jpg",
    expected: {
      code: 200,
      width: 1536,
      height: 1920,
      hash: "94b6b17903267d347519a69553da05188801f7e90c16de2d4a3873b1a064ceb2",
    },
  },
  {
    name: "Image diagonal different rounded",
    path: "/t/r_40:200/example-loan.jpg",
    expected: {
      code: 200,
      width: 1536,
      height: 1920,
      hash: "63671e3197e14bad2fa67a5c3f0a9f373317cc7bf29af1e0840f1ff464210a13",
    },
  },
  {
    name: "Image three different rounded counters",
    path: "/t/r_40:120:200/example-loan.jpg",
    expected: {
      code: 200,
      width: 1536,
      height: 1920,
      hash: "513e0f4139e90ee0c257efec27337fdfc4bda2c265a50c1de05f5639291661a8",
    },
  },
  {
    name: "Image all four rounded differently",
    path: "/t/r_40:100:150:200/example-loan.jpg",
    expected: {
      code: 200,
      width: 1536,
      height: 1920,
      hash: "046a073705891be277eb45992ec547ce566ce5586adbef420c3c3eb0eb59f0e0",
    },
  },
  {
    name: "Image round max",
    path: "/t/r_max/example-loan.jpg",
    expected: {
      code: 200,
      width: 1536,
      height: 1920,
      hash: "31f25e4732d061cd8c9efd2fe12470aa72232663f81d4ad8deeeb10e558b314f",
    },
  },
  {
    name: "Image round max with red background",
    path: "/t/r_max,b_rgb:ff0000/example-loan.jpg",
    expected: {
      code: 200,
      width: 1536,
      height: 1920,
      hash: "dbac5b4a6fcab4aca147a8635fffa6b8de594df5d93b9e64a3d986b485aa4ebd",
    },
  },
  {
    name: "Image invalid roudness",
    path: "/t/r_invalid/example-loan.jpg",
    expected: {
      code: 404,
      width: 1536,
      height: 1920,
      hash: "",
    },
  },
  {
    name: "Image invalid amount roudness parameters",
    path: "/t/r_10:20:30:40:50/example-loan.jpg",
    expected: {
      code: 404,
      width: 1536,
      height: 1920,
      hash: "",
    },
  },
];

suite("Image rounded corners tests", () => {
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
