export default class TestHelper {
  static API_BASEURL = `http://localhost:${process.env.PORT || 3000}`;

  static async APIRequest(
    path: string,
    options: RequestInit = {},
  ): Promise<Response> {
    return await fetch(`${TestHelper.API_BASEURL}${path}`, {
      ...options,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
        ...options.headers,
      },
    });
  }
}
