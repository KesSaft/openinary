import sharp from "sharp";
import crypto from "node:crypto";

export default class ImageTestHelper {
  static async getPixelHash(buffer: Buffer<ArrayBufferLike>): Promise<string> {
    const rawPixels = await sharp(buffer).ensureAlpha().raw().toBuffer();

    return crypto.createHash("sha256").update(rawPixels).digest("hex");
  }
}
