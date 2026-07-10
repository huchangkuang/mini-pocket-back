import { randomNum } from "../generateNum";

describe("randomNum", () => {
  it("生成的随机数不小于开始值，不大于结束值", function () {
    for (let i = 0; i < 1000; i++) {
      const num = randomNum(i, 1000);
      expect(num).toBeLessThanOrEqual(1000 + i);
      expect(num).toBeGreaterThanOrEqual(i);
    }
  });
  it("生成的随机数覆盖范围内的所有数", function () {
    const arr = [];
    for (let i = 0; i < 1000; i++) {
      const num = randomNum(1, 100);
      if (!arr.includes(num)) {
        arr.push(num);
      }
    }
    expect(arr.length).toEqual(100);
  });
});
